"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGraphStore, useAuthStore, useNotesStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  X, BookOpen, CheckCircle, PlayCircle, Plus, Link2, Edit,
  ArrowRight, ArrowLeft, Lightbulb, Target, Layers, AlertCircle,
  StickyNote, GraduationCap, FileText, Save, Clock, ChevronLeft,
} from 'lucide-react';
import { getRelationshipLabel, getDifficultyLabel, formatDate } from '@/lib/utils';
import type { MasteryTest, MasteryQuestion, KnowledgeNode, Edge as KEdge, TestResult } from '@/types';

type TabId = 'learn' | 'test' | 'notes';

interface NodeWorkspaceProps {
  nodeId: string;
  onClose: () => void;
  onStartTest: (nodeId: string) => void;
  onAddConnectedNode: (nodeId: string) => void;
  onLinkExistingNode: (nodeId: string) => void;
  onEditNode: (nodeId: string) => void;
  onNavigateToNode: (nodeId: string) => void;
}

interface NodeDetails {
  node: KnowledgeNode;
  outgoingEdges: Array<KEdge & { target_node?: { id: string; title: string; slug: string } }>;
  incomingEdges: Array<KEdge & { source_node?: { id: string; title: string; slug: string } }>;
  prerequisites: Array<{ prerequisite_node?: { id: string; title: string; slug: string } }>;
  dependents: Array<{ dependent_node?: { id: string; title: string; slug: string } }>;
  masteryTest: MasteryTest | null;
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
  const { userProgress, graphMode } = useGraphStore();
  const { user } = useAuthStore();
  const { notesByNodeId, setNote, updateNoteContent, setSaving, setLastSaved, isSaving, lastSavedAt } = useNotesStore();

