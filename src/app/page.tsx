"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import {
  BookOpen, Network, Target, BarChart3, ArrowRight, Sparkles,
  CheckCircle, Layers, Lightbulb
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, router, user]);

  if (!isLoading && user) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Knowledge Nexus
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && (
              user ? (
                <Link href="/dashboard">
                  <Button className="gap-1.5">
                    Continue Learning <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="gap-1.5">
                      Get Started <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Visual Learning Platform
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Master Knowledge Through
            <span className="text-blue-600 block">Connected Understanding</span>
          </h1>
          <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto leading-relaxed">
            Knowledge Nexus turns academic concepts into an interactive graph. See how ideas connect,
            track your progress, and prove mastery through targeted tests.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href={user ? '/dashboard' : '/register'}>
              <Button size="lg" className="gap-2 text-base px-8">
                <Network className="w-5 h-5" />
                {user ? 'Continue Learning' : 'Start Learning'}
              </Button>
            </Link>
            <Link href={user ? '/graph?view=list' : '/login'}>
              <Button variant="outline" size="lg" className="gap-2 text-base">
                {user ? 'Open Lesson List' : 'Sign In'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature preview illustration */}
        <div className="mt-16 relative">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-12 flex-wrap">
              {[
                { label: 'Functions', color: '#22c55e', status: 'Mastered' },
                { label: 'Derivatives', color: '#22c55e', status: 'Mastered' },
                { label: 'Integration', color: '#ef4444', status: 'In Progress' },
                { label: 'Velocity', color: '#60a5fa', status: 'Untouched' },
                { label: "Newton's Laws", color: '#60a5fa', status: 'Untouched' },
              ].map((node, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-xs font-semibold shadow-md text-center p-1"
                    style={{ backgroundColor: node.color }}
                  >
                    {node.label}
                  </div>
                  <span className="text-xs text-gray-500">{node.status}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-6 text-sm text-gray-400">
              Interactive knowledge graph · Click to explore · Track your progress
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Everything You Need to Learn Deeply
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Network,
                title: 'Interactive Graph',
                description: 'Navigate concepts visually. See prerequisites, related topics, and the bigger picture at a glance.',
              },
              {
                icon: Target,
                title: 'Mastery Testing',
                description: 'Prove your understanding with concept-specific tests. Multiple choice, short answer, and applied scenarios.',
              },
              {
                icon: BarChart3,
                title: 'Progress Tracking',
                description: 'Watch your graph light up green as you master concepts. Track progress by subject with detailed dashboards.',
              },
              {
                icon: Layers,
                title: 'Connected Learning',
                description: 'Understand how each concept connects to others. Prerequisites, applications, and cross-subject links.',
              },
              {
                icon: Lightbulb,
                title: 'Smart Recommendations',
                description: "Get suggested next concepts based on what you've already mastered. Learn in the optimal order.",
              },
              {
                icon: CheckCircle,
                title: 'Content Builder',
                description: 'Easily add new concepts, create connections, and build mastery tests. Grow the graph over time.',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>Knowledge Nexus · A Visual Learning Platform</p>
        </div>
      </footer>
    </div>
  );
}
