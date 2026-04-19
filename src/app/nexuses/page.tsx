"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Loader2,
  Network,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';
import { Navbar } from '@/components/layout/navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Nexus } from '@/types';

export default function NexusesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  const [nexuses, setNexuses] = useState<Nexus[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/nexuses')
      .then((r) => r.json())
      .then((d) => setNexuses(d.nexuses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/nexuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), description: newDescription.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNexuses((prev) => [data.nexus, ...prev]);
      setCreateOpen(false);
      setNewTitle('');
      setNewDescription('');
      toast.success('Nexus created.');
      router.push(`/nexus/${data.nexus.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create nexus.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(nexus: Nexus) {
    if (!confirm(`Delete "${nexus.title}"? This will permanently remove all nodes, subjects, and tests in this nexus.`)) return;
    setDeletingId(nexus.id);
    try {
      const res = await fetch(`/api/nexuses/${nexus.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      setNexuses((prev) => prev.filter((n) => n.id !== nexus.id));
      toast.success('Nexus deleted.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete nexus.');
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">My Nexuses</h1>
              <p className="text-slate-600">
                Create private knowledge networks from your own documents. Generate with AI, iterate, and share with students or study groups.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="shrink-0">
              <Plus className="h-4 w-4" />
              New Nexus
            </Button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your nexuses…
            </div>
          )}

          {/* Empty state */}
          {!loading && nexuses.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-10 py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto">
                <Network className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">No nexuses yet</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Create a nexus, paste in your course material, and let AI build a connected knowledge graph from it.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create Your First Nexus
                </Button>
                <Button variant="outline" onClick={() => router.push('/generate')}>
                  <Sparkles className="h-4 w-4" />
                  Go to Generate
                </Button>
              </div>
            </div>
          )}

          {/* Nexus grid */}
          {!loading && nexuses.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {nexuses.map((nexus) => (
                <Card key={nexus.id} className="group relative flex flex-col hover:border-blue-200 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{nexus.title}</CardTitle>
                        {nexus.description && (
                          <CardDescription className="mt-1 line-clamp-2">{nexus.description}</CardDescription>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50"
                        disabled={deletingId === nexus.id}
                        onClick={(e) => { e.stopPropagation(); handleDelete(nexus); }}
                      >
                        {deletingId === nexus.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-xl font-bold text-slate-900">{nexus.node_count ?? 0}</p>
                        <p className="text-xs text-slate-400">Nodes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-slate-900">{nexus.subject_count ?? 0}</p>
                        <p className="text-xs text-slate-400">Subjects</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant={nexus.visibility === 'link' ? 'default' : 'secondary'} className="text-xs">
                        {nexus.visibility === 'link' ? 'Shareable' : 'Private'}
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/nexus/${nexus.id}`)}
                      >
                        <Network className="h-3.5 w-3.5" />
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/generate?nexus_id=${nexus.id}`)}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Generate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Create new card */}
              <button
                onClick={() => setCreateOpen(true)}
                className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors min-h-48"
              >
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">New Nexus</span>
              </button>
            </div>
          )}

          {/* How it works */}
          {!loading && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-900">How Nexuses Work</h2>
              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                {[
                  { icon: Sparkles, title: 'AI-Generated', body: 'Paste any course material — textbooks, syllabi, lecture notes. The AI maps it into subjects, topics, and concept nodes with mastery questions.' },
                  { icon: Network, title: 'Iterate & Refine', body: 'Click any node to edit it, give the AI feedback to reshape topics, or add your own nodes manually. Manual edits are treated as feedback for the next AI pass.' },
                  { icon: BookOpen, title: 'Share with Students', body: 'Generate a 6-character code from any node or the whole nexus. Students enter the code at /join and get instant access.' },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title} className="space-y-1.5">
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <Icon className="h-4 w-4 text-blue-600" />
                      {title}
                    </div>
                    <p className="text-slate-500">{body}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/generate')}>
                Go to Generate
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Create nexus dialog */}
      <Dialog open={createOpen} onOpenChange={(v) => { if (!v) setCreateOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a New Nexus</DialogTitle>
            <DialogDescription>
              Give it a name. You can populate it with content from the Generate page.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Organic Chemistry 101, GCSE Maths, Machine Learning Fundamentals"
                autoFocus
                disabled={creating}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What is this nexus for?"
                className="min-h-20"
                disabled={creating}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={creating || !newTitle.trim()} className="flex-1">
                {creating ? <><Loader2 className="h-4 w-4 animate-spin" />Creating…</> : 'Create Nexus'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
