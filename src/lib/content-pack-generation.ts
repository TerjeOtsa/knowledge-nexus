import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { contentPackJsonSchema, contentPackSchema, type ContentPack } from '@/lib/content-pack';

const DEFAULT_GENERATION_MODEL = process.env.OPENAI_GENERATE_MODEL || 'gpt-5';
const MAX_SOURCE_CHARS = 60000;
const MAX_EXISTING_NODE_REFERENCES = 400;

export interface ExistingSubjectSnapshot {
  name: string;
  description?: string | null;
}

export interface ExistingNodeSnapshot {
  slug: string;
  title: string;
  subject_name?: string | null;
}

export interface PreparedSourceDocument {
  sourceType: 'url' | 'text';
  title: string;
  url?: string;
  text: string;
  charCount: number;
  truncated: boolean;
}

const CONTENT_PACK_GENERATION_INSTRUCTIONS = `You are generating a Knowledge Nexus content pack JSON for import into an existing learning graph system.

PHASE 1 — READ AND MAP THE MATERIAL (do this mentally before generating JSON)
Before writing any JSON, read the entire source document and build an internal map:
1. Identify the top-level domain(s) the material covers — these become subjects.
2. For each subject, identify the major divisions or units in the document — these become topic labels.
3. For each topic, identify every distinct idea, skill, term, rule, or mechanism — these become concept nodes.
4. For each concept node, note what other concepts it requires and what it leads to.
5. For each concept node, formulate what a learner must be able to answer or do to prove mastery.

Only after building this map do you produce the final JSON output.

PHASE 2 — OUTPUT RULES
- Output exactly one valid JSON object and nothing else.
- The JSON must match this schema shape exactly:
  - format: "knowledge-nexus/content-pack"
  - version: 1
  - metadata
  - subjects
  - nodes
  - edges
  - prerequisites
  - tests
- Do not output explanations, markdown, comments, or code fences.

GRAPH HIERARCHY — mirror this structure from the source material:
  Subject (top-level domain)
    └── Topic (major unit or section — the "topic" field on each node)
          └── Concept nodes (atomic, learnable ideas within that topic)

Rules:
- If a concept clearly belongs to an already-existing subject from the database snapshot, use that existing subject name instead of creating a new subject.
- If no suitable subject exists, create a new subject in subjects.
- Every node must have a topic label that reflects the section or unit it belongs to in the source.
- Prefer smaller, atomic concepts over giant umbrella nodes.
- Only include relationships that are strongly supported by the documents.
- Do not hallucinate. If the source does not cover something, omit it.

SUBJECTS
- Each new subject must have:
  - key: short kebab-case string
  - name: human-readable subject name
  - color: valid hex color like "#3b82f6"
  - description: short subject summary
  - icon: 1 emoji if appropriate
- If an existing subject already fits, do not add it to subjects.

NODES
- Each node must have:
  - key: unique kebab-case identifier within this pack
  - title: concise concept title (e.g. "Newton's Second Law", not "Physics")
  - slug: kebab-case stable slug
  - subject: either a subject key from this pack or the exact name of an existing subject from the snapshot
  - topic: the section/unit label this concept belongs to (used for grouping in the graph)
  - description: 1-3 sentence learning-focused explanation — what is this concept and how does it work?
  - why_it_matters: 1-2 sentence practical value statement
  - use_cases: 2-5 concrete examples of where or how this concept is applied
  - difficulty: integer from 1 to 10
- Do not create duplicate nodes.
- Omit position unless explicitly asked.

Difficulty scale:
  1-2 = introductory vocabulary and basic definitions
  3-4 = foundational operational concepts
  5-6 = intermediate synthesis and multi-step understanding
  7-8 = advanced reasoning and application
  9-10 = expert-level or highly abstract topics

EDGES
- Allowed relationship_type values: requires, used_in, explains, related_to, application_of, leads_to
- Only add edges when the relationship is strong and directly supported by the source.
- Source and target reference node keys from this pack.

PREREQUISITES
- node is the dependent concept, prerequisite is what must come first.
- Only add pairs where the ordering is necessary for understanding.

TESTS — REQUIRED FOR EVERY NODE
- Every concept node must have a mastery test. Do not omit tests.
- Each test must have a minimum of 4 questions.
- Prefer a mix of question types per test: at least 2 multiple_choice and 1 short_answer.
- Question quality rules:
  - Questions must test real understanding, not trivial recall of wording.
  - Multiple choice: write 4 options, exactly 1 correct, distractors must be plausible but clearly wrong on reflection.
  - Short answer: ask the learner to explain, describe, or apply — not just define.
  - applied_scenario: present a real-world situation and ask how the concept applies.
  - Include an explanation field on every question to help learners understand why answers are correct.
- passing_score: 70 (default)
- Test title: "{Node Title} — Mastery Check"
- Instructions: one sentence telling the learner what to demonstrate.

QUALITY RULES
- Follow the document structure: units/sections in the source become topic labels in the graph.
- Preserve a coherent learning progression — foundational concepts first, advanced later.
- Each topic cluster should have 3–10 nodes unless the material is genuinely narrow.
- Do not create nodes with vague titles ("Miscellaneous", "Overview", "Introduction") — instead, title nodes by their specific concept.`;

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeWhitespace(text: string) {
  return text
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripHtmlToText(html: string) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? normalizeWhitespace(decodeHtmlEntities(titleMatch[1])) : 'Online Article';

  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ');

  const blockTagPattern = /<\/?(article|section|main|aside|div|p|br|li|ul|ol|h1|h2|h3|h4|h5|h6|table|tr|td|blockquote)[^>]*>/gi;
  const text = normalizeWhitespace(
    decodeHtmlEntities(
      withoutNoise
        .replace(blockTagPattern, '\n')
        .replace(/<[^>]+>/g, ' ')
    )
  );

  return { title, text };
}

