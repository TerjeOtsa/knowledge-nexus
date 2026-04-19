"use client";

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, useGraphStore } from '@/store';
import { Navbar } from '@/components/layout/navbar';
import { KnowledgeGraph } from '@/components/graph/knowledge-graph';
import { ConceptListView } from '@/components/graph/concept-list-view';
import { NodeWorkspace } from '@/components/graph/node-workspace';
import { AddNodeModal } from '@/components/modals/add-node-modal';
import { LinkNodeModal } from '@/components/modals/link-node-modal';
import { MasteryTestModal } from '@/components/modals/mastery-test-modal';
import { EditNodeModal } from '@/components/modals/edit-node-modal';
import { LayoutList, Loader2, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

function GraphPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const [dataLoading, setDataLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  // Modal state
  const [addNodeOpen, setAddNodeOpen] = useState(false);
  const [linkNodeOpen, setLinkNodeOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [editNodeOpen, setEditNodeOpen] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<string | undefined>(undefined);
  const [testNodeId, setTestNodeId] = useState<string | null>(null);
  const [editNodeId, setEditNodeId] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch all data on mount
  const fetchData = useCallback(async () => {
    try {
      const [nodesRes, edgesRes, subjectsRes, progressRes, prereqRes] = await Promise.all([
        fetch('/api/nodes'),
        fetch('/api/edges'),
        fetch('/api/subjects'),
        fetch('/api/progress'),
        fetch('/api/prerequisites'),
      ]);

      const [nodesData, edgesData, subjectsData, progressData, prereqData] = await Promise.all([
        nodesRes.json(),
        edgesRes.json(),
        subjectsRes.json(),
        progressRes.ok ? progressRes.json() : { progress: {} },
        prereqRes.ok ? prereqRes.json() : { prerequisites: [] },
      ]);

      if (nodesRes.ok) setNodes(nodesData.nodes || []);
      if (edgesRes.ok) setEdges(edgesData.edges || []);
      if (subjectsRes.ok) setSubjects(subjectsData.subjects || []);
      setPrerequisites(prereqData.prerequisites || []);
      setUserProgress(progressData.progress || {});
    } catch (error) {
      console.error('Failed to fetch graph data:', error);
      toast.error('Failed to load graph data. Try refreshing.');
    } finally {
      setDataLoading(false);
    }
  }, [setNodes, setEdges, setPrerequisites, setSubjects, setUserProgress]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setViewMode('list');
    }
  }, []);

  useEffect(() => {
    const requestedView = searchParams.get('view');
    if (requestedView === 'graph' || requestedView === 'list') {
      setViewMode(requestedView);
    }
  }, [searchParams]);

  useEffect(() => {
    const requestedNodeId = searchParams.get('node');
    if (!requestedNodeId) {
      setSelectedNodeId(null);
      return;
    }

    if (nodes.some((node) => node.id === requestedNodeId)) {
      setSelectedNodeId(requestedNodeId);
    }
  }, [nodes, searchParams, setSelectedNodeId]);

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

  const handleCloseAddNode = useCallback(() => {
    setAddNodeOpen(false);
    fetchData();
  }, [fetchData]);

  const handleCloseLinkNode = useCallback(() => {
    setLinkNodeOpen(false);
    fetchData();
  }, [fetchData]);

  const handleCloseTest = useCallback(() => {
    setTestModalOpen(false);
    fetchData();
  }, [fetchData]);

  const handleCloseEditNode = useCallback(() => {
    setEditNodeOpen(false);
    fetchData();
  }, [fetchData]);

  // Navigate to a different node (from workspace links)
  const handleNavigateToNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, [setSelectedNodeId]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-500">Loading your knowledge graph...</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId) || null
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex min-h-0 flex-1 flex-col pt-14">
        <div className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Learn</h1>
              <p className="text-sm text-slate-600">
                Explore the full map or switch to list view for a simpler topic-first learning flow.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>
                <LayoutList className="w-4 h-4" />
                List View
              </Button>
              <Button variant={viewMode === 'graph' ? 'default' : 'outline'} onClick={() => setViewMode('graph')}>
                <Network className="w-4 h-4" />
                Map View
              </Button>
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0">
            {viewMode === 'graph' ? (
              <KnowledgeGraph
                onNodeClick={(nodeId: string) => setSelectedNodeId(nodeId)}
                onAddNode={handleAddNode}
                onLinkNodes={handleLinkNode}
              />
            ) : (
              <ConceptListView onNodeClick={(nodeId: string) => setSelectedNodeId(nodeId)} />
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
              onNavigateToNode={handleNavigateToNode}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddNodeModal
        open={addNodeOpen}
        onClose={handleCloseAddNode}
        sourceNodeId={sourceNodeId}
      />

      <LinkNodeModal
        open={linkNodeOpen}
        onClose={handleCloseLinkNode}
        sourceNodeId={sourceNodeId}
      />

      {testNodeId && (
        <MasteryTestModal
          open={testModalOpen}
          onClose={handleCloseTest}
          nodeId={testNodeId}
        />
      )}

      {editNodeId && (
        <EditNodeModal
          open={editNodeOpen}
          onClose={handleCloseEditNode}
          nodeId={editNodeId}
        />
      )}
    </div>
  );
}

export default function GraphPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <GraphPageContent />
    </Suspense>
  );
}
