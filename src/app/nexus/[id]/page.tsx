"use client";

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore, useGraphStore } from '@/store';
import { Navbar } from '@/components/layout/navbar';
import { KnowledgeGraph } from '@/components/graph/knowledge-graph';
import { ConceptListView } from '@/components/graph/concept-list-view';
import { NodeWorkspace } from '@/components/graph/node-workspace';
import { AddNodeModal } from '@/components/modals/add-node-modal';
import { LinkNodeModal } from '@/components/modals/link-node-modal';
import { MasteryTestModal } from '@/components/modals/mastery-test-modal';
import { EditNodeModal } from '@/components/modals/edit-node-modal';
import { ShareNodeModal } from '@/components/graph/share-node-modal';
import {
  ArrowLeft,
  LayoutList,
  Loader2,
  Network,
  Settings,
  Share2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Nexus } from '@/types';

interface NexusGraphData {
  nexus: Nexus;
  isOwner: boolean;
  nodes: unknown[];
  subjects: unknown[];
  edges: unknown[];
  prerequisites: unknown[];
  progress: Record<string, unknown>;
}

function NexusGraphContent() {
  const params = useParams();
  const router = useRouter();
  const nexusId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { user, isLoading: authLoading } = useAuthStore();
  const {
    selectedNodeId,
    setSelectedNodeId,
    setNodes,
    setEdges,
    setPrerequisites,
    setSubjects,
    setUserProgress,
    nodes,
  } = useGraphStore();

  const [nexusData, setNexusData] = useState<{ nexus: Nexus; isOwner: boolean } | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  // Modals
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [linkNodeOpen, setLinkNodeOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editNodeOpen, setEditNodeOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<string | undefined>(undefined);
  const [testNodeId, setTestNodeId] = useState<string | null>(null);
  const [editNodeId, setEditNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, router, user]);

  const fetchData = useCallback(async () => {
    if (!nexusId) return;
    setDataLoading(true);
    // Clear stale data from any previously viewed nexus immediately
    setSelectedNodeId(null);
    setNodes([]);
    setEdges([]);
    setPrerequisites([]);
    setSubjects([]);
    setUserProgress({});
    try {
      const res = await fetch(`/api/nexuses/${nexusId}/graph`);
      if (!res.ok) {
        const err = await res.json();
        if (res.status === 403 || res.status === 404) {
          router.push('/nexuses');
          return;
        }
        throw new Error(err.error);
      }

      const data = await res.json() as NexusGraphData;
      setNexusData({ nexus: data.nexus, isOwner: data.isOwner });
      setNodes((data.nodes as Parameters<typeof setNodes>[0]) || []);
      setEdges((data.edges as Parameters<typeof setEdges>[0]) || []);
      setPrerequisites((data.prerequisites as Parameters<typeof setPrerequisites>[0]) || []);
      setSubjects((data.subjects as Parameters<typeof setSubjects>[0]) || []);
      setUserProgress((data.progress as Parameters<typeof setUserProgress>[0]) || {});
    } catch (error) {
      console.error('Failed to fetch nexus data:', error);
      toast.error('Failed to load nexus. Try refreshing.');
    } finally {
      setDataLoading(false);
    }
  }, [nexusId, router, setEdges, setNodes, setPrerequisites, setSubjects, setUserProgress]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  // Modal handlers
  const handleAddNode = useCallback((fromNodeId?: string) => {
    setSourceNodeId(fromNodeId);
    setAddNodeOpen(true);
  }, []);

  const handleLinkNode = useCallback((fromNodeId?: string) => {
    setSourceNodeId(fromNodeId);
    setLinkNodeOpen(true);
  }, []);

  const handleTakeTest = useCallback((nodeId: string) => {
    setTestNodeId(nodeId);
    setTestModalOpen(true);
  }, []);

  const handleEditNode = useCallback((nodeId: string) => {
    setEditNodeId(nodeId);
    setEditNodeOpen(true);
  }, []);

  if (authLoading || (!user && !authLoading) || dataLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        {!dataLoading && <Navbar />}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-500 text-sm">Loading nexus…</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) || null : null;
  const { nexus, isOwner } = nexusData!;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex min-h-0 flex-1 flex-col pt-14">
        {/* Nexus header bar */}
        <div className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push('/nexuses')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-950 truncate">{nexus.title}</h1>
                  <Badge variant={isOwner ? 'default' : 'secondary'} className="text-xs shrink-0">
                    {isOwner ? 'Owner' : 'Subscriber'}
                  </Badge>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {nodes.length} nodes
                  </Badge>
                </div>
                {nexus.description && (
                  <p className="text-sm text-slate-500 truncate">{nexus.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {/* View toggle */}
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                <LayoutList className="w-4 h-4" />
                List
              </Button>
              <Button variant={viewMode === 'graph' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('graph')}>
                <Network className="w-4 h-4" />
                Map
              </Button>

              {/* Owner actions */}
              {isOwner && (
                <>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/generate?nexus_id=${nexus.id}`)}>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!selectedNodeId) {
                        toast('Select a node in the graph first, then click Share.', { icon: '👆' });
                        return;
                      }
                      setShareOpen(true);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/nexus/${nexus.id}/settings`)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Graph / list view */}
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0">
            {viewMode === 'graph' ? (
              <KnowledgeGraph
                onNodeClick={(nodeId) => setSelectedNodeId(nodeId)}
                onAddNode={handleAddNode}
                onLinkNodes={handleLinkNode}
              />
            ) : (
              <ConceptListView onNodeClick={(nodeId) => setSelectedNodeId(nodeId)} />
            )}
          </div>

          {selectedNode && (
            <NodeWorkspace
              nodeId={selectedNode.id}
              onClose={() => setSelectedNodeId(null)}
              onStartTest={handleTakeTest}
              onAddConnectedNode={handleAddNode}
              onLinkExistingNode={handleLinkNode}
              onEditNode={handleEditNode}
              onNavigateToNode={setSelectedNodeId}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddNodeModal open={addNodeOpen} onClose={() => { setAddNodeOpen(false); fetchData(); }} sourceNodeId={sourceNodeId} />
      <LinkNodeModal open={linkNodeOpen} onClose={() => { setLinkNodeOpen(false); fetchData(); }} sourceNodeId={sourceNodeId} />
      {testNodeId && (
        <MasteryTestModal open={testModalOpen} onClose={() => { setTestModalOpen(false); fetchData(); }} nodeId={testNodeId} />
      )}
      {editNodeId && (
        <EditNodeModal open={editNodeOpen} onClose={() => { setEditNodeOpen(false); fetchData(); }} nodeId={editNodeId} />
      )}

      {/* Nexus-level share — shares the first node as an entry point for now */}
      {selectedNode && shareOpen && (
        <ShareNodeModal
          nodeId={selectedNode.id}
          nodeTitle={selectedNode.title}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}

export default function NexusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <NexusGraphContent />
    </Suspense>
  );
}
