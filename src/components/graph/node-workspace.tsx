"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Edit3,
  GraduationCap,
  Layers3,
  Lightbulb,
  Link2,
  Lock,
  PlayCircle,
  Plus,
  RotateCcw,
  Save,
  StickyNote,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import { useAuthStore, useGraphStore, useNotesStore } from '@/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { estimateStudyMinutes, getNodeLearningMeta, getTopicLabel } from '@/lib/learner-state';
import { formatDate, getDifficultyLabel, getRelationshipLabel } from '@/lib/utils';
import type { Edge as KEdge, KnowledgeNode, MasteryTest, TestResult } from '@/types';

type TabId = 'learn' | 'test' | 'notes';

interface RelatedNodeRef {
  id: string;
  title: string;
  slug: string;
}

interface NodeDetails {
  node: KnowledgeNode;
  outgoingEdges: Array<KEdge & { target_node?: RelatedNodeRef }>;
  incomingEdges: Array<KEdge & { source_node?: RelatedNodeRef }>;
  prerequisites: Array<{ prerequisite_node?: RelatedNodeRef }>;
  dependents: Array<{ dependent_node?: RelatedNodeRef }>;
  masteryTest: MasteryTest | null;
}

interface NodeWorkspaceProps {
  nodeId: string;
  onClose: () => void;
  onStartTest?: (nodeId: string) => void;
  onAddConnectedNode: (nodeId: string) => void;
  onLinkExistingNode: (nodeId: string) => void;
  onEditNode: (nodeId: string) => void;
  onNavigateToNode: (nodeId: string) => void;
}

function statusStyles(status: 'untouched' | 'in_progress' | 'mastered') {
  if (status === 'mastered') return 'border-emerald-200 bg-emerald-100 text-emerald-800';
  if (status === 'in_progress') return 'border-amber-200 bg-amber-100 text-amber-800';
  return 'border-sky-200 bg-sky-100 text-sky-800';
}

