import { z } from 'zod';

export const CONTENT_PACK_RELATIONSHIP_TYPES = [
  'requires',
  'used_in',
  'explains',
  'related_to',
  'application_of',
  'leads_to',
] as const;

export const CONTENT_PACK_QUESTION_TYPES = [
  'multiple_choice',
  'short_answer',
  'matching',
  'applied_scenario',
] as const;

export const contentPackSubjectSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const contentPackNodeSchema = z.object({
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
});

export const contentPackEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  relationship_type: z.enum(CONTENT_PACK_RELATIONSHIP_TYPES),
});

export const contentPackPrerequisiteSchema = z.object({
  node: z.string().min(1),
  prerequisite: z.string().min(1),
});

export const contentPackQuestionOptionSchema = z.object({
  option_text: z.string().min(1),
  is_correct: z.boolean(),
  order_index: z.number().int().min(0).optional(),
});

export const contentPackQuestionSchema = z.object({
  question_type: z.enum(CONTENT_PACK_QUESTION_TYPES),
  prompt: z.string().min(1),
  explanation: z.string().optional().nullable(),
  order_index: z.number().int().min(0).optional(),
  options: z.array(contentPackQuestionOptionSchema).default([]),
});

export const contentPackTestSchema = z.object({
  node: z.string().min(1),
  title: z.string().min(1),
  instructions: z.string().optional().nullable(),
  passing_score: z.number().int().min(0).max(100).default(70),
  questions: z.array(contentPackQuestionSchema).min(1),
});

export const contentPackSchema = z.object({
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
  subjects: z.array(contentPackSubjectSchema).default([]),
  nodes: z.array(contentPackNodeSchema).default([]),
  edges: z.array(contentPackEdgeSchema).default([]),
  prerequisites: z.array(contentPackPrerequisiteSchema).default([]),
  tests: z.array(contentPackTestSchema).default([]),
});

export type ContentPack = z.infer<typeof contentPackSchema>;
export type ContentPackNode = z.infer<typeof contentPackNodeSchema>;

export const contentPackJsonSchema = {
  type: 'object',
  required: ['format', 'version', 'metadata'],
  additionalProperties: false,
  properties: {
    $schema: { type: 'string' },
    format: { const: 'knowledge-nexus/content-pack' },
    version: { const: 1 },
    metadata: {
      type: 'object',
      required: ['id', 'title'],
      additionalProperties: false,
      properties: {
        id: { type: 'string', minLength: 1 },
        title: { type: 'string', minLength: 1 },
        description: { type: 'string' },
        author: { type: 'string' },
        updated_at: { type: 'string' },
      },
    },
    subjects: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        required: ['key', 'name', 'color'],
        additionalProperties: false,
        properties: {
          key: { type: 'string', minLength: 1 },
          name: { type: 'string', minLength: 1 },
          color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
          description: { type: 'string' },
          icon: { type: 'string' },
        },
      },
    },
    nodes: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        required: ['key', 'title', 'description'],
        additionalProperties: false,
        properties: {
          key: { type: 'string', minLength: 1 },
          title: { type: 'string', minLength: 1 },
          slug: { type: 'string', minLength: 1 },
          subject: { type: ['string', 'null'] },
          topic: { type: ['string', 'null'] },
          description: { type: 'string', minLength: 1 },
          why_it_matters: { type: ['string', 'null'] },
          use_cases: {
            type: 'array',
            default: [],
            items: { type: 'string' },
          },
          difficulty: {
            type: 'integer',
            minimum: 1,
            maximum: 10,
            default: 1,
          },
          position: {
            type: 'object',
            required: ['x', 'y'],
            additionalProperties: false,
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
            },
          },
        },
      },
    },
    edges: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        required: ['source', 'target', 'relationship_type'],
        additionalProperties: false,
        properties: {
          source: { type: 'string', minLength: 1 },
          target: { type: 'string', minLength: 1 },
          relationship_type: { type: 'string', enum: [...CONTENT_PACK_RELATIONSHIP_TYPES] },
        },
      },
    },
    prerequisites: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        required: ['node', 'prerequisite'],
        additionalProperties: false,
        properties: {
          node: { type: 'string', minLength: 1 },
          prerequisite: { type: 'string', minLength: 1 },
        },
      },
    },
    tests: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        required: ['node', 'title', 'questions'],
        additionalProperties: false,
        properties: {
          node: { type: 'string', minLength: 1 },
          title: { type: 'string', minLength: 1 },
          instructions: { type: ['string', 'null'] },
          passing_score: { type: 'integer', minimum: 0, maximum: 100, default: 70 },
          questions: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['question_type', 'prompt'],
              additionalProperties: false,
              properties: {
                question_type: { type: 'string', enum: [...CONTENT_PACK_QUESTION_TYPES] },
                prompt: { type: 'string', minLength: 1 },
                explanation: { type: ['string', 'null'] },
                order_index: { type: 'integer', minimum: 0 },
                options: {
                  type: 'array',
                  default: [],
                  items: {
                    type: 'object',
                    required: ['option_text', 'is_correct'],
                    additionalProperties: false,
                    properties: {
                      option_text: { type: 'string', minLength: 1 },
                      is_correct: { type: 'boolean' },
                      order_index: { type: 'integer', minimum: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export function summarizeContentPack(pack: ContentPack) {
  return {
    subjectCount: pack.subjects.length,
    nodeCount: pack.nodes.length,
    edgeCount: pack.edges.length,
    prerequisiteCount: pack.prerequisites.length,
    testCount: pack.tests.length,
  };
}
