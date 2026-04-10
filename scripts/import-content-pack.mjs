#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const RELATIONSHIP_TYPES = [
  'requires',
  'used_in',
  'explains',
  'related_to',
  'application_of',
  'leads_to',
];

const QUESTION_TYPES = [
  'multiple_choice',
  'short_answer',
  'matching',
  'applied_scenario',
];

const contentPackSchema = z.object({
  $schema: z.string().optional(),
  format: z.literal('knowledge-nexus/content-pack'),
  version: z.literal(1),
  metadata: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    author: z.string().optional(),
    updated_at: z.string().optional(),
  }),
  subjects: z.array(z.object({
    key: z.string().min(1),
    name: z.string().min(1),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    description: z.string().optional(),
    icon: z.string().optional(),
  })).default([]),
  nodes: z.array(z.object({
    key: z.string().min(1),
    title: z.string().min(1),
    slug: z.string().min(1).optional(),
    subject: z.string().optional().nullable(),
    topic: z.string().optional().nullable(),
    description: z.string().min(1),
    why_it_matters: z.string().optional().nullable(),
    use_cases: z.array(z.string()).default([]),
    difficulty: z.number().int().min(1).max(10).default(1),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }).optional(),
  })).default([]),
  edges: z.array(z.object({
    source: z.string().min(1),
    target: z.string().min(1),
    relationship_type: z.enum(RELATIONSHIP_TYPES),
  })).default([]),
  prerequisites: z.array(z.object({
    node: z.string().min(1),
    prerequisite: z.string().min(1),
  })).default([]),
  tests: z.array(z.object({
    node: z.string().min(1),
    title: z.string().min(1),
    instructions: z.string().optional().nullable(),
    passing_score: z.number().int().min(0).max(100).default(70),
    questions: z.array(z.object({
      question_type: z.enum(QUESTION_TYPES),
      prompt: z.string().min(1),
      explanation: z.string().optional().nullable(),
      order_index: z.number().int().min(0).optional(),
      options: z.array(z.object({
        option_text: z.string().min(1),
        is_correct: z.boolean(),
        order_index: z.number().int().min(0).optional(),
      })).default([]),
    })).min(1),
  })).default([]),
});

function printUsage() {
  console.log('Usage:');
  console.log('  npm run import:pack -- <path-to-pack.json>');
  console.log('  npm run import:pack:dry -- <path-to-pack.json>');
  console.log('');
  console.log('Examples:');
  console.log('  npm run import:pack -- content-packs/examples/science-foundations.v1.json');
  console.log('  npm run import:pack:dry -- content-packs/examples/science-foundations.v1.json');
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const help = args.includes('--help') || args.includes('-h');
  const positional = args.filter((arg) => !arg.startsWith('--'));

  return {
    dryRun,
    help,
    filePath: positional[0] || null,
  };
}

function loadEnvIntoProcess(rootDir) {
  for (const fileName of ['.env.local', '.env']) {
    const fullPath = path.join(rootDir, fileName);
    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) {
        continue;
      }

      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) {
        continue;
      }

      const key = line.slice(0, equalIndex).trim();
      if (!key || process.env[key]) {
        continue;
      }

      let value = line.slice(equalIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function ensureUnique(items, getKey, label) {
  const seen = new Set();
  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) {
      throw new Error(`Duplicate ${label}: ${key}`);
    }
    seen.add(key);
  }
}

function resolveSubjectId(subjectRef, packSubjectIds, existingSubjectsByName) {
  if (!subjectRef) {
    return null;
  }

  if (packSubjectIds.has(subjectRef)) {
    return packSubjectIds.get(subjectRef);
  }

  if (existingSubjectsByName.has(subjectRef)) {
    return existingSubjectsByName.get(subjectRef).id;
  }

  throw new Error(`Unknown subject reference: ${subjectRef}`);
}

function resolveNodeRecord(nodeRef, packNodesByKey, packNodesBySlug, existingNodesBySlug) {
  const normalizedRef = nodeRef.startsWith('slug:') ? nodeRef.slice(5) : nodeRef;

  if (packNodesByKey.has(normalizedRef)) {
    return packNodesByKey.get(normalizedRef);
  }

  if (packNodesBySlug.has(normalizedRef)) {
    return packNodesBySlug.get(normalizedRef);
  }

  if (existingNodesBySlug.has(normalizedRef)) {
    return existingNodesBySlug.get(normalizedRef);
  }

  throw new Error(`Unknown node reference: ${nodeRef}`);
}

async function fetchAllSubjects(supabase) {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, color, description, icon');

  if (error) {
    throw new Error(`Failed to fetch subjects: ${error.message}`);
  }

  return new Map((data || []).map((subject) => [subject.name, subject]));
}

