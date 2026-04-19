import { createServerClient } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import { contentPackSchema, type ContentPack } from '@/lib/content-pack';

interface SubjectRecord {
  id: string;
  name: string;
  color: string;
  description?: string | null;
  icon?: string | null;
}

interface NodeRecord {
  id: string;
  slug: string;
  title: string;
  subject_id?: string | null;
  position_x: number;
  position_y: number;
}

export interface ImportContentPackOptions {
  pack: ContentPack;
  createdBy?: string | null;
  nexusId?: string | null;
}

export interface ImportContentPackResult {
  importedSubjects: number;
  importedNodes: number;
  importedEdges: number;
  importedPrerequisites: number;
  importedTests: number;
}

function ensureUnique<T>(items: T[], getKey: (item: T) => string, label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) {
      throw new Error(`Duplicate ${label}: ${key}`);
    }
    seen.add(key);
  }
}

async function fetchAllSubjects() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, color, description, icon');

  if (error) {
    throw new Error(`Failed to fetch subjects: ${error.message}`);
  }

  return new Map((data || []).map((subject) => [subject.name, subject as SubjectRecord]));
}

async function fetchAllNodes() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('nodes')
    .select('id, slug, title, subject_id, position_x, position_y');

  if (error) {
    throw new Error(`Failed to fetch nodes: ${error.message}`);
  }

  return new Map((data || []).map((node) => [node.slug, node as NodeRecord]));
}

function resolveSubjectId(
  subjectRef: string | null | undefined,
  packSubjectIds: Map<string, string>,
  existingSubjectsByName: Map<string, SubjectRecord>
) {
  if (!subjectRef) return null;
  if (packSubjectIds.has(subjectRef)) return packSubjectIds.get(subjectRef)!;
  if (existingSubjectsByName.has(subjectRef)) return existingSubjectsByName.get(subjectRef)!.id;
  throw new Error(`Unknown subject reference: ${subjectRef}`);
}

function resolveNodeRecord(
  nodeRef: string,
  packNodesByKey: Map<string, NodeRecord>,
  packNodesBySlug: Map<string, NodeRecord>,
  existingNodesBySlug: Map<string, NodeRecord>
) {
  const normalizedRef = nodeRef.startsWith('slug:') ? nodeRef.slice(5) : nodeRef;
  if (packNodesByKey.has(normalizedRef)) return packNodesByKey.get(normalizedRef)!;
  if (packNodesBySlug.has(normalizedRef)) return packNodesBySlug.get(normalizedRef)!;
  if (existingNodesBySlug.has(normalizedRef)) return existingNodesBySlug.get(normalizedRef)!;
  throw new Error(`Unknown node reference: ${nodeRef}`);
}

async function upsertSubject(subject: ContentPack['subjects'][number]) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('subjects')
    .upsert({
      name: subject.name,
      color: subject.color,
      description: subject.description ?? null,
      icon: subject.icon ?? null,
    }, { onConflict: 'name' })
    .select('id, name, color, description, icon')
    .single();

  if (error || !data) {
    throw new Error(`Failed to upsert subject "${subject.name}": ${error?.message || 'unknown error'}`);
  }

  return data as SubjectRecord;
}

async function upsertNode(
  node: ContentPack['nodes'][number],
  subjectId: string | null,
  existingNode: NodeRecord | null,
  createdBy?: string | null
) {
  const supabase = createServerClient();
  const slug = node.slug || slugify(node.title);
  const payload: Record<string, unknown> = {
    slug,
    title: node.title,
    subject_id: subjectId,
    topic: node.topic ?? null,
    description: node.description,
    why_it_matters: node.why_it_matters ?? null,
    use_cases: node.use_cases ?? [],
    difficulty: node.difficulty,
    position_x: node.position?.x ?? existingNode?.position_x ?? 0,
    position_y: node.position?.y ?? existingNode?.position_y ?? 0,
  };

  if (!existingNode && createdBy) {
    payload.created_by = createdBy;
  }

  const { data, error } = await supabase
    .from('nodes')
    .upsert(payload, { onConflict: 'slug' })
    .select('id, slug, title, subject_id, position_x, position_y')
    .single();

  if (error || !data) {
    throw new Error(`Failed to upsert node "${node.title}": ${error?.message || 'unknown error'}`);
  }

  return data as NodeRecord;
}

