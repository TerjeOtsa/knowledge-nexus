"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { DashboardStats } from '@/types';
import {
  Loader2, BookOpen, CheckCircle, Clock, Circle,
  TrendingUp, Award, ArrowRight, Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetch('/api/dashboard')
        .then((res) => res.json())
        .then((data) => {
          if (data.stats) setStats(data.stats);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your learning progress across all subjects</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-500">Loading dashboard...</p>
            </div>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Stats overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Concepts</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_nodes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mastered</p>
                      <p className="text-2xl font-bold text-green-600">{stats.mastered_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">In Progress</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.in_progress_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Circle className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Not Started</p>
                      <p className="text-2xl font-bold text-gray-500">{stats.untouched_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall progress */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Overall Progress
                    </CardTitle>
                    <CardDescription>
                      {stats.mastered_count} of {stats.total_nodes} concepts mastered
                    </CardDescription>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.completion_percentage}%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={stats.completion_percentage} className="h-3" />
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Subject Progress
                  </CardTitle>
                  <CardDescription>Your mastery across different subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.subjects.length === 0 ? (
                    <p className="text-gray-400 text-sm py-4 text-center">
                      No subjects yet. Start exploring the graph!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {stats.subjects.map((sp) => (
                        <div key={sp.subject.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: sp.subject.color }}
                              />
                              <span className="font-medium text-sm text-gray-700">
                                {sp.subject.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {sp.mastered}/{sp.total} mastered
                            </span>
                          </div>
                          <Progress value={sp.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommended next */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Recommended Next
                  </CardTitle>
                  <CardDescription>Concepts ready for you to explore</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.recommended_nodes.length === 0 ? (
                    <p className="text-gray-400 text-sm py-4 text-center">
                      No recommendations yet. Start by exploring nodes in the graph!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {stats.recommended_nodes.map((node) => (
                        <Link
                          key={node.id}
                          href="/graph"
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: node.subject?.color || '#6b7280',
                              }}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-700">{node.title}</p>
                              {node.topic && (
                                <p className="text-xs text-gray-400">{node.topic}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Lvl {node.difficulty}
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest learning actions</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recent_activity.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-3">No activity yet</p>
                    <Button variant="outline" asChild>
                      <Link href="/graph">
                        Start Learning <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recent_activity.map((activity, idx) => (
                      <div
                        key={`${activity.node?.id || idx}-${activity.timestamp}`}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              activity.action === 'mastered'
                                ? 'bg-green-100'
                                : activity.action === 'attempted'
                                ? 'bg-orange-100'
                                : 'bg-blue-100'
                            }`}
                          >
                            {activity.action === 'mastered' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : activity.action === 'attempted' ? (
                              <Clock className="w-4 h-4 text-orange-600" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {activity.node?.title || 'Unknown node'}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">
                              {activity.action === 'mastered'
                                ? 'Mastered!'
                                : activity.action === 'attempted'
                                ? 'Test attempted'
                                : 'Started learning'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">Failed to load dashboard data.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
