-- =============================================
-- Knowledge Nexus - Notes Schema Migration
-- Adds user_node_notes table for per-node notepad
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_node_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, node_id)
);

CREATE INDEX idx_notes_user ON public.user_node_notes(user_id);
CREATE INDEX idx_notes_node ON public.user_node_notes(node_id);

ALTER TABLE public.user_node_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notes" ON public.user_node_notes FOR SELECT USING (true);
CREATE POLICY "Users insert own notes" ON public.user_node_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own notes" ON public.user_node_notes FOR UPDATE USING (true);
CREATE POLICY "Users delete own notes" ON public.user_node_notes FOR DELETE USING (true);

-- Auto-update updated_at
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.user_node_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
