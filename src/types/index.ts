// =============================================
// Knowledge Nexus - Core TypeScript Types
// =============================================

// ---- Database Entity Types ----

export type UserRole = 'learner' | 'editor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export interface KnowledgeNode {
  id: string;
  title: string;
  slug: string;
  subject_id?: string;
  topic?: string;
  description: string;
  why_it_matters?: string;
  use_cases: string[];
  difficulty: number;
  position_x: number;
  position_y: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  subject?: Subject;
}

export type RelationshipType = 'requires' | 'used_in' | 'explains' | 'related_to' | 'application_of' | 'leads_to';

export interface Edge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  relationship_type: RelationshipType;
  created_at: string;
}

export interface Prerequisite {
  id: string;
  node_id: string;
  prerequisite_node_id: string;
  created_at: string;
}

export interface MasteryTest {
  id: string;
  node_id: string;
  title: string;
  instructions?: string;
  passing_score: number;
  created_at: string;
  updated_at: string;
  questions?: MasteryQuestion[];
}

export type QuestionType = 'multiple_choice' | 'short_answer' | 'matching' | 'applied_scenario';

export interface MasteryQuestion {
  id: string;
  mastery_test_id: string;
  question_type: QuestionType;
  prompt: string;
  explanation?: string;
  order_index: number;
  created_at: string;
  options?: MasteryQuestionOption[];
}

export interface MasteryQuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export type NodeStatus = 'untouched' | 'in_progress' | 'mastered';

export interface UserNodeProgress {
  id: string;
  user_id: string;
  node_id: string;
  status: NodeStatus;
  first_interacted_at?: string;
  mastered_at?: string;
  latest_score?: number;
  attempt_count: number;
}

export interface MasteryAttempt {
  id: string;
  user_id: string;
  node_id: string;
  mastery_test_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  submitted_at: string;
}

// ---- Notes Types ----

export interface UserNodeNote {
  id: string;
  user_id: string;
  node_id: string;
  content: string;
  updated_at: string;
  created_at: string;
}

export interface MasterNoteEntry {
  node_id: string;
  node_title: string;
  subject_name?: string;
  subject_color?: string;
  content: string;
  updated_at: string;
}

// ---- Graph Types for React Flow ----

export interface GraphNode {
  id: string;
  type: 'concept';
  position: { x: number; y: number };
  data: {
    label: string;
    subject?: Subject;
    status: NodeStatus;
    difficulty: number;
    topic?: string;
    nodeData: KnowledgeNode;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  data?: {
    relationship_type: RelationshipType;
  };
  animated?: boolean;
}

// ---- API / Form Types ----

export interface CreateNodeInput {
  title: string;
  subject_id?: string;
  topic?: string;
  description: string;
  why_it_matters?: string;
  use_cases?: string[];
  difficulty?: number;
  position_x?: number;
  position_y?: number;
}

export interface CreateEdgeInput {
  source_node_id: string;
  target_node_id: string;
  relationship_type: RelationshipType;
}

export interface CreateTestInput {
  node_id: string;
  title: string;
  instructions?: string;
  passing_score?: number;
  questions: CreateQuestionInput[];
}

export interface CreateQuestionInput {
  question_type: QuestionType;
  prompt: string;
  explanation?: string;
  order_index: number;
  options?: CreateOptionInput[];
}

export interface CreateOptionInput {
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface TestSubmission {
  test_id: string;
  node_id: string;
  answers: Record<string, string>; // question_id -> selected option_id or text
}

export interface TestResult {
  score: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  feedback: QuestionFeedback[];
}

export interface QuestionFeedback {
  question_id: string;
  correct: boolean;
  correct_answer?: string;
  explanation?: string;
}

// ---- Dashboard Types ----

export interface DashboardStats {
  total_nodes: number;
  mastered_count: number;
  in_progress_count: number;
  untouched_count: number;
  completion_percentage: number;
  subjects: SubjectProgress[];
  recent_activity: RecentActivity[];
  recommended_nodes: KnowledgeNode[];
  continue_nodes: KnowledgeNode[];
  review_nodes: KnowledgeNode[];
}

export interface SubjectProgress {
  subject: Subject;
  total: number;
  mastered: number;
  in_progress: number;
  percentage: number;
}

export interface RecentActivity {
  node: KnowledgeNode;
  action: 'started' | 'attempted' | 'mastered';
  timestamp: string;
}

// ---- Nexus Types ----

export type NexusVisibility = 'private' | 'link';

export interface Nexus {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  visibility: NexusVisibility;
  created_at: string;
  updated_at: string;
  // Joined counts (returned from list queries)
  node_count?: number;
  subject_count?: number;
}

export interface NexusSubscription {
  id: string;
  nexus_id: string;
  user_id: string;
  joined_at: string;
  nexus?: Nexus;
}

// ---- Auth Types ----

export interface AuthSession {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
