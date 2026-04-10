"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGraphStore } from '@/store';
import type { MasteryTest, MasteryQuestion, TestResult, QuestionFeedback } from '@/types';
import { CheckCircle, XCircle, Trophy, RotateCcw, ArrowRight, AlertCircle } from 'lucide-react';

interface MasteryTestModalProps {
  open: boolean;
  onClose: () => void;
  nodeId: string;
}

type TestPhase = 'loading' | 'instructions' | 'questions' | 'results';

export function MasteryTestModal({ open, onClose, nodeId }: MasteryTestModalProps) {
  const { nodes, updateNodeProgress, userProgress } = useGraphStore();
  const node = nodes.find((n) => n.id === nodeId);

  const [phase, setPhase] = useState<TestPhase>('loading');
  const [test, setTest] = useState<MasteryTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch test on open
  useEffect(() => {
    if (open && nodeId) {
      fetchTest();
    }
    return () => {
      setPhase('loading');
      setTest(null);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setResult(null);
      setError('');
    };
  }, [open, nodeId]);

  const fetchTest = async () => {
    setPhase('loading');
    try {
      const res = await fetch(`/api/tests?node_id=${nodeId}`);
      if (!res.ok) {
        setError('No mastery test available for this concept.');
        return;
      }
      const data = await res.json();
      setTest(data.test);
      setPhase('instructions');
    } catch {
      setError('Failed to load test.');
    }
  };

  const questions = test?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!test) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: test.id,
          node_id: nodeId,
          answers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit test');
      }

      const data = await res.json();
      setResult(data.result);
      setPhase('results');

      // Update local progress state
      if (data.result.passed) {
        updateNodeProgress(nodeId, {
          ...userProgress[nodeId],
          id: userProgress[nodeId]?.id || '',
          user_id: userProgress[nodeId]?.user_id || '',
          node_id: nodeId,
          status: 'mastered',
          latest_score: data.result.score,
          mastered_at: new Date().toISOString(),
          attempt_count: (userProgress[nodeId]?.attempt_count || 0) + 1,
        });
      } else {
        updateNodeProgress(nodeId, {
          ...userProgress[nodeId],
          id: userProgress[nodeId]?.id || '',
          user_id: userProgress[nodeId]?.user_id || '',
          node_id: nodeId,
          status: 'in_progress',
          latest_score: data.result.score,
          attempt_count: (userProgress[nodeId]?.attempt_count || 0) + 1,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setPhase('instructions');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setError('');
  };

  const renderContent = () => {
    if (error && phase === 'loading') {
      return (
        <div className="py-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">{error}</p>
          <Button variant="outline" onClick={onClose} className="mt-4">Close</Button>
        </div>
      );
    }

    if (phase === 'loading') {
      return (
        <div className="py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      );
    }

    if (phase === 'instructions') {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900">{test?.title}</h3>
            {test?.instructions && (
              <p className="text-sm text-blue-700 mt-1">{test.instructions}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-gray-500">Questions</span>
              <p className="font-semibold text-gray-900">{questions.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-gray-500">Passing Score</span>
              <p className="font-semibold text-gray-900">{test?.passing_score}%</p>
            </div>
          </div>
          <Button className="w-full" onClick={() => setPhase('questions')}>
            Start Test
          </Button>
        </div>
      );
    }

    if (phase === 'questions' && currentQuestion) {
      return (
        <div className="space-y-4">
          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Question */}
          <div className="bg-gray-50 rounded-lg p-4">
            <Badge variant="secondary" className="mb-2">
              {currentQuestion.question_type.replace('_', ' ')}
            </Badge>
            <p className="text-sm font-medium text-gray-900 leading-relaxed">{currentQuestion.prompt}</p>
          </div>

          {/* Answer options */}
          {currentQuestion.question_type === 'short_answer' ? (
            <Input
              placeholder="Type your answer..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
            />
          ) : (
            <div className="space-y-2">
              {(currentQuestion.options || []).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectAnswer(currentQuestion.id, option.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                    answers[currentQuestion.id] === option.id
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.option_text}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
              Previous
            </Button>
            <div className="flex gap-2">
              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={handleNext} disabled={!answers[currentQuestion.id]}>
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting || !answers[currentQuestion.id]}>
                  {submitting ? 'Submitting...' : 'Submit Test'}
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (phase === 'results' && result) {
      const passed = result.passed;
      return (
        <div className="space-y-4">
          {/* Score */}
          <div className={`text-center p-6 rounded-xl ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
            {passed ? (
              <Trophy className="w-12 h-12 text-green-500 mx-auto mb-2" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            )}
            <h3 className={`text-2xl font-bold ${passed ? 'text-green-800' : 'text-red-800'}`}>
              {result.score}%
            </h3>
            <p className={`text-sm ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? '🎉 Congratulations! You passed!' : 'Not quite. Keep studying and try again!'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {result.correct_answers} of {result.total_questions} correct
            </p>
          </div>

          {/* Feedback */}
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {result.feedback.map((fb, idx) => {
                const question = questions.find((q) => q.id === fb.question_id);
                return (
                  <div
                    key={fb.question_id}
                    className={`p-3 rounded-lg border text-sm ${
                      fb.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {fb.correct ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{question?.prompt}</p>
                        {!fb.correct && fb.correct_answer && (
                          <p className="text-xs mt-1 text-gray-600">
                            Correct answer: <span className="font-medium">{fb.correct_answer}</span>
                          </p>
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
          </ScrollArea>

          {/* Actions */}
          <div className="flex gap-2">
            {!passed && (
              <Button variant="outline" className="flex-1" onClick={handleRetake}>
                <RotateCcw className="w-4 h-4 mr-1" /> Retake
              </Button>
            )}
            <Button className="flex-1" onClick={onClose}>
              {passed ? 'Continue Learning' : 'Back to Graph'}
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {phase === 'results'
              ? 'Test Results'
              : `Mastery Test: ${node?.title || 'Unknown'}`}
          </DialogTitle>
          {phase !== 'results' && (
            <DialogDescription>
              Demonstrate your understanding of {node?.title} to mark it as mastered.
            </DialogDescription>
          )}
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
