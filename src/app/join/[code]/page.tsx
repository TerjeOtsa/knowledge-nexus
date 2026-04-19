"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Layers,
  Lightbulb,
  Loader2,
  Network,
  PlayCircle,
  Target,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDifficultyLabel } from '@/lib/utils';

interface ShareData {
  code: string;
  label: string;
  node: {
    id: string;
    title: string;
    slug: string;
    topic: string | null;
    description: string;
    why_it_matters: string | null;
    use_cases: string[];
    difficulty: number;
    subject: { id: string; name: string; color: string; icon?: string } | null;
  };
  test: {
    id: string;
    title: string;
    passing_score: number;
    question_count: number;
  } | null;
}

export default function JoinCodePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  const code = (Array.isArray(params.code) ? params.code[0] : params.code)?.toUpperCase() ?? '';

  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetch(`/api/share/${code}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok || d.error) setError(d.error || 'Share code not found.');
        else setData(d);
      })
      .catch(() => setError('Could not load the shared node. Check the code and try again.'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Code not found</h1>
          <p className="text-slate-500 text-sm">
            {error || 'This share code does not exist or has been removed.'}
          </p>
          <Button variant="outline" onClick={() => router.push('/join')}>
            Try another code
          </Button>
        </div>
      </div>
    );
  }

  const { node, test } = data;
  const subjectColor = node.subject?.color ?? '#64748b';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header bar */}
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: subjectColor }}
            >
              {node.subject?.icon ?? '📚'}
            </div>
            <span className="text-sm font-semibold text-slate-800">Knowledge Nexus</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Code: {code}</span>
            {user ? (
              <Button size="sm" variant="outline" onClick={() => router.push('/graph?view=graph')}>
                <Network className="h-3.5 w-3.5 mr-1.5" />
                Open Graph
              </Button>
            ) : (
              <Button size="sm" onClick={() => router.push(`/login?redirect=/join/${code}`)}>
                Log in
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        {/* Node header */}
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {node.subject && (
              <Badge
                variant="outline"
                style={{ borderColor: subjectColor, color: subjectColor }}
              >
                {node.subject.name}
              </Badge>
            )}
            {node.topic && (
              <Badge variant="secondary">{node.topic}</Badge>
            )}
            <Badge variant="secondary">{getDifficultyLabel(node.difficulty)}</Badge>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">{node.title}</h1>

          <p className="text-slate-600 leading-relaxed">{node.description}</p>
        </div>

        {/* Why it matters */}
        {node.why_it_matters && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-8 py-6 space-y-2">
            <h2 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4" /> Why It Matters
            </h2>
            <p className="text-amber-900 text-sm leading-relaxed">{node.why_it_matters}</p>
          </div>
        )}

        {/* Use cases */}
        {node.use_cases && node.use_cases.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Target className="h-4 w-4" /> Use Cases
            </h2>
            <ul className="space-y-2">
              {node.use_cases.map((uc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: subjectColor }} />
                  {uc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mastery test info */}
        {test ? (
          <div className="rounded-3xl border border-blue-200 bg-blue-50 px-8 py-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-blue-800 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> Mastery Test Available
                </h2>
                <p className="text-xs text-blue-600">
                  {test.question_count} question{test.question_count === 1 ? '' : 's'} · Pass at {test.passing_score}%
                </p>
              </div>
              {user ? (
                <Button
                  size="sm"
                  onClick={() => router.push('/graph?view=graph')}
                >
                  <PlayCircle className="h-4 w-4 mr-1.5" />
                  Take Test in Graph
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => router.push(`/login?redirect=/join/${code}`)}
                >
                  Log in to take test
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              )}
            </div>
            {!user && (
              <p className="text-xs text-blue-600">
                You need a Knowledge Nexus account to take mastery tests and track your progress.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-8 py-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-400" />
            <p className="text-sm text-slate-500">No mastery test attached to this node yet.</p>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700">Explore the Full Graph</h2>
          </div>
          <p className="text-sm text-slate-500">
            This node is part of a connected knowledge network. Open the graph to see how it links
            to other concepts, navigate to prerequisites, and track your mastery progress.
          </p>
          {user ? (
            <Button onClick={() => router.push('/graph?view=graph')}>
              <Network className="h-4 w-4 mr-1.5" />
              Open Knowledge Graph
            </Button>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push(`/login?redirect=/join/${code}`)}>
                Log in to explore
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Button variant="outline" onClick={() => router.push(`/register?redirect=/join/${code}`)}>
                Create account
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