function truncateSourceText(text: string) {
  const normalized = normalizeWhitespace(text);
  if (normalized.length <= MAX_SOURCE_CHARS) {
    return {
      text: normalized,
      charCount: normalized.length,
      truncated: false,
    };
  }

  return {
    text: `${normalized.slice(0, MAX_SOURCE_CHARS)}\n\n[Truncated after ${MAX_SOURCE_CHARS} characters for generation.]`,
    charCount: normalized.length,
    truncated: true,
  };
}

function isPrivateIpv4(address: string) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase();
  return (
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  );
}

async function assertSafeRemoteUrl(parsed: URL) {
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '0.0.0.0' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('Local or private network URLs are not supported.');
  }

  const resolvedAddresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true, verbatim: true });

  for (const entry of resolvedAddresses) {
    const address = entry.address;
    if (isPrivateIpv4(address) || isPrivateIpv6(address)) {
      throw new Error('Local or private network URLs are not supported.');
    }
  }
}

export async function prepareSourceDocument(input: { url?: string; documentText?: string }) {
  if (input.url?.trim()) {
    const parsed = new URL(input.url.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Only http and https URLs are supported.');
    }

    await assertSafeRemoteUrl(parsed);

    const response = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Knowledge-Nexus/1.0 (+https://knowledge-nexus.local)',
        'Accept': 'text/html,text/plain;q=0.9,*/*;q=0.5',
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Could not fetch the article URL. Received ${response.status}.`);
    }

    const raw = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const extracted = contentType.includes('html')
      ? stripHtmlToText(raw)
      : { title: parsed.hostname, text: normalizeWhitespace(raw) };
    const truncated = truncateSourceText(extracted.text);

    if (!truncated.text) {
      throw new Error('The fetched article did not contain enough readable text.');
    }

    return {
      sourceType: 'url',
      title: extracted.title || parsed.hostname,
      url: parsed.toString(),
      text: truncated.text,
      charCount: truncated.charCount,
      truncated: truncated.truncated,
    } satisfies PreparedSourceDocument;
  }

  const inputText = input.documentText?.trim();
  if (!inputText) {
    throw new Error('Provide either an article URL or pasted document text.');
  }

  const truncated = truncateSourceText(inputText);
  return {
    sourceType: 'text',
    title: 'Pasted Document',
    text: truncated.text,
    charCount: truncated.charCount,
    truncated: truncated.truncated,
  } satisfies PreparedSourceDocument;
}

function buildSubjectSnapshot(subjects: ExistingSubjectSnapshot[]) {
  if (subjects.length === 0) {
    return '- No existing subjects in database.';
  }

  return subjects
    .map((subject) => `- ${subject.name}${subject.description ? `: ${subject.description}` : ''}`)
    .join('\n');
}

function buildNodeSnapshot(nodes: ExistingNodeSnapshot[]) {
  if (nodes.length === 0) {
    return '- No existing node slugs provided.';
  }

  return nodes
    .slice(0, MAX_EXISTING_NODE_REFERENCES)
    .map((node) => `- ${node.slug} (${node.title}${node.subject_name ? ` | ${node.subject_name}` : ''})`)
    .join('\n');
}

function buildGenerationPrompt(source: PreparedSourceDocument, subjects: ExistingSubjectSnapshot[], nodes: ExistingNodeSnapshot[]) {
  return `${CONTENT_PACK_GENERATION_INSTRUCTIONS}

Output format example:
{
  "$schema": "../schema/content-pack.v1.schema.json",
  "format": "knowledge-nexus/content-pack",
  "version": 1,
  "metadata": {
    "id": "replace-with-pack-id",
    "title": "Replace With Pack Title",
    "description": "Short description",
    "author": "AI-generated from provided documents",
    "updated_at": "YYYY-MM-DD"
  },
  "subjects": [],
  "nodes": [],
  "edges": [],
  "prerequisites": [],
  "tests": []
}

Now follow Phase 1 (read and map the material), then output the full JSON as described above.

EXISTING SUBJECTS IN DATABASE:
${buildSubjectSnapshot(subjects)}

OPTIONAL EXISTING NODE SLUGS IN DATABASE:
${buildNodeSnapshot(nodes)}

SOURCE TYPE:
${source.sourceType}

SOURCE TITLE:
${source.title}

SOURCE URL:
${source.url || 'N/A'}

SOURCE DOCUMENT:
${source.text}

Remember: Every concept node must have a mastery test with at least 4 questions. Return only the final JSON object.`;
}

const CONTENT_PACK_REFINEMENT_INSTRUCTIONS = `You are refining an existing Knowledge Nexus content pack based on user feedback.

You will receive:
1. The original source material
2. The current content pack JSON (already generated)
3. Specific feedback from the user describing what to change

Your job:
- Read the feedback carefully and apply it precisely
- Keep everything that already works — do not remove good nodes, edges, or tests unless the feedback targets them
- If the feedback asks to split a topic, create new atomic nodes for the sub-concepts and remove the overly broad one
- If the feedback asks for better questions on a specific node, rewrite or add questions for that node while leaving others intact
- If the feedback targets a single node by name, focus changes there and leave the rest of the pack untouched
- Every concept node must still have a mastery test with at least 4 questions after your changes
- Maintain all required JSON fields and schema structure
- Do not output explanations, markdown, comments, or code fences — only valid JSON`;

function buildRefinementPrompt(
  source: PreparedSourceDocument,
  previousPack: ContentPack,
  feedback: string,
  subjects: ExistingSubjectSnapshot[],
  nodes: ExistingNodeSnapshot[],
) {
  return `${CONTENT_PACK_REFINEMENT_INSTRUCTIONS}

EXISTING SUBJECTS IN DATABASE:
${buildSubjectSnapshot(subjects)}

OPTIONAL EXISTING NODE SLUGS IN DATABASE:
${buildNodeSnapshot(nodes)}

SOURCE TYPE:
${source.sourceType}

SOURCE TITLE:
${source.title}

SOURCE URL:
${source.url || 'N/A'}

SOURCE DOCUMENT:
${source.text}

CURRENT CONTENT PACK (refine this):
${JSON.stringify(previousPack, null, 2)}

USER FEEDBACK:
${feedback}

Apply the feedback. Keep what works. Every concept node must have a mastery test with at least 4 questions. Return only the final JSON object.`;
}

export async function generateRefinedContentPack(params: {
  source: PreparedSourceDocument;
  previousPack: ContentPack;
  feedback: string;
  existingSubjects: ExistingSubjectSnapshot[];
  existingNodes: ExistingNodeSnapshot[];
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Add it to your environment before using Generate.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_GENERATION_MODEL,
      input: buildRefinementPrompt(params.source, params.previousPack, params.feedback, params.existingSubjects, params.existingNodes),
      text: {
        format: {
          type: 'json_schema',
          name: 'knowledge_nexus_content_pack',
          strict: true,
          schema: contentPackJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI refinement failed: ${response.status} ${errorText}`);
  }

  const responseJson = await response.json() as Record<string, unknown>;
  const outputText = extractResponseText(responseJson);
  if (!outputText) {
    throw new Error('The model did not return a refined content pack.');
  }

  const parsed = JSON.parse(outputText);
  return contentPackSchema.parse(parsed) as ContentPack;
}

