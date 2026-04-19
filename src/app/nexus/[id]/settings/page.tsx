"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';
import { Navbar } from '@/components/layout/navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Nexus } from '@/types';

export default function NexusSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const nexusId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user, isLoading: authLoading } = useAuthStore();

  const [nexus, setNexus] = useState<Nexus | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'link'>('private');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user || !nexusId) return;
    fetch(`/api/nexuses/${nexusId}`)
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json();
          if (r.status === 403 || r.status === 404) {
            router.push('/nexuses');
            return;
          }
          throw new Error(err.error);
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (!d.isOwner) {
          toast.error('Only the owner can access settings.');
          router.push(`/nexus/${nexusId}`);
          return;
        }
        setNexus(d.nexus);
        setTitle(d.nexus.title);
        setDescription(d.nexus.description ?? '');
        setVisibility(d.nexus.visibility ?? 'private');
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to load nexus settings.');
        router.push('/nexuses');
      })
      .finally(() => setLoading(false));
  }, [user, nexusId, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/nexuses/${nexusId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), visibility }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNexus(data.nexus);
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!nexus) return;
    if (
      !confirm(
        `Delete "${nexus.title}"? This permanently removes all nodes, subjects, and tests in this nexus. This cannot be undone.`,
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/nexuses/${nexusId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Nexus deleted.');
      router.push('/nexuses');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete nexus.');
      setDeleting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!nexus) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => router.push(`/nexus/${nexusId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">Nexus Settings</h1>
              <p className="text-sm text-slate-500 truncate">{nexus.title}</p>
            </div>
          </div>

          {/* General settings */}
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Update the name, description, and sharing settings for this nexus.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Organic Chemistry 101"
                    disabled={saving}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Description{' '}
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this nexus for?"
                    className="min-h-20"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sharing</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setVisibility('private')}
                      disabled={saving}
                      className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                        visibility === 'private'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">Private</p>
                      <p className="text-xs text-slate-500 mt-0.5">Only you can see this nexus.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibility('link')}
                      disabled={saving}
                      className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                        visibility === 'link'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        Shareable{' '}
                        <Badge variant="default" className="text-xs ml-1">Link</Badge>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Anyone with a share code can view this nexus.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" disabled={saving || !title.trim()}>
                    {saving ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                    ) : (
                      <><Save className="h-4 w-4" />Save Changes</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete this nexus and all its content. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Deleting…</>
                ) : (
                  <><Trash2 className="h-4 w-4" />Delete This Nexus</>
                )}
              </Button>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
