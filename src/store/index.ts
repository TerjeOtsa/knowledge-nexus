import { create } from 'zustand';
import type { User, KnowledgeNode, Edge, Subject, UserNodeProgress, NodeStatus, MasteryTest, UserNodeNote } from '@/types';

// =============================================
// Auth Store
// =============================================
interface AuthState {
  user: Omit<User, 'password_hash'> | null;
  isLoading: boolean;
  setUser: (user: Omit<User, 'password_hash'> | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isLoading: false }),
}));

// =============================================
// Graph Store - Central state for the knowledge graph
// =============================================
interface GraphState {
  nodes: KnowledgeNode[];
  edges: Edge[];
  prerequisites: { id: string; node_id: string; prerequisite_node_id: string; created_at: string }[];
  subjects: Subject[];
  userProgress: Record<string, UserNodeProgress>; // keyed by node_id
  selectedNodeId: string | null;
  isDetailPanelOpen: boolean;
  searchQuery: string;
  subjectFilter: string | null;
  showEdgeLabels: boolean;
  graphMode: 'learn' | 'edit';

  // Actions
  setNodes: (nodes: KnowledgeNode[]) => void;
  addNode: (node: KnowledgeNode) => void;
  updateNode: (id: string, updates: Partial<KnowledgeNode>) => void;
  removeNode: (id: string) => void;
  setEdges: (edges: Edge[]) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;
  setPrerequisites: (prerequisites: { id: string; node_id: string; prerequisite_node_id: string; created_at: string }[]) => void;
  setSubjects: (subjects: Subject[]) => void;
  setUserProgress: (progress: Record<string, UserNodeProgress>) => void;
  updateNodeProgress: (nodeId: string, progress: UserNodeProgress) => void;
  setSelectedNodeId: (id: string | null) => void;
  setDetailPanelOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSubjectFilter: (subjectId: string | null) => void;
  toggleEdgeLabels: () => void;
  setGraphMode: (mode: 'learn' | 'edit') => void;
  getNodeStatus: (nodeId: string) => NodeStatus;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  prerequisites: [],
  subjects: [],
  userProgress: {},
  selectedNodeId: null,
  isDetailPanelOpen: false,
  searchQuery: '',
  subjectFilter: null,
  showEdgeLabels: false,
  graphMode: 'learn',

  setNodes: (nodes) => set({ nodes }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source_node_id !== id && e.target_node_id !== id),
    })),
  setEdges: (edges) => set({ edges }),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  removeEdge: (id) => set((state) => ({ edges: state.edges.filter((e) => e.id !== id) })),
  setPrerequisites: (prerequisites) => set({ prerequisites }),
  setSubjects: (subjects) => set({ subjects }),
  setUserProgress: (progress) => set({ userProgress: progress }),
  updateNodeProgress: (nodeId, progress) =>
    set((state) => ({
      userProgress: { ...state.userProgress, [nodeId]: progress },
    })),
  setSelectedNodeId: (id) => set({ selectedNodeId: id, isDetailPanelOpen: id !== null }),
  setDetailPanelOpen: (open) => set({ isDetailPanelOpen: open, selectedNodeId: open ? get().selectedNodeId : null }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSubjectFilter: (subjectId) => set({ subjectFilter: subjectId }),
  toggleEdgeLabels: () => set((state) => ({ showEdgeLabels: !state.showEdgeLabels })),
  setGraphMode: (mode) => set({ graphMode: mode }),
  getNodeStatus: (nodeId) => {
    const progress = get().userProgress[nodeId];
    return progress?.status || 'untouched';
  },
}));

// =============================================
// Test Store - For mastery test taking flow
// =============================================
interface TestState {
  currentTest: MasteryTest | null;
  currentNodeId: string | null;
  answers: Record<string, string>;
  isSubmitting: boolean;
  isTestModalOpen: boolean;

  setCurrentTest: (test: MasteryTest | null, nodeId: string | null) => void;
  setAnswer: (questionId: string, answer: string) => void;
  clearAnswers: () => void;
  setSubmitting: (submitting: boolean) => void;
  setTestModalOpen: (open: boolean) => void;
  reset: () => void;
}

export const useTestStore = create<TestState>((set) => ({
  currentTest: null,
  currentNodeId: null,
  answers: {},
  isSubmitting: false,
  isTestModalOpen: false,

  setCurrentTest: (test, nodeId) => set({ currentTest: test, currentNodeId: nodeId, answers: {}, isTestModalOpen: true }),
  setAnswer: (questionId, answer) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
  clearAnswers: () => set({ answers: {} }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setTestModalOpen: (open) => set({ isTestModalOpen: open }),
  reset: () => set({ currentTest: null, currentNodeId: null, answers: {}, isSubmitting: false, isTestModalOpen: false }),
}));

// =============================================
// Notes Store — per-node notepad + master notes
// =============================================
interface NotesState {
  notesByNodeId: Record<string, UserNodeNote>;
  isSaving: boolean;
  lastSavedAt: string | null;

  setNote: (nodeId: string, note: UserNodeNote) => void;
  updateNoteContent: (nodeId: string, content: string) => void;
  setSaving: (saving: boolean) => void;
  setLastSaved: (time: string) => void;
}

export const useNotesStore = create<NotesState>((set) => ({
  notesByNodeId: {},
  isSaving: false,
  lastSavedAt: null,

  setNote: (nodeId, note) =>
    set((state) => ({
      notesByNodeId: { ...state.notesByNodeId, [nodeId]: note },
    })),
  updateNoteContent: (nodeId, content) =>
    set((state) => ({
      notesByNodeId: {
        ...state.notesByNodeId,
        [nodeId]: {
          ...(state.notesByNodeId[nodeId] || { id: '', user_id: '', node_id: nodeId, created_at: '', updated_at: '' }),
          content,
        },
      },
    })),
  setSaving: (isSaving) => set({ isSaving }),
  setLastSaved: (lastSavedAt) => set({ lastSavedAt }),
}));