async function upsertEdge(sourceNodeId: string, targetNodeId: string, relationshipType: ContentPack['edges'][number]['relationship_type']) {
  const supabase = createServerClient();
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

async function upsertPrerequisite(nodeId: string, prerequisiteNodeId: string) {
  const supabase = createServerClient();
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

async function replaceTestForNode(test: ContentPack['tests'][number], nodeId: string) {
  const supabase = createServerClient();

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

  let testId: string;
  const existingTest = existingTests?.[0] || null;

  if (existingTest) {
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
      .insert(question.options.map((option, optionIndex) => ({
        question_id: createdQuestion.id,
        option_text: option.option_text,
        is_correct: option.is_correct,
        order_index: option.order_index ?? optionIndex + 1,
      })));

    if (optionError) {
      throw new Error(`Failed to create question options for test "${test.title}": ${optionError.message}`);
    }
  }
}

export async function importContentPack({ pack, createdBy = null, nexusId = null }: ImportContentPackOptions): Promise<ImportContentPackResult> {
  if (nexusId) {
    return importContentPackIntoNexus({ pack, createdBy, nexusId });
  }
  const validatedPack = contentPackSchema.parse(pack);

  ensureUnique(validatedPack.subjects, (subject) => subject.key, 'subject key');
  ensureUnique(validatedPack.subjects, (subject) => subject.name, 'subject name');
  ensureUnique(validatedPack.nodes, (node) => node.key, 'node key');
  ensureUnique(validatedPack.nodes, (node) => node.slug || slugify(node.title), 'node slug');
  ensureUnique(validatedPack.tests, (test) => test.node, 'test node reference');

  const existingSubjectsByName = await fetchAllSubjects();
  const existingNodesBySlug = await fetchAllNodes();

  const packSubjectIds = new Map<string, string>();
  const packNodesByKey = new Map<string, NodeRecord>();
  const packNodesBySlug = new Map<string, NodeRecord>();

  for (const node of validatedPack.nodes) {
    if (!node.subject) continue;

    const isPackSubject = validatedPack.subjects.some((subject) => subject.key === node.subject);
    const isExistingSubject = existingSubjectsByName.has(node.subject);
    if (!isPackSubject && !isExistingSubject) {
      throw new Error(`Node "${node.key}" references unknown subject "${node.subject}"`);
    }
  }

  for (const subject of validatedPack.subjects) {
    const importedSubject = await upsertSubject(subject);
    packSubjectIds.set(subject.key, importedSubject.id);
    existingSubjectsByName.set(subject.name, importedSubject);
  }

  for (const node of validatedPack.nodes) {
    const slug = node.slug || slugify(node.title);
    const subjectId = resolveSubjectId(node.subject ?? null, packSubjectIds, existingSubjectsByName);
    const existingNode = existingNodesBySlug.get(slug) || null;
    const importedNode = await upsertNode(node, subjectId, existingNode, createdBy);

    packNodesByKey.set(node.key, importedNode);
    packNodesBySlug.set(importedNode.slug, importedNode);
    existingNodesBySlug.set(importedNode.slug, importedNode);
  }

  for (const edge of validatedPack.edges) {
    const sourceNode = resolveNodeRecord(edge.source, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    const targetNode = resolveNodeRecord(edge.target, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    await upsertEdge(sourceNode.id, targetNode.id, edge.relationship_type);
  }

  for (const prerequisite of validatedPack.prerequisites) {
    const node = resolveNodeRecord(prerequisite.node, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    const prerequisiteNode = resolveNodeRecord(prerequisite.prerequisite, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    await upsertPrerequisite(node.id, prerequisiteNode.id);
  }

  for (const test of validatedPack.tests) {
    const node = resolveNodeRecord(test.node, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    await replaceTestForNode(test, node.id);
  }

  return {
    importedSubjects: validatedPack.subjects.length,
    importedNodes: validatedPack.nodes.length,
    importedEdges: validatedPack.edges.length,
    importedPrerequisites: validatedPack.prerequisites.length,
    importedTests: validatedPack.tests.length,
  };
}

// ── Nexus-scoped import ────────────────────────────────────────────────────────
// All content is isolated to the given nexus. No global slug deduplication.

async function importContentPackIntoNexus({
  pack,
  createdBy,
  nexusId,
}: {
  pack: ContentPack;
  createdBy: string | null;
  nexusId: string;
}): Promise<ImportContentPackResult> {
  const supabase = createServerClient();
  const validatedPack = contentPackSchema.parse(pack);

  ensureUnique(validatedPack.subjects, (s) => s.key, 'subject key');
  ensureUnique(validatedPack.nodes, (n) => n.key, 'node key');
  ensureUnique(validatedPack.tests, (t) => t.node, 'test node reference');

  // Fetch existing subjects and nodes already in this nexus
  const [{ data: existingSubjectsRaw }, { data: existingNodesRaw }] = await Promise.all([
    supabase.from('subjects').select('id, name').eq('nexus_id', nexusId),
    supabase.from('nodes').select('id, slug, title, subject_id, position_x, position_y').eq('nexus_id', nexusId),
  ]);

  const existingSubjectsByName = new Map<string, SubjectRecord>(
    (existingSubjectsRaw || []).map((s) => [s.name, s as SubjectRecord]),
  );
  const existingNodesBySlug = new Map<string, NodeRecord>(
    (existingNodesRaw || []).map((n) => [n.slug, n as NodeRecord]),
  );

  const packSubjectIds = new Map<string, string>();
  const packNodesByKey = new Map<string, NodeRecord>();
  const packNodesBySlug = new Map<string, NodeRecord>();

  // Upsert subjects scoped to this nexus
  for (const subject of validatedPack.subjects) {
    const existing = existingSubjectsByName.get(subject.name);

    let subjectRecord: SubjectRecord;
    if (existing) {
      // Update in place
      const { data, error } = await supabase
        .from('subjects')
        .update({ color: subject.color, description: subject.description ?? null, icon: subject.icon ?? null })
        .eq('id', existing.id)
        .select('id, name, color, description, icon')
        .single();

      if (error || !data) throw new Error(`Failed to update subject "${subject.name}": ${error?.message}`);
      subjectRecord = data as SubjectRecord;
    } else {
      const { data, error } = await supabase
        .from('subjects')
        .insert({ name: subject.name, color: subject.color, description: subject.description ?? null, icon: subject.icon ?? null, nexus_id: nexusId })
        .select('id, name, color, description, icon')
        .single();

      if (error || !data) throw new Error(`Failed to insert subject "${subject.name}": ${error?.message}`);
      subjectRecord = data as SubjectRecord;
      existingSubjectsByName.set(subject.name, subjectRecord);
    }

    packSubjectIds.set(subject.key, subjectRecord.id);
  }

  // Resolve subject ID for nodes that reference an existing subject name
  for (const node of validatedPack.nodes) {
    if (!node.subject) continue;
    const isPackSubject = validatedPack.subjects.some((s) => s.key === node.subject);
    const isExisting = existingSubjectsByName.has(node.subject);
    if (!isPackSubject && !isExisting) {
      throw new Error(`Node "${node.key}" references unknown subject "${node.subject}"`);
    }
  }

  // Upsert nodes scoped to this nexus
  for (const node of validatedPack.nodes) {
    const slug = node.slug || slugify(node.title);
    const subjectId = resolveSubjectId(node.subject ?? null, packSubjectIds, existingSubjectsByName);
    const existing = existingNodesBySlug.get(slug) || null;

    const payload: Record<string, unknown> = {
      slug,
      title: node.title,
      subject_id: subjectId,
      topic: node.topic ?? null,
      description: node.description,
      why_it_matters: node.why_it_matters ?? null,
      use_cases: node.use_cases ?? [],
      difficulty: node.difficulty,
      position_x: node.position?.x ?? existing?.position_x ?? 0,
      position_y: node.position?.y ?? existing?.position_y ?? 0,
      nexus_id: nexusId,
    };

    let nodeRecord: NodeRecord;
    if (existing) {
      const { data, error } = await supabase
        .from('nodes')
        .update(payload)
        .eq('id', existing.id)
        .select('id, slug, title, subject_id, position_x, position_y')
        .single();

      if (error || !data) throw new Error(`Failed to update node "${node.title}": ${error?.message}`);
      nodeRecord = data as NodeRecord;
    } else {
      if (createdBy) payload.created_by = createdBy;
      const { data, error } = await supabase
        .from('nodes')
        .insert(payload)
        .select('id, slug, title, subject_id, position_x, position_y')
        .single();

      if (error || !data) throw new Error(`Failed to insert node "${node.title}": ${error?.message}`);
      nodeRecord = data as NodeRecord;
    }

    packNodesByKey.set(node.key, nodeRecord);
    packNodesBySlug.set(nodeRecord.slug, nodeRecord);
    existingNodesBySlug.set(nodeRecord.slug, nodeRecord);
  }

  // Edges, prerequisites, and tests use the same logic as the global importer
  for (const edge of validatedPack.edges) {
    const sourceNode = resolveNodeRecord(edge.source, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    const targetNode = resolveNodeRecord(edge.target, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    await upsertEdge(sourceNode.id, targetNode.id, edge.relationship_type);
  }

  for (const prerequisite of validatedPack.prerequisites) {
    const node = resolveNodeRecord(prerequisite.node, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    const prereqNode = resolveNodeRecord(prerequisite.prerequisite, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    await upsertPrerequisite(node.id, prereqNode.id);
  }

  for (const test of validatedPack.tests) {
    const node = resolveNodeRecord(test.node, packNodesByKey, packNodesBySlug, existingNodesBySlug);
    await replaceTestForNode(test, node.id);
  }

  return {
    importedSubjects: validatedPack.subjects.length,
    importedNodes: validatedPack.nodes.length,
    importedEdges: validatedPack.edges.length,
    importedPrerequisites: validatedPack.prerequisites.length,
    importedTests: validatedPack.tests.length,
  };
}
