import { z } from 'zod';

// ---- Auth Validation ----

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

// ---- Node Validation ----

export const createNodeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject_id: z.string().uuid().optional().nullable(),
  topic: z.string().max(200).optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  why_it_matters: z.string().optional().nullable(),
  use_cases: z.array(z.string()).optional().default([]),
  difficulty: z.number().min(1).max(10).optional().default(1),
  position_x: z.number().optional().default(0),
  position_y: z.number().optional().default(0),
});

export const updateNodeSchema = createNodeSchema.partial();

// ---- Edge Validation ----

export const createEdgeSchema = z.object({
  source_node_id: z.string().uuid('Invalid source node'),
  target_node_id: z.string().uuid('Invalid target node'),
  relationship_type: z.enum(['requires', 'used_in', 'explains', 'related_to', 'application_of', 'leads_to']),
});

// ---- Mastery Test Validation ----

export const createQuestionOptionSchema = z.object({
  option_text: z.string().min(1, 'Option text is required'),
  is_correct: z.boolean(),
  order_index: z.number().min(0),
});

export const createQuestionSchema = z.object({
  question_type: z.enum(['multiple_choice', 'short_answer', 'matching', 'applied_scenario']),
  prompt: z.string().min(1, 'Question prompt is required'),
  explanation: z.string().optional().nullable(),
  order_index: z.number().min(0),
  options: z.array(createQuestionOptionSchema).optional().default([]),
});

export const createTestSchema = z.object({
  node_id: z.string().uuid(),
  title: z.string().min(1, 'Test title is required'),
  instructions: z.string().optional().nullable(),
  passing_score: z.number().min(0).max(100).optional().default(70),
  questions: z.array(createQuestionSchema).min(1, 'At least one question is required'),
});

// ---- Test Submission Validation ----

export const testSubmissionSchema = z.object({
  test_id: z.string().uuid(),
  node_id: z.string().uuid(),
  answers: z.record(z.string(), z.string()), // question_id -> answer
});

// ---- Subject Validation ----

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format'),
  description: z.string().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateNodeInput = z.infer<typeof createNodeSchema>;
export type UpdateNodeInput = z.infer<typeof updateNodeSchema>;
export type CreateEdgeInput = z.infer<typeof createEdgeSchema>;
export type CreateTestInput = z.infer<typeof createTestSchema>;
export type TestSubmissionInput = z.infer<typeof testSubmissionSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