export function NodeWorkspace({
  nodeId,
  onClose,
  onStartTest,
  onAddConnectedNode,
  onLinkExistingNode,
  onEditNode,
  onNavigateToNode,
}: NodeWorkspaceProps) {
  const { user } = useAuthStore();
  const { prerequisites: allPrerequisites, userProgress, graphMode } = useGraphStore();
  const {
    isSaving,
    lastSavedAt,
    notesByNodeId,
    setLastSaved,
    setNote,
    setSaving,
    updateNoteContent,
  } = useNotesStore();

  const [activeTab, setActiveTab] = useState<TabId>('learn');
  const [details, setDetails] = useState<NodeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [testPhase, setTestPhase] = useState<'idle' | 'questions' | 'results'>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteContent = notesByNodeId[nodeId]?.content || '';

  useEffect(() => {
    async function fetchNodeDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/nodes/${nodeId}`);
        if (!res.ok) throw new Error('Failed to fetch node details');
        const data = await res.json();
        setDetails(data);
      } catch (error) {
        console.error('Failed to fetch node details:', error);
        setDetails(null);
      } finally {
        setLoading(false);
      }
    }

    fetchNodeDetails();
    setActiveTab('learn');
    setTestPhase('idle');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTestResult(null);
  }, [nodeId]);

  useEffect(() => {
    async function fetchNote() {
      try {
        const res = await fetch(`/api/notes?node_id=${nodeId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.note) setNote(nodeId, data.note);
      } catch (error) {
        console.error('Failed to fetch note:', error);
      }
    }

    fetchNote();
  }, [nodeId, setNote]);

  const saveNote = useCallback(async (content: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: nodeId, content }),
      });
      if (!res.ok) throw new Error('Failed to save note');
      const data = await res.json();
      setNote(nodeId, data.note);
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  }, [nodeId, setLastSaved, setNote, setSaving]);

  const handleNoteChange = useCallback((content: string) => {
    updateNoteContent(nodeId, content);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveNote(content), 900);
  }, [nodeId, saveNote, updateNoteContent]);

  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  }, []);

  const derived = useMemo(() => {
    if (!details?.node) return null;

    const node = details.node;
    const learningMeta = getNodeLearningMeta(node, allPrerequisites, userProgress);
    const progress = userProgress[node.id];
    const prerequisiteRefs = details.prerequisites
      .map((entry) => entry.prerequisite_node)
      .filter((entry): entry is RelatedNodeRef => Boolean(entry));
    const dependentRefs = details.dependents
      .map((entry) => entry.dependent_node)
      .filter((entry): entry is RelatedNodeRef => Boolean(entry));
    const firstMissingPrerequisite = prerequisiteRefs.find((entry) =>
      learningMeta.missingPrerequisiteIds.includes(entry.id)
    ) || null;
    const prerequisiteCompletion = learningMeta.prerequisiteIds.length === 0
      ? 100
      : Math.round((learningMeta.masteredPrerequisiteIds.length / learningMeta.prerequisiteIds.length) * 100);

    return {
      learningMeta,
      progress,
      status: progress?.status || 'untouched',
      topicLabel: getTopicLabel(node.topic),
      prerequisiteRefs,
      dependentRefs,
      firstMissingPrerequisite,
      prerequisiteCompletion,
      lessonGoals: [
        `Explain ${node.title} in your own words.`,
        node.use_cases?.length
          ? `Recognize when it matters in ${node.use_cases[0]}.`
          : `Place it correctly inside ${node.subject?.name || 'this subject'}.`,
        dependentRefs.length > 0
          ? `Use it to unlock ${dependentRefs[0].title}.`
          : 'Connect it to the next concept in this topic.',
      ],
      estimatedMinutes: estimateStudyMinutes(node.difficulty),
    };
  }, [allPrerequisites, details, userProgress]);

  const questions = details?.masteryTest?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isEditable = graphMode === 'edit' || user?.role === 'admin' || user?.role === 'editor';

  const handleSubmitTest = useCallback(async () => {
    if (!details?.masteryTest) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_id: details.masteryTest.id, node_id: nodeId, answers }),
      });
      if (!res.ok) throw new Error('Failed to submit test');
      const data = await res.json();
      setTestResult(data.result);
      setTestPhase('results');
    } catch (error) {
      console.error('Test submit failed:', error);
    } finally {
      setSubmitting(false);
    }
  }, [answers, details?.masteryTest, nodeId]);

  if (loading) {
    return <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90">Loading lesson...</div>;
  }

  if (!details?.node || !derived) {
    return <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">Lesson not found.</div>;
  }

  const { node, outgoingEdges, incomingEdges, masteryTest } = details;
  const {
    estimatedMinutes,
    firstMissingPrerequisite,
    learningMeta,
    lessonGoals,
    prerequisiteCompletion,
    prerequisiteRefs,
    dependentRefs,
    progress,
    status,
    topicLabel,
  } = derived;

  return (
    <div className="absolute inset-0 z-50 overflow-hidden bg-slate-950/10 backdrop-blur-[1px]">
      <div className="flex h-full w-full justify-end">
        <div className="h-full w-full bg-white shadow-2xl xl:w-[min(1200px,92vw)]">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 bg-white/95">
              <div className="flex flex-wrap items-center gap-3 px-5 py-4 lg:px-8">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ChevronLeft className="h-4 w-4" />
                  Back to Graph
                </Button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {node.subject && (
                      <Badge variant="outline" style={{ borderColor: node.subject.color, color: node.subject.color }}>
                        {node.subject.name}
                      </Badge>
                    )}
                    <Badge variant="secondary">{topicLabel}</Badge>
                    <Badge variant="outline">{getDifficultyLabel(node.difficulty)}</Badge>
                    <Badge className={statusStyles(status)}>{status === 'mastered' ? 'Mastered' : status === 'in_progress' ? 'In Progress' : 'Ready To Learn'}</Badge>
                    {learningMeta.isLocked && <Badge className="border-rose-200 bg-rose-100 text-rose-700"><Lock className="mr-1 h-3 w-3" />Locked</Badge>}
                    {learningMeta.isReviewDue && <Badge className="border-amber-200 bg-amber-100 text-amber-800"><RotateCcw className="mr-1 h-3 w-3" />Review Due</Badge>}
                  </div>
                  <h1 className="mt-2 text-2xl font-bold text-slate-950 lg:text-3xl">{node.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                  {isEditable && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => onAddConnectedNode(nodeId)}><Plus className="h-3.5 w-3.5" />Add Connected</Button>
                      <Button variant="outline" size="sm" onClick={() => onLinkExistingNode(nodeId)}><Link2 className="h-3.5 w-3.5" />Link Existing</Button>
                      <Button variant="ghost" size="icon" onClick={() => onEditNode(nodeId)}><Edit3 className="h-4 w-4" /></Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="flex gap-1 border-t border-slate-100 px-5 py-2 lg:px-8">
                {([
                  ['learn', 'Lesson', GraduationCap],
                  ['test', 'Mastery Check', Trophy],
                  ['notes', 'Notes', StickyNote],
                ] as const).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${activeTab === id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1">
              {activeTab === 'learn' && (
                <ScrollArea className="h-full">
                  <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                      {learningMeta.isLocked && (
                        <Card className="border-rose-200 bg-rose-50/80">
                          <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="flex items-center gap-2 text-sm font-semibold text-rose-900">
                                <Lock className="h-4 w-4" />
                                Complete prerequisites first
                              </p>
                              <p className="mt-1 text-sm text-rose-700">
                                {firstMissingPrerequisite
                                  ? `${firstMissingPrerequisite.title} is the best next step before this node.`
                                  : 'This lesson is still waiting on earlier concepts.'}
                              </p>
                            </div>
                            {firstMissingPrerequisite && (
                              <Button variant="destructive" onClick={() => onNavigateToNode(firstMissingPrerequisite.id)}>
                                Open Prerequisite
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {learningMeta.isReviewDue && (
                        <Card className="border-amber-200 bg-amber-50/80">
                          <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                                <RotateCcw className="h-4 w-4" />
                                Review recommended now
                              </p>
                              <p className="mt-1 text-sm text-amber-700">
                                You have already mastered this concept, and it is ready for a quick refresh.
                              </p>
                            </div>
                            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setActiveTab('test')}>
                              Start Review
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-sky-600" />
                            Lesson Overview
                          </CardTitle>
                          <CardDescription>Start with the core explanation before branching outward.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {node.description.split('\n').filter(Boolean).map((paragraph, index) => (
                            <p key={index} className="text-sm leading-7 text-slate-700 lg:text-[15px]">
                              {paragraph}
                            </p>
                          ))}
                        </CardContent>
                      </Card>

                      <div className="grid gap-6 xl:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Target className="h-5 w-5 text-emerald-600" />
                              By The End Of This Lesson
                            </CardTitle>
                            <CardDescription>Three clear outcomes to aim for while you study.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {lessonGoals.map((goal) => (
                              <div key={goal} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                                <p className="text-sm text-slate-700">{goal}</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-amber-500" />
                              Why This Matters
                            </CardTitle>
                            <CardDescription>Use this to connect the concept to something practical.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm leading-7 text-slate-700">
                              {node.why_it_matters || `${node.title} helps support later concepts in ${node.subject?.name || 'the graph'}.`}
                            </p>
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                              {dependentRefs.length > 0
                                ? `This concept directly unlocks ${dependentRefs.length} later lesson${dependentRefs.length === 1 ? '' : 's'}.`
                                : 'This topic still benefits from learning the idea now, even if the follow-up chain is still being built.'}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {node.use_cases && node.use_cases.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <GraduationCap className="h-5 w-5 text-violet-600" />
                              Examples And Use Cases
                            </CardTitle>
                            <CardDescription>These anchors make the concept easier to recall later.</CardDescription>
                          </CardHeader>
                          <CardContent className="grid gap-3 md:grid-cols-2">
                            {node.use_cases.map((useCase) => (
                              <div key={useCase} className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-4">
                                <p className="text-sm font-medium text-violet-900">{useCase}</p>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      <div className="grid gap-6 xl:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <ArrowLeft className="h-5 w-5 text-sky-600" />
                              Prerequisites
                            </CardTitle>
                            <CardDescription>What should already be comfortable before this lesson goes deep.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {prerequisiteRefs.length === 0 ? (
                              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                No prerequisites. This is a clean entry point.
                              </div>
                            ) : (
                              prerequisiteRefs.map((entry) => {
                                const isMissing = learningMeta.missingPrerequisiteIds.includes(entry.id);
                                return (
                                  <button
                                    key={entry.id}
                                    onClick={() => onNavigateToNode(entry.id)}
                                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                                      isMissing ? 'border-rose-200 bg-rose-50 hover:bg-rose-100' : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                                    }`}
                                  >
                                    <div>
                                      <p className={`text-sm font-medium ${isMissing ? 'text-rose-900' : 'text-emerald-900'}`}>{entry.title}</p>
                                      <p className={`text-xs ${isMissing ? 'text-rose-700' : 'text-emerald-700'}`}>
                                        {isMissing ? 'Still needed before this node is unlocked.' : 'Already mastered.'}
                                      </p>
                                    </div>
                                    <ArrowRight className={`h-4 w-4 ${isMissing ? 'text-rose-500' : 'text-emerald-500'}`} />
                                  </button>
                                );
                              })
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <ArrowRight className="h-5 w-5 text-indigo-600" />
                              This Concept Unlocks
                            </CardTitle>
                            <CardDescription>Later lessons that depend on understanding this one.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {dependentRefs.length === 0 ? (
                              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                No direct dependent lessons are wired yet.
                              </div>
                            ) : (
                              dependentRefs.map((entry) => (
                                <button
                                  key={entry.id}
                                  onClick={() => onNavigateToNode(entry.id)}
                                  className="flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-left hover:bg-indigo-100"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-indigo-950">{entry.title}</p>
                                    <p className="text-xs text-indigo-700">Unlocked through prerequisite progress.</p>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-indigo-500" />
                                </button>
                              ))
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Layers3 className="h-5 w-5 text-fuchsia-600" />
                            Connected Concepts
                          </CardTitle>
                          <CardDescription>Move through nearby ideas without losing your place in the lesson.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 xl:grid-cols-2">
                          <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Leads Outward</p>
                            {outgoingEdges.length === 0 ? (
                              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">No outgoing links yet.</div>
                            ) : (
                              outgoingEdges.map((edge) => (
                                <button
                                  key={edge.id}
                                  onClick={() => edge.target_node?.id && onNavigateToNode(edge.target_node.id)}
                                  className="flex w-full items-center justify-between rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-left hover:bg-sky-100"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-sky-950">{edge.target_node?.title || 'Unknown concept'}</p>
                                    <p className="text-xs text-sky-700">{getRelationshipLabel(edge.relationship_type)}</p>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-sky-500" />
                                </button>
                              ))
                            )}
                          </div>

                          <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Feeds Into This</p>
                            {incomingEdges.length === 0 ? (
                              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">No incoming links yet.</div>
                            ) : (
                              incomingEdges.map((edge) => (
                                <button
                                  key={edge.id}
                                  onClick={() => edge.source_node?.id && onNavigateToNode(edge.source_node.id)}
                                  className="flex w-full items-center justify-between rounded-xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-left hover:bg-fuchsia-100"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-fuchsia-950">{edge.source_node?.title || 'Unknown concept'}</p>
                                    <p className="text-xs text-fuchsia-700">{getRelationshipLabel(edge.relationship_type)}</p>
                                  </div>
                                  <ArrowLeft className="h-4 w-4 text-fuchsia-500" />
                                </button>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Lesson Snapshot</CardTitle>
                          <CardDescription>The high-level information you usually want first.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Study Time</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900">{estimatedMinutes} min</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Difficulty</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900">{node.difficulty}/10</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Prerequisite progress</span>
                              <span className="font-medium text-slate-900">{prerequisiteCompletion}%</span>
                            </div>
                            <Progress value={prerequisiteCompletion} className="h-2" />
                          </div>

                          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Best score</span><span className="font-semibold text-slate-900">{progress?.latest_score != null ? `${progress.latest_score}%` : 'Not tested'}</span></div>
                            <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Attempts</span><span className="font-semibold text-slate-900">{progress?.attempt_count || 0}</span></div>
                            <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Next review</span><span className="font-semibold text-slate-900">{learningMeta.nextReviewAt ? formatDate(learningMeta.nextReviewAt) : 'After mastery'}</span></div>
                          </div>

                          {learningMeta.isLocked && firstMissingPrerequisite ? (
                            <Button variant="destructive" className="w-full" onClick={() => onNavigateToNode(firstMissingPrerequisite.id)}>
                              Open {firstMissingPrerequisite.title}
                            </Button>
                          ) : (
                            <Button className="w-full" onClick={() => setActiveTab('test')}>
                              <PlayCircle className="h-4 w-4" />
                              {progress?.attempt_count ? 'Retake Mastery Check' : 'Start Mastery Check'}
                            </Button>
                          )}

                          <Button variant="outline" className="w-full" onClick={() => setActiveTab('notes')}>
                            <StickyNote className="h-4 w-4" />
                            Open Notes
                          </Button>

                          {onStartTest && masteryTest && (
                            <Button variant="ghost" className="w-full" onClick={() => onStartTest(nodeId)}>
                              Open Test Focus Mode
                            </Button>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border-slate-200 bg-slate-50/80">
                        <CardHeader>
                          <CardTitle>After This Lesson</CardTitle>
                          <CardDescription>A simple next-step guide so the graph feels less open-ended.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {dependentRefs.length > 0 ? dependentRefs.slice(0, 4).map((entry) => (
                            <button
                              key={entry.id}
                              onClick={() => onNavigateToNode(entry.id)}
                              className="flex w-full items-center justify-between rounded-xl border border-white bg-white px-4 py-3 text-left shadow-sm hover:bg-slate-50"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-900">{entry.title}</p>
                                <p className="text-xs text-slate-500">Unlocked by this concept</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-400" />
                            </button>
                          )) : (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-600">
                              This concept still needs more follow-up wiring in the graph.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
              )}

              {activeTab === 'test' && (
                <ScrollArea className="h-full">
                  <div className="mx-auto w-full max-w-4xl px-5 py-6 lg:px-8">
                    {!masteryTest ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>No mastery check yet</CardTitle>
                          <CardDescription>This concept still needs a test before learners can verify mastery.</CardDescription>
                        </CardHeader>
                      </Card>
                    ) : testPhase === 'idle' ? (
                      <div className="space-y-6">
                        <Card className="bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_55%),white]">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Trophy className="h-5 w-5 text-amber-500" />
                              {masteryTest.title}
                            </CardTitle>
                            <CardDescription>
                              {masteryTest.instructions || 'Use this mastery check to confirm that the lesson really stuck.'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Questions</p>
                              <p className="mt-2 text-2xl font-semibold text-slate-900">{questions.length}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Passing Score</p>
                              <p className="mt-2 text-2xl font-semibold text-slate-900">{masteryTest.passing_score}%</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Best Score</p>
                              <p className="mt-2 text-2xl font-semibold text-slate-900">{progress?.latest_score != null ? `${progress.latest_score}%` : 'None'}</p>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={() => {
                              setTestPhase('questions');
                              setCurrentQuestionIndex(0);
                              setAnswers({});
                              setTestResult(null);
                            }}
                          >
                            <PlayCircle className="h-4 w-4" />
                            {progress?.attempt_count ? 'Retake Mastery Check' : 'Start Mastery Check'}
                          </Button>
                          <Button variant="outline" onClick={() => setActiveTab('learn')}>Review Lesson First</Button>
                        </div>
                      </div>
                    ) : testPhase === 'questions' && currentQuestion ? (
                      <Card>
                        <CardHeader>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                              <CardDescription>
                                {currentQuestion.question_type.replace('_', ' ')} • {currentQuestionIndex + 1} of {questions.length}
                              </CardDescription>
                            </div>
                            <div className="w-full max-w-56">
                              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
                            <p className="text-base font-medium leading-7 text-slate-900">{currentQuestion.prompt}</p>
                          </div>

                          {currentQuestion.question_type === 'short_answer' ? (
                            <Input
                              value={answers[currentQuestion.id] || ''}
                              onChange={(event) => setAnswers((current) => ({ ...current, [currentQuestion.id]: event.target.value }))}
                              placeholder="Write your answer here"
                              className="h-12"
                            />
                          ) : (
                            <div className="space-y-3">
                              {(currentQuestion.options || []).map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: option.id }))}
                                  className={`w-full rounded-2xl border px-5 py-4 text-left text-sm ${
                                    answers[currentQuestion.id] === option.id
                                      ? 'border-blue-300 bg-blue-50 text-blue-950'
                                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  {option.option_text}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap justify-between gap-3">
                            <Button variant="outline" onClick={() => setCurrentQuestionIndex((current) => Math.max(current - 1, 0))} disabled={currentQuestionIndex === 0}>
                              Previous
                            </Button>
                            {currentQuestionIndex < questions.length - 1 ? (
                              <Button onClick={() => setCurrentQuestionIndex((current) => current + 1)} disabled={!answers[currentQuestion.id]}>
                                Next
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button onClick={handleSubmitTest} disabled={submitting || !answers[currentQuestion.id]}>
                                {submitting ? 'Submitting...' : 'Submit Mastery Check'}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ) : testPhase === 'results' && testResult ? (
                      <div className="space-y-6">
                        <Card className={testResult.passed ? 'border-emerald-200 bg-emerald-50/80' : 'border-rose-200 bg-rose-50/80'}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              {testResult.passed ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-rose-600" />}
                              {testResult.passed ? 'Mastery confirmed' : 'Almost there'}
                            </CardTitle>
                            <CardDescription>
                              {testResult.correct_answers} of {testResult.total_questions} answers were correct.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="text-4xl font-bold text-slate-950">{testResult.score}%</div>
                            <div className="flex flex-wrap gap-3">
                              {!testResult.passed && (
                                <Button variant="outline" onClick={() => { setTestPhase('questions'); setCurrentQuestionIndex(0); }}>
                                  Try Again
                                </Button>
                              )}
                              <Button onClick={() => setActiveTab('learn')}>Return to Lesson</Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Question Feedback</CardTitle>
                            <CardDescription>Use this to target review instead of rereading everything.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {testResult.feedback.map((feedback) => {
                              const question = questions.find((entry) => entry.id === feedback.question_id);
                              return (
                                <div key={feedback.question_id} className={`rounded-2xl border px-4 py-4 ${feedback.correct ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60'}`}>
                                  <p className="text-sm font-medium text-slate-900">{question?.prompt}</p>
                                  {!feedback.correct && feedback.correct_answer && (
                                    <p className="mt-1 text-xs text-slate-600">Correct answer: <span className="font-medium">{feedback.correct_answer}</span></p>
                                  )}
                                  {feedback.explanation && (
                                    <p className="mt-1 text-xs leading-6 text-slate-600">{feedback.explanation}</p>
                                  )}
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      </div>
                    ) : null}
                  </div>
                </ScrollArea>
              )}
              {activeTab === 'notes' && (
                <div className="flex h-full flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4 lg:px-8">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Notes for {node.title}</p>
                      <p className="text-xs text-slate-500">
                        Capture explanations in your own words, formulas, pitfalls, and examples.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {isSaving ? (
                        <span className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" />Saving...</span>
                      ) : lastSavedAt ? (
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Saved {formatDate(lastSavedAt)}</span>
                      ) : null}
                      <Button variant="outline" size="sm" onClick={() => saveNote(noteContent)} disabled={isSaving}>
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 bg-slate-50/50 p-5 lg:p-8">
                    <textarea
                      value={noteContent}
                      onChange={(event) => handleNoteChange(event.target.value)}
                      placeholder={`Write your notes about ${node.title} here...

Try capturing:
- the simplest explanation in your own words
- what usually causes confusion
- one example you can remember later
- anything you still want to ask`}
                      className="h-full min-h-[420px] w-full resize-none rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-800 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                      spellCheck
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
