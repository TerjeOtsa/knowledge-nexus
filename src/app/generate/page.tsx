"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  BookMarked,
  FileText,
  Globe,
  Loader2,
  MessageSquarePlus,
  Network,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';
import { Navbar } from '@/components/layout/navbar';
import { GeneratedPackPreview } from '@/components/generate/generated-pack-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { summarizeContentPack } from '@/lib/content-pack';
import type { ContentPack, ContentPackNode } from '@/lib/content-pack';
import type { Nexus, Subject } from '@/types';

interface GenerationSource {
  sourceType: 'url' | 'text';
  title: string;
  url?: string;
  charCount: number;
  truncated: boolean;
}

interface GenerationResponse {
  pack: ContentPack;
  source: GenerationSource;
}

const EMPTY_PACK: ContentPack = {
  format: 'knowledge-nexus/content-pack',
  version: 1,
  metadata: { id: 'empty', title: 'Empty Preview' },
  subjects: [],
  nodes: [],
  edges: [],
  prerequisites: [],
  tests: [],
};

function GeneratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuthStore();

  // Source input
  const [sourceMode, setSourceMode] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [documentText, setDocumentText] = useState('');

  // Target nexus (null = main graph)
  const [targetNexusId, setTargetNexusId] = useState<string | null>(() => searchParams.get('nexus_id'));
  const [nexuses, setNexuses] = useState<Nexus[]>([]);
  const [loadingNexuses, setLoadingNexuses] = useState(true);

  // Graph snapshot
  const [existingSubjects, setExistingSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<GenerationResponse | null>(null);
  const [version, setVersion] = useState(1);

  // Refinement state
  const [refinementFeedback, setRefinementFeedback] = useState('');
  const [refining, setRefining] = useState(false);

  // Node selection + editing
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const [nodeRefinementFeedback, setNodeRefinementFeedback] = useState('');
  const [nodeRefining, setNodeRefining] = useState(false);
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, router, user]);

  // Load user's nexuses
  useEffect(() => {
    if (!user) return;
    fetch('/api/nexuses')
      .then((r) => r.json())
      .then((d) => setNexuses(d.nexuses || []))
      .catch(() => {})
      .finally(() => setLoadingNexuses(false));
  }, [user]);

  // Load subjects for the active target (main graph or a nexus)
  useEffect(() => {
    if (!user) return;
    setLoadingSubjects(true);
    const url = targetNexusId
      ? `/api/nexuses/${targetNexusId}/graph`
      : '/api/subjects';
    fetch(url)
      .then((r) => r.json())
      .then((d) => setExistingSubjects(d.subjects || []))
      .catch(() => {})
      .finally(() => setLoadingSubjects(false));
  }, [user, targetNexusId]);

  // Live summary derived from the current pack (stays accurate after client edits)
  const packSummary = useMemo(
    () => (result ? summarizeContentPack(result.pack) : null),
    [result],
  );

  const rawPackJson = useMemo(
    () => (result ? JSON.stringify(result.pack, null, 2) : ''),
    [result],
  );

  const selectedNode = useMemo(
    () => result?.pack.nodes.find((n) => n.key === selectedNodeKey) ?? null,
    [result, selectedNodeKey],
  );

  const selectedNodeTests = useMemo(
    () => result?.pack.tests.filter((t) => t.node === selectedNodeKey) ?? [],
    [result, selectedNodeKey],
  );

  // ── Client-side pack mutations ──────────────────────────────────────────────

  const handleUpdateNode = useCallback((nodeKey: string, changes: Partial<ContentPackNode>) => {
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pack: {
          ...prev.pack,
          nodes: prev.pack.nodes.map((n) => (n.key === nodeKey ? { ...n, ...changes } : n)),
        },
      };
    });
  }, []);

  const handleDeleteNode = useCallback((nodeKey: string) => {
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pack: {
          ...prev.pack,
          nodes: prev.pack.nodes.filter((n) => n.key !== nodeKey),
          edges: prev.pack.edges.filter((e) => e.source !== nodeKey && e.target !== nodeKey),
          prerequisites: prev.pack.prerequisites.filter(
            (p) => p.node !== nodeKey && p.prerequisite !== nodeKey,
          ),
          tests: prev.pack.tests.filter((t) => t.node !== nodeKey),
        },
      };
    });
    setSelectedNodeKey((prev) => (prev === nodeKey ? null : prev));
  }, []);

  // ── API calls ───────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (sourceMode === 'url' && !url.trim()) {
      toast.error('Paste an article URL first.');
      return;
    }
    if (sourceMode === 'text' && !documentText.trim()) {
      toast.error('Paste some document text first.');
      return;
    }

    setGenerating(true);
    setSelectedNodeKey(null);
    try {
      const res = await fetch('/api/generate/content-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: sourceMode === 'url' ? url : '',
          documentText: sourceMode === 'text' ? documentText : '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate content pack');
      setResult(data);
      setVersion(1);
      setRefinementFeedback('');
      toast.success('Content pack generated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!result || !refinementFeedback.trim()) return;
    setRefining(true);
    setSelectedNodeKey(null);
    try {
      const res = await fetch('/api/generate/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: sourceMode === 'url' ? url : '',
          documentText: sourceMode === 'text' ? documentText : '',
          previousPack: result.pack,
          feedback: refinementFeedback,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refinement failed');
      setResult(data);
      setVersion((v) => v + 1);
      setRefinementFeedback('');
      toast.success(`Pack refined — now at v${version + 1}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Refinement failed');
    } finally {
      setRefining(false);
    }
  };

  const handleRefineNode = async () => {
    if (!result || !selectedNode || !nodeRefinementFeedback.trim()) return;
    setNodeRefining(true);
    const feedback = `For the node "${selectedNode.title}" (key: ${selectedNode.key}): ${nodeRefinementFeedback}`;
    try {
      const res = await fetch('/api/generate/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: sourceMode === 'url' ? url : '',
          documentText: sourceMode === 'text' ? documentText : '',
          previousPack: result.pack,
          feedback,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Node refinement failed');
      setResult(data);
      setVersion((v) => v + 1);
      setNodeRefinementFeedback('');
      toast.success(`"${selectedNode.title}" refined.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Node refinement failed');
    } finally {
      setNodeRefining(false);
    }
  };

  const handleImport = async () => {
    if (!result) return;
    setImporting(true);
    try {
      const res = await fetch('/api/generate/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: result.pack, nexus_id: targetNexusId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import generated content');
      toast.success('Content imported successfully.');
      router.push(targetNexusId ? `/nexus/${targetNexusId}` : '/graph?view=graph');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleNodeClick = useCallback((nodeKey: string) => {
    setSelectedNodeKey((prev) => (prev === nodeKey ? null : nodeKey));
    setNodeRefinementFeedback('');
  }, []);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const busy = generating || refining || nodeRefining || importing;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">

          {/* ── Header ── */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <Sparkles className="h-4 w-4" />
              AI Content Generation
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Generate From Source Material
              </h1>
              {result && (
                <Badge variant="secondary" className="text-sm">
                  v{version}
                </Badge>
              )}
            </div>
            <p className="max-w-3xl text-slate-600">
              Paste a URL or document. The AI maps it into subjects, topics, and concept nodes — each with mastery questions. Refine before you import.
            </p>
          </div>

          {/* ── Target nexus selector ── */}
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 shrink-0">
                <Network className="h-4 w-4 text-slate-400" />
                Generating into:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTargetNexusId(null)}
                  disabled={busy}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    targetNexusId === null
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  Main Graph
                </button>
                {loadingNexuses ? (
                  <span className="flex items-center gap-1 text-xs text-slate-400 px-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading nexuses…
                  </span>
                ) : (
                  nexuses.map((nexus) => (
                    <button
                      key={nexus.id}
                      onClick={() => setTargetNexusId(nexus.id)}
                      disabled={busy}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        targetNexusId === nexus.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {nexus.title}
                    </button>
                  ))
                )}
                <button
                  onClick={() => router.push('/nexuses')}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-lg text-sm text-blue-600 border border-dashed border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  + New Nexus
                </button>
              </div>
            </div>
          </div>

          {/* ── Row 1: Source input + snapshot ── */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card>
              <CardHeader>
                <CardTitle>Source Input</CardTitle>
                <CardDescription>
                  The AI reads this material, maps it into topics and concepts, and generates mastery questions for each node.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Tabs value={sourceMode} onValueChange={(v) => setSourceMode(v as 'url' | 'text')}>
                  <TabsList>
                    <TabsTrigger value="url">
                      <Globe className="h-4 w-4 mr-2" />
                      Article URL
                    </TabsTrigger>
                    <TabsTrigger value="text">
                      <FileText className="h-4 w-4 mr-2" />
                      Paste Document
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="space-y-3">
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/article-you-want-to-learn-from"
                      disabled={busy}
                    />
                    <p className="text-xs text-slate-500">
                      Best for articles, documentation pages, or publicly accessible study resources.
                    </p>
                  </TabsContent>

                  <TabsContent value="text" className="space-y-3">
                    <Textarea
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Paste a syllabus, chapter excerpt, lecture notes, or any structured learning material here..."
                      className="min-h-64"
                      disabled={busy}
                    />
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Best for syllabi, copied PDF text, lecture notes, or study guides.</span>
                      <span>{documentText.length.toLocaleString()} chars</span>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleGenerate} disabled={busy}>
                    {generating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Generating</>
                    ) : (
                      <><Sparkles className="h-4 w-4" />{result ? 'Regenerate' : 'Generate Preview'}</>
                    )}
                  </Button>
                  {result && (
                    <Button
                      variant="outline"
                      onClick={() => { setResult(null); setSelectedNodeKey(null); setVersion(1); }}
                      disabled={busy}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Graph Snapshot</CardTitle>
                <CardDescription>
                  The AI uses this to avoid duplicating subjects that already exist in your graph.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingSubjects ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading subjects...
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {existingSubjects.map((subject) => (
                        <Badge
                          key={subject.id}
                          variant="outline"
                          style={{ borderColor: subject.color, color: subject.color }}
                        >
                          {subject.name}
                        </Badge>
                      ))}
                      {existingSubjects.length === 0 && (
                        <p className="text-sm text-slate-400">No subjects yet — everything will be created fresh.</p>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Generated nodes become regular graph content after import and can be edited, moved, or deleted.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Row 2: Preview + right panel ── */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
            <GeneratedPackPreview
              pack={result?.pack ?? EMPTY_PACK}
              existingSubjects={existingSubjects}
              selectedNodeKey={selectedNodeKey}
              onNodeClick={result ? handleNodeClick : undefined}
            />

            {/* Right panel */}
            <div className="flex flex-col gap-4">

              {result ? (
                <>
                  {/* Pack stats */}
                  <Card>
                    <CardContent className="pt-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <BookMarked className="h-4 w-4 text-slate-500" />
                        <p className="text-sm font-medium text-slate-900 truncate">{result.source.title}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Subjects', value: packSummary?.subjectCount },
                          { label: 'Nodes', value: packSummary?.nodeCount },
                          { label: 'Edges', value: packSummary?.edgeCount },
                          { label: 'Tests', value: packSummary?.testCount },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-xl border bg-slate-50 px-3 py-3">
                            <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">
                        {result.source.charCount.toLocaleString()} chars read
                        {result.source.truncated ? ' • truncated' : ''}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Global refinement */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-slate-500" />
                        Refine Pack
                      </CardTitle>
                      <CardDescription>
                        Describe what to change. The AI updates the pack while keeping what already works.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        value={refinementFeedback}
                        onChange={(e) => setRefinementFeedback(e.target.value)}
                        placeholder={'e.g. "Split the Calculus topic into Derivatives, Integrals, and Limits" or "Make all questions harder and add applied scenarios"'}
                        className="min-h-28 text-sm"
                        disabled={busy}
                      />
                      <Button
                        onClick={handleRefine}
                        disabled={busy || !refinementFeedback.trim()}
                        className="w-full"
                      >
                        {refining ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Refining…</>
                        ) : (
                          <><Sparkles className="h-4 w-4" />Apply Feedback</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Import actions */}
                  <Card>
                    <CardContent className="pt-5 space-y-3">
                      <Button onClick={handleImport} disabled={busy} className="w-full">
                        {importing ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Importing</>
                        ) : (
                          <><Upload className="h-4 w-4" />Import Into Graph</>
                        )}
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="/graph?view=graph">
                          <Network className="h-4 w-4" />
                          Open Graph
                        </a>
                      </Button>

                      <details className="rounded-xl border border-slate-200 bg-slate-50">
                        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-700">
                          View Raw JSON
                        </summary>
                        <div className="border-t border-slate-200 p-3">
                          <Textarea value={rawPackJson} readOnly className="min-h-64 font-mono text-xs" />
                        </div>
                      </details>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center space-y-2">
                  <Sparkles className="h-6 w-6 text-slate-300 mx-auto" />
                  <p className="text-sm font-medium text-slate-500">Generate a pack to refine and import it.</p>
                  <p className="text-xs text-slate-400">After generation you can click any node in the preview to edit it, or give the AI feedback to reshape the whole pack.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Node edit panel (appears when a node is selected) ── */}
          {result && selectedNode && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base truncate">{selectedNode.title}</CardTitle>
                      <Badge variant="outline" className="text-xs shrink-0">
                        Difficulty {selectedNode.difficulty}/10
                      </Badge>
                      {selectedNode.topic && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {selectedNode.topic}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      {selectedNodeTests.length} test{selectedNodeTests.length === 1 ? '' : 's'} •{' '}
                      {selectedNodeTests.reduce((sum, t) => sum + t.questions.length, 0)} questions
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={() => setSelectedNodeKey(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                  {/* Editable fields */}
                  <div className="space-y-4 xl:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500">Title</Label>
                        <Input
                          key={`title-${selectedNodeKey}`}
                          defaultValue={selectedNode.title}
                          disabled={nodeRefining}
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v && v !== selectedNode.title) handleUpdateNode(selectedNodeKey!, { title: v });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500">Topic</Label>
                        <Input
                          key={`topic-${selectedNodeKey}`}
                          defaultValue={selectedNode.topic ?? ''}
                          disabled={nodeRefining}
                          onBlur={(e) => {
                            const v = e.target.value.trim() || null;
                            if (v !== selectedNode.topic) handleUpdateNode(selectedNodeKey!, { topic: v });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500">Difficulty (1–10)</Label>
                        <Input
                          key={`difficulty-${selectedNodeKey}`}
                          type="number"
                          min={1}
                          max={10}
                          defaultValue={selectedNode.difficulty}
                          disabled={nodeRefining}
                          onBlur={(e) => {
                            const v = Math.min(10, Math.max(1, parseInt(e.target.value, 10)));
                            if (!Number.isNaN(v) && v !== selectedNode.difficulty) {
                              handleUpdateNode(selectedNodeKey!, { difficulty: v });
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-500">Description</Label>
                      <Textarea
                        key={`desc-${selectedNodeKey}`}
                        defaultValue={selectedNode.description}
                        disabled={nodeRefining}
                        className="min-h-20 text-sm"
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && v !== selectedNode.description) handleUpdateNode(selectedNodeKey!, { description: v });
                        }}
                      />
                    </div>

                    {/* Questions preview */}
                    {selectedNodeTests.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-500">Questions in this test</Label>
                        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                          {selectedNodeTests[0].questions.slice(0, 5).map((q, i) => (
                            <div key={i} className="px-3 py-2 text-xs text-slate-600">
                              <span className="font-medium text-slate-400 mr-1.5">{i + 1}.</span>
                              {q.prompt}
                            </div>
                          ))}
                          {selectedNodeTests[0].questions.length > 5 && (
                            <div className="px-3 py-2 text-xs text-slate-400">
                              +{selectedNodeTests[0].questions.length - 5} more questions
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI node refinement + delete */}
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquarePlus className="h-4 w-4 text-blue-500" />
                        <p className="text-sm font-medium text-slate-800">Ask AI to improve this node</p>
                      </div>
                      <Textarea
                        value={nodeRefinementFeedback}
                        onChange={(e) => setNodeRefinementFeedback(e.target.value)}
                        placeholder={`e.g. "Rewrite questions to be harder" or "Add applied_scenario questions" or "Fix the description — it's too vague"`}
                        className="min-h-24 text-sm"
                        disabled={nodeRefining}
                      />
                      <Button
                        onClick={handleRefineNode}
                        disabled={busy || !nodeRefinementFeedback.trim()}
                        size="sm"
                        className="w-full"
                      >
                        {nodeRefining ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Refining node…</>
                        ) : (
                          <><Sparkles className="h-4 w-4" />Refine This Node</>
                        )}
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      disabled={busy}
                      onClick={() => {
                        handleDeleteNode(selectedNodeKey!);
                        toast.success(`Removed "${selectedNode.title}" from the pack.`);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Node from Pack
                    </Button>
                    <p className="text-xs text-slate-400 text-center">
                      Removal is local — it won&apos;t affect your graph until you import.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Suggested flow ── */}
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Suggested Flow</h2>
                <p className="text-sm text-slate-600">Generate, refine until it looks right, then import.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">1. Paste source</Badge>
                <Badge variant="secondary">2. Generate</Badge>
                <Badge variant="secondary">3. Click nodes to edit</Badge>
                <Badge variant="secondary">4. Refine with AI feedback</Badge>
                <Badge variant="secondary">5. Import</Badge>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <a href="/graph?view=list">
                  Go To Lesson List
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <GeneratePageContent />
    </Suspense>
  );
}