  const [activeTab, setActiveTab] = useState<TabId>('learn');
  const [details, setDetails] = useState<NodeDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Test state (inline)
  const [testPhase, setTestPhase] = useState<'idle' | 'instructions' | 'questions' | 'results'>('idle');
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Note state
  const noteContent = notesByNodeId[nodeId]?.content || '';
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ---- Fetch node details ----
  useEffect(() => {
    async function fetchNodeDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/nodes/${nodeId}`);
        if (res.ok) {
          const data = await res.json();
          setDetails(data);
        }
      } catch (error) {
        console.error('Failed to fetch node details:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNodeDetails();
    // Reset test state when switching nodes
    setTestPhase('idle');
    setCurrentQIdx(0);
    setAnswers({});
    setTestResult(null);
  }, [nodeId]);

  // ---- Fetch note for this node ----
  useEffect(() => {
    async function fetchNote() {
      try {
        const res = await fetch(`/api/notes?node_id=${nodeId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.note) {
            setNote(nodeId, data.note);
          }
        }
      } catch (err) {
        console.error('Failed to fetch note:', err);
      }
    }
    fetchNote();
  }, [nodeId, setNote]);

  // ---- Auto-save note with debounce ----
  const saveNote = useCallback(async (content: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: nodeId, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setNote(nodeId, data.note);
        setLastSaved(new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  }, [nodeId, setNote, setSaving, setLastSaved]);

  const handleNoteChange = useCallback((content: string) => {
    updateNoteContent(nodeId, content);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveNote(content), 1000);
  }, [nodeId, updateNoteContent, saveNote]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ---- Test handlers ----
  const questions = details?.masteryTest?.questions || [];
  const currentQuestion = questions[currentQIdx];

  const handleSubmitTest = async () => {
    if (!details?.masteryTest) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: details.masteryTest.id,
          node_id: nodeId,
          answers,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult(data.result);
        setTestPhase('results');
      }
    } catch (err) {
      console.error('Test submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 z-50 bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!details?.node) {
    return (
      <div className="absolute inset-0 z-50 bg-white flex items-center justify-center">
        <p className="text-gray-500">Node not found</p>
      </div>
    );
  }

  const { node, outgoingEdges, incomingEdges, prerequisites, dependents, masteryTest } = details;
  const progress = userProgress[nodeId];
  const status = progress?.status || 'untouched';

  const statusConfig = {
    untouched: { label: 'Not Started', color: 'bg-blue-100 text-blue-800', icon: BookOpen },
    in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-800', icon: AlertCircle },
    mastered: { label: 'Mastered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'learn', label: 'Learn', icon: GraduationCap },
    { id: 'test', label: 'Mastery Test', icon: PlayCircle },
    { id: 'notes', label: 'My Notes', icon: StickyNote },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col">
      {/* ===== HEADER ===== */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3 px-6 py-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Graph
          </button>

          <div className="h-5 w-px bg-gray-200" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {node.subject && (
                <Badge
                  variant="outline"
                  style={{ borderColor: node.subject.color, color: node.subject.color }}
                >
                  {node.subject.name}
                </Badge>
              )}
              <Badge variant="secondary">{getDifficultyLabel(node.difficulty)}</Badge>
              <Badge className={statusConfig[status].color}>
                {statusConfig[status].label}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{node.title}</h1>
            {node.topic && <p className="text-sm text-gray-500">{node.topic}</p>}
          </div>

          {/* Edit actions */}
          {(graphMode === 'edit' || user?.role === 'admin' || user?.role === 'editor') && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onAddConnectedNode(nodeId)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Connected
              </Button>
              <Button variant="outline" size="sm" onClick={() => onLinkExistingNode(nodeId)}>
                <Link2 className="w-3.5 h-3.5 mr-1" /> Link
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEditNode(nodeId)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="flex-1 overflow-hidden">
        {/* ---- LEARN TAB ---- */}
        {activeTab === 'learn' && (
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto p-8 space-y-8">
              {/* Description - the core learning content */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  What is {node.title}?
                </h2>
                <div className="prose prose-sm prose-gray max-w-none">
                  {node.description.split('\n').map((para, i) => (
                    <p key={i} className="text-gray-700 leading-relaxed">{para}</p>
                  ))}
                </div>
              </section>

              {/* Why It Matters */}
              {node.why_it_matters && (
                <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <h2 className="text-lg font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    Why It Matters
                  </h2>
                  <p className="text-sm text-amber-800 leading-relaxed">{node.why_it_matters}</p>
                </section>
              )}

              {/* Use Cases */}
              {node.use_cases && node.use_cases.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Real-World Applications
                  </h2>
                  <div className="grid gap-2">
                    {node.use_cases.map((uc, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                        <span className="text-green-500 font-bold mt-0.5">→</span>
                        <span className="text-sm text-gray-700">{uc}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Prerequisites */}
              {prerequisites.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5 text-purple-600" />
                    Prerequisites — learn these first
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {prerequisites.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => p.prerequisite_node?.id && onNavigateToNode(p.prerequisite_node.id)}
                        className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                      >
                        {p.prerequisite_node?.title || 'Unknown'}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Connections */}
              {(outgoingEdges.length > 0 || incomingEdges.length > 0) && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    Connected Concepts
                  </h2>
                  <div className="grid gap-2">
                    {outgoingEdges.map((edge) => (
                      <button
                        key={edge.id}
                        onClick={() => edge.target_node?.id && onNavigateToNode(edge.target_node.id)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span className="font-medium">{edge.target_node?.title}</span>
                        <span className="text-xs text-blue-500 ml-auto">
                          {getRelationshipLabel(edge.relationship_type)}
                        </span>
                      </button>
                    ))}
                    {incomingEdges.map((edge) => (
                      <button
                        key={edge.id}
                        onClick={() => edge.source_node?.id && onNavigateToNode(edge.source_node.id)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="font-medium">{edge.source_node?.title}</span>
                        <span className="text-xs text-purple-500 ml-auto">
                          {getRelationshipLabel(edge.relationship_type)}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Difficulty info */}
              <section className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-900">Difficulty:</span>{' '}
                    {getDifficultyLabel(node.difficulty)} ({node.difficulty}/10)
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 rounded-full ${
                          level <= node.difficulty ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {progress?.latest_score != null && (
                    <div className="ml-auto">
                      <span className="font-medium text-gray-900">Best score:</span> {progress.latest_score}%
                    </div>
                  )}
                </div>
              </section>
            </div>
          </ScrollArea>
        )}

        {/* ---- TEST TAB ---- */}
        {activeTab === 'test' && (
          <ScrollArea className="h-full">
            <div className="max-w-2xl mx-auto p-8">
              {!masteryTest ? (
                <div className="text-center py-16">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-600">No Mastery Test Available</h3>
                  <p className="text-sm text-gray-400 mt-1">A test hasn&apos;t been created for this concept yet.</p>
                </div>
              ) : testPhase === 'idle' || testPhase === 'instructions' ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-blue-900">{masteryTest.title}</h3>
                    {masteryTest.instructions && (
                      <p className="text-sm text-blue-700 mt-2 max-w-md mx-auto">{masteryTest.instructions}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
                      <p className="text-sm text-gray-500">Questions</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{masteryTest.passing_score}%</p>
                      <p className="text-sm text-gray-500">Passing Score</p>
                    </div>
                  </div>
                  {progress?.attempt_count ? (
                    <div className="bg-gray-50 rounded-lg p-3 text-center text-sm text-gray-600">
                      Previous attempts: {progress.attempt_count} · Best score: {progress.latest_score}%
                    </div>
                  ) : null}
                  <Button className="w-full h-12 text-base" onClick={() => {
                    setTestPhase('questions');
                    setCurrentQIdx(0);
                    setAnswers({});
                    setTestResult(null);
                  }}>
                    <PlayCircle className="w-5 h-5 mr-2" />
                    {progress?.attempt_count ? 'Retake Test' : 'Start Test'}
                  </Button>
                </div>
              ) : testPhase === 'questions' && currentQuestion ? (
                <div className="space-y-6">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Question {currentQIdx + 1} of {questions.length}</span>
                      <span>{Math.round(((currentQIdx + 1) / questions.length) * 100)}%</span>
                    </div>
                    <Progress value={((currentQIdx + 1) / questions.length) * 100} />
                  </div>

                  {/* Question */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <Badge variant="secondary" className="mb-3">
                      {currentQuestion.question_type.replace('_', ' ')}
                    </Badge>
                    <p className="text-base font-medium text-gray-900 leading-relaxed">
                      {currentQuestion.prompt}
                    </p>
                  </div>

                  {/* Answers */}
                  {currentQuestion.question_type === 'short_answer' ? (
                    <Input
                      placeholder="Type your answer..."
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                      className="h-12"
                    />
                  ) : (
                    <div className="space-y-2">
                      {(currentQuestion.options || []).map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setAnswers({ ...answers, [currentQuestion.id]: option.id })}
                          className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-sm ${
                            answers[currentQuestion.id] === option.id
                              ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {option.option_text}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Nav */}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentQIdx(Math.max(0, currentQIdx - 1))} disabled={currentQIdx === 0}>
                      Previous
                    </Button>
                    {currentQIdx < questions.length - 1 ? (
                      <Button onClick={() => setCurrentQIdx(currentQIdx + 1)} disabled={!answers[currentQuestion.id]}>
                        Next <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmitTest} disabled={submitting || !answers[currentQuestion.id]}>
                        {submitting ? 'Submitting...' : 'Submit Test'}
                      </Button>
                    )}
                  </div>
                </div>
              ) : testPhase === 'results' && testResult ? (
                <div className="space-y-6">
                  <div className={`text-center p-8 rounded-xl ${testResult.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                    {testResult.passed ? (
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                    ) : (
                      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-3" />
                    )}
                    <h3 className={`text-3xl font-bold ${testResult.passed ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.score}%
                    </h3>
                    <p className={`text-sm mt-1 ${testResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.passed ? '🎉 Congratulations! You mastered this concept!' : 'Not quite — review the material and try again!'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {testResult.correct_answers} of {testResult.total_questions} correct
                    </p>
                  </div>

                  {/* Question feedback */}
                  <div className="space-y-3">
                    {testResult.feedback.map((fb) => {
                      const q = questions.find((qq) => qq.id === fb.question_id);
                      return (
                        <div
                          key={fb.question_id}
                          className={`p-4 rounded-lg border ${fb.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                        >
                          <div className="flex items-start gap-2">
                            {fb.correct ? <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{q?.prompt}</p>
                              {!fb.correct && fb.correct_answer && (
                                <p className="text-xs mt-1 text-gray-600">Correct: <strong>{fb.correct_answer}</strong></p>
                              )}
                              {fb.explanation && (
                                <p className="text-xs mt-1 text-gray-500 italic">{fb.explanation}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    {!testResult.passed && (
                      <Button variant="outline" className="flex-1" onClick={() => { setTestPhase('instructions'); }}>
                        Retake Test
                      </Button>
                    )}
                    <Button className="flex-1" onClick={() => setActiveTab('learn')}>
                      {testResult.passed ? 'Continue Learning' : 'Review Material'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </ScrollArea>
        )}

        {/* ---- NOTES TAB ---- */}
        {activeTab === 'notes' && (
          <div className="h-full flex flex-col">
            {/* Note toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <StickyNote className="w-4 h-4" />
                <span>Your notes for <strong className="text-gray-700">{node.title}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {isSaving && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Saving...
                  </span>
                )}
                {!isSaving && lastSavedAt && (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Saved
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => saveNote(noteContent)}
                  disabled={isSaving}
                >
                  <Save className="w-3.5 h-3.5 mr-1" /> Save
                </Button>
              </div>
            </div>

            {/* Note editor */}
            <div className="flex-1 p-6">
              <textarea
                value={noteContent}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder={`Write your notes about ${node.title} here...\n\nTips:\n• Summarize key concepts in your own words\n• Write down formulas and key equations\n• Add personal examples or mnemonics\n• Note any questions you have\n\nThese notes auto-save and are included in your Master Notes.`}
                className="w-full h-full resize-none border-0 outline-none text-sm text-gray-800 leading-relaxed placeholder:text-gray-400 bg-transparent font-mono"
                spellCheck
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
