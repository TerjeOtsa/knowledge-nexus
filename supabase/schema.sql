-- =============================================
-- Knowledge Nexus - Database Schema
-- =============================================
-- Run this in Supabase SQL Editor to set up all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE
-- =============================================
-- Supabase Auth handles auth.users, this is for app-level profile data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'editor', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. SUBJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 3. NODES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic TEXT,
  description TEXT NOT NULL DEFAULT '',
  why_it_matters TEXT,
  use_cases TEXT[] DEFAULT '{}',
  difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  -- Graph position for React Flow
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nodes_subject ON public.nodes(subject_id);
CREATE INDEX idx_nodes_slug ON public.nodes(slug);

-- =============================================
-- 4. EDGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'related_to' 
    CHECK (relationship_type IN ('requires', 'used_in', 'explains', 'related_to', 'application_of', 'leads_to')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_node_id, target_node_id, relationship_type)
);

CREATE INDEX idx_edges_source ON public.edges(source_node_id);
CREATE INDEX idx_edges_target ON public.edges(target_node_id);

-- =============================================
-- 5. PREREQUISITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.prerequisites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  prerequisite_node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(node_id, prerequisite_node_id),
  CHECK (node_id != prerequisite_node_id)
);

CREATE INDEX idx_prereqs_node ON public.prerequisites(node_id);

-- =============================================
-- 6. MASTERY TESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.mastery_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tests_node ON public.mastery_tests(node_id);

-- =============================================
-- 7. MASTERY QUESTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.mastery_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mastery_test_id UUID NOT NULL REFERENCES public.mastery_tests(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice' 
    CHECK (question_type IN ('multiple_choice', 'short_answer', 'matching', 'applied_scenario')),
  prompt TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_test ON public.mastery_questions(mastery_test_id);

-- =============================================
-- 8. MASTERY QUESTION OPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.mastery_question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.mastery_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_options_question ON public.mastery_question_options(question_id);

-- =============================================
-- 9. USER NODE PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_node_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'untouched' CHECK (status IN ('untouched', 'in_progress', 'mastered')),
  first_interacted_at TIMESTAMPTZ,
  mastered_at TIMESTAMPTZ,
  latest_score INTEGER,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, node_id)
);

CREATE INDEX idx_progress_user ON public.user_node_progress(user_id);
CREATE INDEX idx_progress_node ON public.user_node_progress(node_id);

-- =============================================
-- 10. MASTERY ATTEMPTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.mastery_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  mastery_test_id UUID NOT NULL REFERENCES public.mastery_tests(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  answers JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attempts_user ON public.mastery_attempts(user_id);
CREATE INDEX idx_attempts_node ON public.mastery_attempts(node_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================
-- Note: For the MVP we keep RLS simple. In production, tighten these.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_node_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_attempts ENABLE ROW LEVEL SECURITY;

-- Public read access for learning content
CREATE POLICY "Public read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public read nodes" ON public.nodes FOR SELECT USING (true);
CREATE POLICY "Public read edges" ON public.edges FOR SELECT USING (true);
CREATE POLICY "Public read prerequisites" ON public.prerequisites FOR SELECT USING (true);
CREATE POLICY "Public read tests" ON public.mastery_tests FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON public.mastery_questions FOR SELECT USING (true);
CREATE POLICY "Public read options" ON public.mastery_question_options FOR SELECT USING (true);

-- Authenticated user policies for content creation
CREATE POLICY "Auth insert nodes" ON public.nodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth update nodes" ON public.nodes FOR UPDATE USING (true);
CREATE POLICY "Auth insert edges" ON public.edges FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth delete edges" ON public.edges FOR DELETE USING (true);
CREATE POLICY "Auth insert prereqs" ON public.prerequisites FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth delete prereqs" ON public.prerequisites FOR DELETE USING (true);
CREATE POLICY "Auth insert tests" ON public.mastery_tests FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth update tests" ON public.mastery_tests FOR UPDATE USING (true);
CREATE POLICY "Auth insert questions" ON public.mastery_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth update questions" ON public.mastery_questions FOR UPDATE USING (true);
CREATE POLICY "Auth delete questions" ON public.mastery_questions FOR DELETE USING (true);
CREATE POLICY "Auth insert options" ON public.mastery_question_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth update options" ON public.mastery_question_options FOR UPDATE USING (true);
CREATE POLICY "Auth delete options" ON public.mastery_question_options FOR DELETE USING (true);
CREATE POLICY "Auth insert subjects" ON public.subjects FOR INSERT WITH CHECK (true);

-- User-specific progress policies
CREATE POLICY "Users read own progress" ON public.user_node_progress FOR SELECT USING (true);
CREATE POLICY "Users insert own progress" ON public.user_node_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own progress" ON public.user_node_progress FOR UPDATE USING (true);

CREATE POLICY "Users read own attempts" ON public.mastery_attempts FOR SELECT USING (true);
CREATE POLICY "Users insert own attempts" ON public.mastery_attempts FOR INSERT WITH CHECK (true);

CREATE POLICY "Users read all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own" ON public.users FOR UPDATE USING (true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON public.nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mastery_tests_updated_at BEFORE UPDATE ON public.mastery_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
