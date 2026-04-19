"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  LayoutDashboard,
  Loader2,
  Network,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { Navbar } from '@/components/layout/navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { DashboardStats, KnowledgeNode } from '@/types';

function lessonHref(node: Pick<KnowledgeNode, 'id'>, view: 'graph' | 'list' = 'list') {
  return `/graph?view=${view}&node=${node.id}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user) return;

    fetch('/api/dashboard')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load dashboard');
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const todayFocus = useMemo(() => {
    if (!stats) return null;
    return stats.review_nodes[0] || stats.continue_nodes[0] || stats.recommended_nodes[0] || null;
  }, [stats]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-sky-700">
              <LayoutDashboard className="h-4 w-4" />
              Learner Home
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Continue Learning</h1>
            <p className="max-w-3xl text-slate-600">
              Use this page as your starting point, then jump into the map only when you want the wider context.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-gray-500">Loading learner home...</p>
              </div>
            </div>
          ) : stats ? (
            <>
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <Card className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_34%),white]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-sky-600" />
                      Today&apos;s Best Next Step
                    </CardTitle>
                    <CardDescription>
                      Start with one clear lesson instead of scanning the whole graph.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {todayFocus ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {todayFocus.subject && (
                              <Badge variant="outline" style={{ borderColor: todayFocus.subject.color, color: todayFocus.subject.color }}>
                                {todayFocus.subject.name}
                              </Badge>
                            )}
                            {todayFocus.topic && <Badge variant="secondary">{todayFocus.topic}</Badge>}
                          </div>
                          <h2 className="text-2xl font-semibold text-slate-950">{todayFocus.title}</h2>
                          <p className="max-w-2xl text-sm leading-7 text-slate-600">{todayFocus.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button asChild>
                            <Link href={lessonHref(todayFocus, 'list')}>
                              Open Lesson
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href={lessonHref(todayFocus, 'graph')}>
                              Open In Map
                              <Network className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                          You do not have a highlighted lesson yet. Open the list view and pick a starting topic.
                        </p>
                        <Button asChild>
                          <Link href="/graph?view=list">
                            Browse Lessons
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Overall Progress
                    </CardTitle>
                    <CardDescription>
                      {stats.mastered_count} of {stats.total_nodes} concepts mastered
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <div className="mb-2 flex items-end justify-between">
                        <span className="text-sm text-slate-500">Completion</span>
                        <span className="text-3xl font-bold text-blue-600">{stats.completion_percentage}%</span>
                      </div>
                      <Progress value={stats.completion_percentage} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Mastered</p>
                        <p className="mt-2 text-2xl font-semibold text-emerald-600">{stats.mastered_count}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">In Progress</p>
                        <p className="mt-2 text-2xl font-semibold text-amber-600">{stats.in_progress_count}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Untouched</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-600">{stats.untouched_count}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Subjects</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.subjects.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-3">
                {[
                  { title: 'Continue Learning', icon: Clock, nodes: stats.continue_nodes, empty: 'No lessons are currently in progress.' },
                  { title: 'Ready Next', icon: Sparkles, nodes: stats.recommended_nodes, empty: 'No ready-next concepts yet.' },
                  { title: 'Review Due', icon: RotateCcw, nodes: stats.review_nodes, empty: 'No reviews are due right now.' },
                ].map((section) => {
                  const Icon = section.icon;
                  return (
                    <Card key={section.title}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-slate-700" />
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {section.nodes.length === 0 ? (
                          <p className="text-sm text-slate-500">{section.empty}</p>
                        ) : (
                          section.nodes.map((node) => (
                            <Link
                              key={node.id}
                              href={lessonHref(node)}
                              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:bg-white"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900">{node.title}</p>
                                <p className="truncate text-xs text-slate-500">{node.topic || 'General'}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-400" />
                            </Link>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-violet-600" />
                      Subject Progress
                    </CardTitle>
                    <CardDescription>Your mastery across each subject area.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats.subjects.length === 0 ? (
                      <p className="text-sm text-slate-500">No subjects are available yet.</p>
                    ) : (
                      stats.subjects.map((subjectProgress) => (
                        <div key={subjectProgress.subject.id} className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subjectProgress.subject.color }} />
                              <span className="text-sm font-medium text-slate-800">{subjectProgress.subject.name}</span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {subjectProgress.mastered}/{subjectProgress.total} mastered
                            </span>
                          </div>
                          <Progress value={subjectProgress.percentage} className="h-2" />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-slate-700" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your latest learning actions and mastery attempts.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.recent_activity.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                        <p className="text-sm text-slate-500 mb-3">No activity yet.</p>
                        <Button variant="outline" asChild>
                          <Link href="/graph?view=list">
                            Start Browsing
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      stats.recent_activity.map((activity, index) => (
                        <div
                          key={`${activity.node?.id || index}-${activity.timestamp}`}
                          className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                              activity.action === 'mastered'
                                ? 'bg-emerald-100'
                                : activity.action === 'attempted'
                                  ? 'bg-amber-100'
                                  : 'bg-sky-100'
                            }`}>
                              {activity.action === 'mastered' ? (
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                              ) : activity.action === 'attempted' ? (
                                <Clock className="h-4 w-4 text-amber-600" />
                              ) : (
                                <BookOpen className="h-4 w-4 text-sky-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">{activity.node?.title || 'Unknown node'}</p>
                              <p className="text-xs text-slate-500 capitalize">
                                {activity.action === 'mastered' ? 'Mastered' : activity.action === 'attempted' ? 'Test attempted' : 'Started learning'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">{new Date(activity.timestamp).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">Failed to load learner home.</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
