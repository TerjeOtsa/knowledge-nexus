#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

function printUsage() {
  console.log('Usage:');
  console.log('  npm run audit:tests -- --subject Mathematics --min-questions 10');
  console.log('  npm run audit:tests -- --min-questions 10');
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let subject = null;
  let minQuestions = 10;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--help' || arg === '-h') {
      return { help: true, subject: null, minQuestions };
    }

    if (arg === '--subject') {
      subject = args[index + 1] || null;
      index += 1;
      continue;
    }

    if (arg === '--min-questions') {
      const parsed = Number.parseInt(args[index + 1] || '', 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        throw new Error('`--min-questions` must be a positive integer.');
      }
      minQuestions = parsed;
      index += 1;
    }
  }

  return { help: false, subject, minQuestions };
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

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const rootDir = process.cwd();
  loadEnvIntoProcess(rootDir);

  const supabase = createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  );

  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('id, name');

  if (subjectsError) {
    throw new Error(`Failed to fetch subjects: ${subjectsError.message}`);
  }

  let subjectIds = null;
  if (args.subject) {
    const matchingSubject = (subjects || []).find((subject) => subject.name === args.subject);
    if (!matchingSubject) {
      throw new Error(`Subject not found: ${args.subject}`);
    }
    subjectIds = new Set([matchingSubject.id]);
  }

  const subjectNamesById = new Map((subjects || []).map((subject) => [subject.id, subject.name]));

  const { data: nodes, error: nodesError } = await supabase
    .from('nodes')
    .select('id, title, slug, subject_id')
    .order('title', { ascending: true });

  if (nodesError) {
    throw new Error(`Failed to fetch nodes: ${nodesError.message}`);
  }

  const scopedNodes = (nodes || []).filter((node) => {
    if (!subjectIds) {
      return true;
    }
    return node.subject_id && subjectIds.has(node.subject_id);
  });

  const { data: tests, error: testsError } = await supabase
    .from('mastery_tests')
    .select('id, node_id, title');

  if (testsError) {
    throw new Error(`Failed to fetch mastery tests: ${testsError.message}`);
  }

  const { data: questions, error: questionsError } = await supabase
    .from('mastery_questions')
    .select('mastery_test_id');

  if (questionsError) {
    throw new Error(`Failed to fetch mastery questions: ${questionsError.message}`);
  }

  const questionCountsByTestId = new Map();
  for (const question of questions || []) {
    questionCountsByTestId.set(
      question.mastery_test_id,
      (questionCountsByTestId.get(question.mastery_test_id) || 0) + 1
    );
  }

  const testsByNodeId = new Map();
  for (const test of tests || []) {
    if (!testsByNodeId.has(test.node_id)) {
      testsByNodeId.set(test.node_id, []);
    }

    testsByNodeId.get(test.node_id).push({
      id: test.id,
      title: test.title,
      questionCount: questionCountsByTestId.get(test.id) || 0,
    });
  }

  const issues = [];

  for (const node of scopedNodes) {
    const nodeTests = testsByNodeId.get(node.id) || [];
    const subjectName = node.subject_id ? subjectNamesById.get(node.subject_id) || 'Unknown' : 'Unassigned';

    if (nodeTests.length === 0) {
      issues.push({
        slug: node.slug,
        title: node.title,
        subject: subjectName,
        issue: 'missing_test',
        detail: 'No mastery test found.',
      });
      continue;
    }

    if (nodeTests.length > 1) {
      issues.push({
        slug: node.slug,
        title: node.title,
        subject: subjectName,
        issue: 'duplicate_tests',
        detail: `Expected 1 test, found ${nodeTests.length}.`,
      });
    }

    const maxQuestionCount = Math.max(...nodeTests.map((test) => test.questionCount));
    if (maxQuestionCount < args.minQuestions) {
      issues.push({
        slug: node.slug,
        title: node.title,
        subject: subjectName,
        issue: 'under_minimum_questions',
        detail: `Largest test has ${maxQuestionCount} question(s); expected at least ${args.minQuestions}.`,
      });
    }
  }

  console.log(`[audit:tests] Subject scope: ${args.subject || 'ALL'}`);
  console.log(`[audit:tests] Nodes checked: ${scopedNodes.length}`);
  console.log(`[audit:tests] Minimum questions: ${args.minQuestions}`);

  if (issues.length === 0) {
    console.log('[audit:tests] Passed. Every scoped node has exactly one testable path with enough questions.');
    return;
  }

  console.log(`[audit:tests] Found ${issues.length} issue(s):`);
  for (const issue of issues) {
    console.log(`- [${issue.subject}] ${issue.slug} (${issue.title}): ${issue.detail}`);
  }

  process.exit(1);
}

main().catch((error) => {
  console.error(`[audit:tests] Failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