async function fetchAllNodes(supabase) {
  const { data, error } = await supabase
    .from('nodes')
    .select('id, slug, title, subject_id, position_x, position_y');

  if (error) {
    throw new Error(`Failed to fetch nodes: ${error.message}`);
  }

  return new Map((data || []).map((node) => [node.slug, node]));
}

async function upsertSubject(supabase, subject, dryRun) {
  if (dryRun) {
    return { id: `dry-subject:${subject.key}`, name: subject.name };
  }

  const { data, error } = await supabase
    .from('subjects')
    .upsert({
      name: subject.name,
      color: subject.color,
      description: subject.description ?? null,
      icon: subject.icon ?? null,
    }, { onConflict: 'name' })
    .select('id, name')
    .single();

  if (error || !data) {
    throw new Error(`Failed to upsert subject "${subject.name}": ${error?.message || 'unknown error'}`);
  }

  return data;
}

async function upsertNode(supabase, node, subjectId, existingNode, dryRun) {
  const slug = node.slug || slugify(node.title);
  const positionX = node.position?.x ?? existingNode?.position_x ?? 0;
  const positionY = node.position?.y ?? existingNode?.position_y ?? 0;

  if (dryRun) {
    return {
      id: existingNode?.id || `dry-node:${slug}`,
      slug,
      title: node.title,
      subject_id: subjectId,
      position_x: positionX,
      position_y: positionY,
    };
  }

  const { data, error } = await supabase
    .from('nodes')
    .upsert({
      slug,
      title: node.title,
      subject_id: subjectId,
      topic: node.topic ?? null,
      description: node.description,
      why_it_matters: node.why_it_matters ?? null,
      use_cases: node.use_cases ?? [],
      difficulty: node.difficulty,
      position_x: positionX,
      position_y: positionY,
    }, { onConflict: 'slug' })
    .select('id, slug, title, subject_id, position_x, position_y')
    .single();

  if (error || !data) {
    throw new Error(`Failed to upsert node "${node.title}": ${error?.message || 'unknown error'}`);
  }

  return data;
}

async function upsertEdge(supabase, sourceNodeId, targetNodeId, relationshipType, dryRun) {
  if (dryRun) {
    return;
  }

  const { error } = await supabase
    .from('edges')
    .upsert({
      source_node_id: sourceNodeId,
      target_node_id: targetNodeId,
      relationship_type: relationshipType,
    }, { onConflict: 'source_node_id,target_node_id,relationship_type' });

  if (error) {
    throw new Error(`Failed to upsert edge ${sourceNodeId} -> ${targetNodeId}: ${error.message}`);
  }
}

async function upsertPrerequisite(supabase, nodeId, prerequisiteNodeId, dryRun) {
  if (dryRun) {
    return;
  }

  const { error } = await supabase
    .from('prerequisites')
    .upsert({
      node_id: nodeId,
      prerequisite_node_id: prerequisiteNodeId,
    }, { onConflict: 'node_id,prerequisite_node_id' });

  if (error) {
    throw new Error(`Failed to upsert prerequisite ${prerequisiteNodeId} -> ${nodeId}: ${error.message}`);
  }
}