function extractResponseText(responseJson: Record<string, unknown>) {
  if (typeof responseJson.output_text === 'string' && responseJson.output_text.trim()) {
    return responseJson.output_text.trim();
  }

  const output = Array.isArray(responseJson.output) ? responseJson.output : [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = Array.isArray((item as { content?: unknown[] }).content) ? (item as { content: unknown[] }).content : [];
    for (const chunk of content) {
      if (!chunk || typeof chunk !== 'object') continue;
      const text = (chunk as { text?: string }).text;
      if (typeof text === 'string' && text.trim()) {
        return text.trim();
      }
    }
  }

  return null;
}

export async function generateContentPackFromSource(params: {
  source: PreparedSourceDocument;
  existingSubjects: ExistingSubjectSnapshot[];
  existingNodes: ExistingNodeSnapshot[];
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Add it to your environment before using Generate.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_GENERATION_MODEL,
      input: buildGenerationPrompt(params.source, params.existingSubjects, params.existingNodes),
      text: {
        format: {
          type: 'json_schema',
          name: 'knowledge_nexus_content_pack',
          strict: true,
          schema: contentPackJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI generation failed: ${response.status} ${errorText}`);
  }

  const responseJson = await response.json() as Record<string, unknown>;
  const outputText = extractResponseText(responseJson);
  if (!outputText) {
    throw new Error('The model did not return a structured content pack.');
  }

  const parsed = JSON.parse(outputText);
  return contentPackSchema.parse(parsed) as ContentPack;
}