async function replaceTestForNode(supabase, test, nodeId, dryRun) {
  if (dryRun) {
    return;
  }

  const { data: existingTests, error: existingTestsError } = await supabase
    .from('mastery_tests')
    .select('id')
    .eq('node_id', nodeId)
    .order('created_at', { ascending: true });

  if (existingTestsError) {
    throw new Error(`Failed to fetch existing tests for node ${nodeId}: ${existingTestsError.message}`);
  }

  if ((existingTests || []).length > 1) {
    throw new Error(`Node ${nodeId} has multiple mastery tests. Clean up duplicates before importing.`);
  }

  let testId;
  const existingTest = existingTests?.[0] || null;

  if (existingTest) {
    // Preserve the existing test row so historical mastery_attempts remain intact.
    const { error: updateTestError } = await supabase
      .from('mastery_tests')
      .update({
        title: test.title,
        instructions: test.instructions ?? null,
        passing_score: test.passing_score,
      })
      .eq('id', existingTest.id);

    if (updateTestError) {
      throw new Error(`Failed to update test "${test.title}": ${updateTestError.message}`);
    }

    const { error: deleteQuestionsError } = await supabase
      .from('mastery_questions')
      .delete()
      .eq('mastery_test_id', existingTest.id);

    if (deleteQuestionsError) {
      throw new Error(`Failed to clear existing questions for node ${nodeId}: ${deleteQuestionsError.message}`);
    }

    testId = existingTest.id;
  } else {
    const { data: createdTest, error: testError } = await supabase
      .from('mastery_tests')
      .insert({
        node_id: nodeId,
        title: test.title,
        instructions: test.instructions ?? null,
        passing_score: test.passing_score,
      })
      .select('id')
      .single();

    if (testError || !createdTest) {
      throw new Error(`Failed to create test "${test.title}": ${testError?.message || 'unknown error'}`);
    }

    testId = createdTest.id;
  }

  for (let questionIndex = 0; questionIndex < test.questions.length; questionIndex += 1) {
    const question = test.questions[questionIndex];
    const { data: createdQuestion, error: questionError } = await supabase
      .from('mastery_questions')
      .insert({
        mastery_test_id: testId,
        question_type: question.question_type,
        prompt: question.prompt,
        explanation: question.explanation ?? null,
        order_index: question.order_index ?? questionIndex + 1,
      })
      .select('id')
      .single();

    if (questionError || !createdQuestion) {
      throw new Error(`Failed to create question for test "${test.title}": ${questionError?.message || 'unknown error'}`);
    }

    if (question.options.length === 0) {
      continue;
    }

    const { error: optionError } = await supabase
      .from('mastery_question_options')
      .insert(
        question.options.map((option, optionIndex) => ({
          question_id: createdQuestion.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          order_index: option.order_index ?? optionIndex + 1,
        }))
      );

    if (optionError) {
      throw new Error(`Failed to create question options for test "${test.title}": ${optionError.message}`);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help || !args.filePath) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  const rootDir = process.cwd();
  loadEnvIntoProcess(rootDir);

  const filePath = path.resolve(rootDir, args.filePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Content pack not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsedJson = JSON.parse(raw);
  const pack = contentPackSchema.parse(parsedJson);

  ensureUnique(pack.subjects, (subject) => subject.key, 'subject key');
  ensureUnique(pack.subjects, (subject) => subject.name, 'subject name');
  ensureUnique(pack.nodes, (node) => node.key, 'node key');
  ensureUnique(pack.nodes, (node) => node.slug || slugify(node.title), 'node slug');
  ensureUnique(pack.tests, (test) => test.node, 'test node reference');

  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const existingSubjectsByName = await fetchAllSubjects(supabase);
  const existingNodesBySlug = await fetchAllNodes(supabase);

  const packSubjectIds = new Map();
  const packNodesByKey = new Map();
  const packNodesBySlug = new Map();

  for (const node of pack.nodes) {
    if (!node.subject) {
      continue;
    }

    const isPackSubject = pack.subjects.some((subject) => subject.key === node.subject);
    const isExistingSubject = existingSubjectsByName.has(node.subject);
    if (!isPackSubject && !isExistingSubject) {
      throw new Error(`Node "${node.key}" references unknown subject "${node.subject}"`);
    }
  }

  console.log(`[content-pack] ${args.dryRun ? 'Dry run' : 'Import'}: ${pack.metadata.title}`);
  console.log(`[content-pack] File: ${filePath}`);

  for (const subject of pack.subjects) {
    const importedSubject = await upsertSubject(supabase, subject, args.dryRun);
    packSubjectIds.set(subject.key, importedSubject.id);
    existingSubjectsByName.set(subject.name, importedSubject);
  }

  for (const node of pack.nodes) {
    const slug = node.slug || slugify(node.title);
    const subjectId = resolveSubjectId(node.subject ?? null, packSubjectIds, existingSubjectsByName);
    const existingNode = existingNodesBySlug.get(slug) || null;
    const importedNode = await upsertNode(supabase, node, subjectId, existingNode, args.dryRun);

    packNodesByKey.set(node.key, importedNode);
    packNodesBySlug.set(importedNode.slug, importedNode);
    existingNodesBySlug.set(importedNode.slug, importedNode);
  }

  for (const edge of pack.edges) {
    const sourceNode = resolveNodeRecord(edge.source, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    const targetNode = resolveNodeRecord(edge.target, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    await upsertEdge(supabase, sourceNode.id, targetNode.id, edge.relationship_type, args.dryRun);
  }

  for (const prerequisite of pack.prerequisites) {
    const node = resolveNodeRecord(prerequisite.node, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    const prerequisiteNode = resolveNodeRecord(prerequisite.prerequisite, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    await upsertPrerequisite(supabase, node.id, prerequisiteNode.id, args.dryRun);
  }

  for (const test of pack.tests) {
    const node = resolveNodeRecord(test.node, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    await replaceTestForNode(supabase, test, node.id, args.dryRun);
  }

  console.log('[content-pack] Completed successfully.');
  console.log(`[content-pack] Subjects: ${pack.subjects.length}`);
  console.log(`[content-pack] Nodes: ${pack.nodes.length}`);
  console.log(`[content-pack] Edges: ${pack.edges.length}`);
  console.log(`[content-pack] Prerequisites: ${pack.prerequisites.length}`);
  console.log(`[content-pack] Tests: ${pack.tests.length}`);
}

main().catch((error) => {
  console.error(`[content-pack] Import failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
