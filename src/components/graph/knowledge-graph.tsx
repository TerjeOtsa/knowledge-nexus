"use client";

import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge as FlowEdge,
  type NodeMouseHandler,
  ConnectionMode,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ConceptNode } from './concept-node';
import { RootNode } from './root-node';
import { SubjectNode } from './subject-node';
import { SectorBackground } from './sector-background';
import { useGraphStore, useAuthStore } from '@/store';
import { getRelationshipLabel } from '@/lib/utils';
import { computeRadialLayout, getRadialHandles } from '@/lib/radial-layout';
import type { NodeStatus, RelationshipType } from '@/types';
import { Search, Filter, Tags, Plus, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Register custom node types
const nodeTypes = {
  concept: ConceptNode,
  root: RootNode,
  subject: SubjectNode,
};

interface MergedConnection {
  source: string;
  target: string;
  type: RelationshipType;
}

interface KnowledgeGraphProps {
  onNodeClick: (nodeId: string) => void;
  onAddNode: (sourceNodeId?: string) => void;
  onLinkNodes: (sourceNodeId?: string) => void;
}

export function KnowledgeGraph({ onNodeClick, onAddNode, onLinkNodes }: KnowledgeGraphProps) {
  const {
    nodes: knowledgeNodes,
    edges: knowledgeEdges,
    prerequisites,
    subjects,
    userProgress,
    searchQuery,
    subjectFilter,
    showEdgeLabels,
    graphMode,
    setSearchQuery,
    setSubjectFilter,
    toggleEdgeLabels,
    setGraphMode,
    selectedNodeId,
    setSelectedNodeId,
  } = useGraphStore();

  const { user } = useAuthStore();

  // Compute radial layout positions and sector info
  const { positions: layoutPositions, sectors: subjectSectors } = useMemo(
    () => computeRadialLayout(knowledgeNodes, knowledgeEdges, subjects),
    [knowledgeNodes, knowledgeEdges, subjects]
  );

  // Build React Flow nodes: root + subjects + concepts
  const rfNodes = useMemo(() => {
    const result: Node[] = [];

    // --- Root node (330px → offset 165) ---
    const rootPos = layoutPositions.get('__root__');
    if (rootPos) {
      result.push({
        id: '__root__',
        type: 'root',
        position: { x: rootPos.x - 165, y: rootPos.y - 165 },
        data: { label: 'Knowledge Nexus' },
        selectable: false,
        draggable: false,
      });
    }

    // --- Subject nodes (256px → offset 128) ---
    for (const subject of subjects) {
      const pos = layoutPositions.get(`__subject_${subject.id}`);
      if (!pos) continue;

      const nodeCount = knowledgeNodes.filter((n) => n.subject_id === subject.id).length;

      result.push({
        id: `__subject_${subject.id}`,
        type: 'subject',
        position: { x: pos.x - 128, y: pos.y - 128 },
        data: {
          label: subject.name,
          color: subject.color,
          icon: subject.icon,
          nodeCount,
        },
        selectable: false,
        draggable: false,
      });
    }

    // --- Concept nodes (filtered) ---
    const filteredNodes = knowledgeNodes.filter((node) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !node.title.toLowerCase().includes(query) &&
          !node.topic?.toLowerCase().includes(query) &&
          !node.description.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (subjectFilter && node.subject_id !== subjectFilter) {
        return false;
      }
      return true;
    });

    for (const node of filteredNodes) {
      const pos = layoutPositions.get(node.id);
      if (!pos) continue;

      const status: NodeStatus = userProgress[node.id]?.status || 'untouched';
      const subject = subjects.find((s) => s.id === node.subject_id);

      // Find all unique subject colors this node connects to (cross-subject edges)
      const connectedSubjectColors = new Set<string>();
      if (subject?.color) connectedSubjectColors.add(subject.color);

      for (const edge of knowledgeEdges) {
        let otherNodeId: string | null = null;
        if (edge.source_node_id === node.id) otherNodeId = edge.target_node_id;
        else if (edge.target_node_id === node.id) otherNodeId = edge.source_node_id;
        if (!otherNodeId) continue;

        const otherNode = knowledgeNodes.find((n) => n.id === otherNodeId);
        if (otherNode && otherNode.subject_id !== node.subject_id) {
          const otherSubject = subjects.find((s) => s.id === otherNode.subject_id);
          if (otherSubject?.color) connectedSubjectColors.add(otherSubject.color);
        }
      }

      // Concept node sizes: small=120, notable=156, keystone=193
      const diff = node.difficulty || 1;
      const nodeSize = diff <= 2 ? 120 : diff <= 4 ? 156 : 193;
      const offset = nodeSize / 2;

      result.push({
        id: node.id,
        type: 'concept',
        position: { x: pos.x - offset, y: pos.y - offset },
        data: {
          label: node.title,
          subject,
          status,
          difficulty: node.difficulty,
          topic: node.topic,
          nodeData: node,
          connectedSubjectColors: Array.from(connectedSubjectColors),
        },
        selected: node.id === selectedNodeId,
      });
    }

    return result;
  }, [knowledgeNodes, knowledgeEdges, subjects, layoutPositions, userProgress, searchQuery, subjectFilter, selectedNodeId]);

  // Build React Flow edges with straight lines for spider-web look
  const rfEdges = useMemo<FlowEdge[]>(() => {
    const visibleNodeIds = new Set(rfNodes.map((n) => n.id));

    // --- Root → Subject edges (thin radial threads) ---
    const subjectEdges: FlowEdge[] = subjects.flatMap((s) => {
      if (!visibleNodeIds.has(`__subject_${s.id}`)) {
        return [];
      }

        const subjectPos = layoutPositions.get(`__subject_${s.id}`);
        const rootPos = layoutPositions.get('__root__');
        if (!subjectPos || !rootPos) {
          return [];
        }

        const { sourceHandle, targetHandle } = getRadialHandles(rootPos.x, rootPos.y, subjectPos.x, subjectPos.y);

        return [{
          id: `root-to-${s.id}`,
          source: '__root__',
          target: `__subject_${s.id}`,
          sourceHandle,
          targetHandle,
          type: 'straight',
          style: { stroke: s.color, strokeWidth: 2, opacity: 0.4, filter: `drop-shadow(0 0 4px ${s.color}66)` },
          animated: false,
        }];
      });

    // --- Subject → first concept edges ---
    const subjectConceptEdges: FlowEdge[] = [];
    for (const subject of subjects) {
      const subjectPos = layoutPositions.get(`__subject_${subject.id}`);
      if (!subjectPos) continue;

      const subjectNodes = knowledgeNodes
        .filter((n) => n.subject_id === subject.id && visibleNodeIds.has(n.id))
        .sort((a, b) => a.difficulty - b.difficulty);

      const minDiff = subjectNodes.length > 0 ? subjectNodes[0].difficulty : null;
      if (minDiff === null) continue;

      const lowestNodes = subjectNodes.filter((n) => n.difficulty === minDiff);

      for (const node of lowestNodes) {
        const nodePos = layoutPositions.get(node.id);
        if (!nodePos) continue;

        const { sourceHandle, targetHandle } = getRadialHandles(subjectPos.x, subjectPos.y, nodePos.x, nodePos.y);

        // Distance-based fade for subject→concept edges too
        const sDist = Math.hypot(nodePos.x - subjectPos.x, nodePos.y - subjectPos.y);
        const sT = Math.min(1, Math.max(0, (sDist - 150) / 500));
        const sFade = 1 - sT * 0.7;

        subjectConceptEdges.push({
          id: `subject-${subject.id}-to-${node.id}`,
          source: `__subject_${subject.id}`,
          target: node.id,
          sourceHandle,
          targetHandle,
          type: 'straight',
          style: { stroke: subject.color, strokeWidth: 1.5 * (0.7 + 0.3 * sFade), opacity: 0.35 * sFade, filter: sFade > 0.5 ? `drop-shadow(0 0 3px ${subject.color}44)` : '' },
          animated: false,
        });
      }
    }

    // --- Build a unified set of concept↔concept connections ---
    // Merge edges from the edges table AND the prerequisites table,
    // deduplicating so each pair appears at most once.
    const connectionMap = new Map<string, MergedConnection>();

    // Add all DB edges
    for (const edge of knowledgeEdges) {
      const key = [edge.source_node_id, edge.target_node_id].sort().join('::');
      if (!connectionMap.has(key)) {
        connectionMap.set(key, {
          source: edge.source_node_id,
          target: edge.target_node_id,
          type: edge.relationship_type,
        });
      }
    }

    // Add prerequisite connections (prerequisite_node → node = "leads to")
    for (const prereq of prerequisites) {
      const key = [prereq.prerequisite_node_id, prereq.node_id].sort().join('::');
      if (!connectionMap.has(key)) {
        connectionMap.set(key, {
          source: prereq.prerequisite_node_id,
          target: prereq.node_id,
          type: 'requires',
        });
      }
    }

    // --- Convert merged connections to React Flow edges ---
    const conceptEdges: FlowEdge[] = Array.from(connectionMap.entries())
      .filter(([, conn]) => visibleNodeIds.has(conn.source) && visibleNodeIds.has(conn.target))
      .map(([key, conn]) => {
        const sourcePos = layoutPositions.get(conn.source);
        const targetPos = layoutPositions.get(conn.target);

        let sourceHandle = 'bottom-src';
        let targetHandle = 'top-tgt';
        if (sourcePos && targetPos) {
          const handles = getRadialHandles(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y);
          sourceHandle = handles.sourceHandle;
          targetHandle = handles.targetHandle;
        }

        // Color by subject — blend for cross-subject
        const sourceNode = knowledgeNodes.find((n) => n.id === conn.source);
        const targetNode = knowledgeNodes.find((n) => n.id === conn.target);
        const sourceSubject = subjects.find((s) => s.id === sourceNode?.subject_id);
        const targetSubject = subjects.find((s) => s.id === targetNode?.subject_id);

        // --- Distance-based opacity: short edges bright, long edges fade ---
        let dist = 300; // fallback
        if (sourcePos && targetPos) {
          dist = Math.hypot(targetPos.x - sourcePos.x, targetPos.y - sourcePos.y);
        }
        // Short (<200px) = full opacity, long (>800px) = very faint
        // Clamp t ∈ [0,1] where 0=close, 1=far
        const t = Math.min(1, Math.max(0, (dist - 150) / 650));
        const distanceFade = 1 - t * 0.85; // range: 1.0 → 0.15

        let edgeColor = '#475569'; // default slate
        let baseWidth = 1;
        let baseOpacity = 0.4;
        let edgeFilter = '';

        if (sourceSubject && targetSubject) {
          if (sourceSubject.id === targetSubject.id) {
            edgeColor = sourceSubject.color;
            baseWidth = 1;
            baseOpacity = 0.35;
            edgeFilter = `drop-shadow(0 0 2px ${edgeColor}33)`;
          } else {
            // Cross-subject — blend colors
            const c1 = sourceSubject.color.replace('#', '');
            const c2 = targetSubject.color.replace('#', '');
            const r = Math.round((parseInt(c1.substring(0, 2), 16) + parseInt(c2.substring(0, 2), 16)) / 2);
            const g = Math.round((parseInt(c1.substring(2, 4), 16) + parseInt(c2.substring(2, 4), 16)) / 2);
            const b = Math.round((parseInt(c1.substring(4, 6), 16) + parseInt(c2.substring(4, 6), 16)) / 2);
            edgeColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            baseWidth = 1.5;
            baseOpacity = 0.45; // cross-subject slightly brighter
            edgeFilter = `drop-shadow(0 0 3px ${edgeColor}55)`;
          }
        }

        // Apply distance scaling
        const edgeOpacity = baseOpacity * distanceFade;
        const edgeWidth = baseWidth * (0.6 + 0.4 * distanceFade); // thin out long edges slightly
        // Disable glow filter on very faint edges to reduce noise
        const finalFilter = distanceFade > 0.5 ? edgeFilter : '';

        return {
          id: `web-${key}`,
          source: conn.source,
          target: conn.target,
          sourceHandle,
          targetHandle,
          label: showEdgeLabels ? getRelationshipLabel(conn.type) : undefined,
          type: 'straight',
          animated: false,
          style: { stroke: edgeColor, strokeWidth: edgeWidth, opacity: edgeOpacity, filter: finalFilter },
          labelStyle: { fontSize: 9, fill: '#94a3b8', fontWeight: 400 },
          labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9 },
          labelBgPadding: [3, 1] as [number, number],
          labelBgBorderRadius: 3,
        };
      });

    return [...subjectEdges, ...subjectConceptEdges, ...conceptEdges];
  }, [knowledgeEdges, prerequisites, rfNodes, subjects, knowledgeNodes, layoutPositions, showEdgeLabels]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  // Handle node click (only for concept nodes)
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      // Ignore clicks on root and subject nodes
      if (node.id === '__root__' || node.id.startsWith('__subject_')) return;

      setSelectedNodeId(node.id);
      onNodeClick(node.id);

      // Mark as in_progress if untouched
      if (user && (!userProgress[node.id] || userProgress[node.id].status === 'untouched')) {
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ node_id: node.id, status: 'in_progress' }),
        }).catch(console.error);
      }
    },
    [setSelectedNodeId, onNodeClick, user, userProgress]
  );

  // Double-click on empty canvas → quick add node (in edit mode)
  const handlePaneDoubleClick = useCallback(
    () => {
      if (graphMode === 'edit') {
        onAddNode(selectedNodeId || undefined);
      }
    },
    [graphMode, selectedNodeId, onAddNode]
  );

  return (
    <div className="w-full h-full relative">
      {/* Graph Toolbar */}
      <Panel position="top-left" className="flex flex-col gap-2 z-10">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg shadow-lg p-2">
          <Search className="w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 h-8 text-sm border-0 focus:ring-0 bg-transparent text-slate-200 placeholder:text-slate-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg shadow-lg p-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <Select
            value={subjectFilter || 'all'}
            onValueChange={(value) => setSubjectFilter(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-48 h-8 text-sm border-0 bg-transparent text-slate-200">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    {subject.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Panel>

      {/* Mode toggle & actions */}
      <Panel position="top-right" className="flex flex-col gap-2 z-10">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg shadow-lg p-2">
          <Button
            variant={graphMode === 'learn' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGraphMode('learn')}
          >
            Learn
          </Button>
          <Button
            variant={graphMode === 'edit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGraphMode('edit')}
          >
            Build
          </Button>
        </div>

        {graphMode === 'edit' && (
          <div className="flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg shadow-lg p-2">
            <Button size="sm" variant="outline" onClick={() => onAddNode(selectedNodeId || undefined)}>
              <Plus className="w-4 h-4 mr-1" /> Add Node
            </Button>
            <Button size="sm" variant="outline" onClick={() => onLinkNodes(selectedNodeId || undefined)}>
              <Link2 className="w-4 h-4 mr-1" /> Link Nodes
            </Button>
            <Button size="sm" variant="outline" onClick={toggleEdgeLabels}>
              <Tags className="w-4 h-4 mr-1" /> {showEdgeLabels ? 'Hide' : 'Show'} Labels
            </Button>
            <p className="text-[10px] text-slate-500 text-center px-1">
              Double-click canvas to add
            </p>
          </div>
        )}

        {/* Legend — PoE dark style */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg shadow-lg p-3 text-xs">
          <p className="font-medium text-slate-400 mb-2 tracking-wide uppercase text-[10px]">Node Status</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-slate-600" style={{ backgroundColor: '#0a0e1a', boxShadow: '0 0 4px rgba(100,116,139,0.3)' }} />
              <span className="text-slate-500">Untouched</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-amber-500/50" style={{ backgroundColor: '#0a0e1a', boxShadow: '0 0 6px rgba(245,158,11,0.4)' }} />
              <span className="text-slate-400">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-emerald-400/50" style={{ backgroundColor: '#0a0e1a', boxShadow: '0 0 8px rgba(52,211,153,0.5)' }} />
              <span className="text-slate-300">Mastered</span>
            </div>
            <hr className="my-1 border-slate-700/50" />
            <p className="font-medium text-slate-400 mb-1 tracking-wide uppercase text-[10px]">Node Size</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="text-slate-500">Small — Basics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-slate-600" />
              <span className="text-slate-500">Notable — Intermediate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-slate-600" />
              <span className="text-slate-500">Keystone — Advanced</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* React Flow Graph */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={() => {}}
        onDoubleClick={handlePaneDoubleClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        minZoom={0.02}
        maxZoom={4}
        zoomOnScroll
        zoomOnPinch
        panOnScroll={false}
        panOnDrag
        selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
        className="bg-slate-950"
      >
        <SectorBackground sectors={subjectSectors} />
        <Controls className="bg-slate-900 border border-slate-700/50 rounded-lg shadow-lg [&>button]:bg-slate-800 [&>button]:border-slate-700 [&>button]:text-slate-300 [&>button:hover]:bg-slate-700" />
        <MiniMap
          nodeStrokeWidth={3}
          className="border border-slate-700/50 rounded-lg shadow-lg"
          style={{ backgroundColor: '#0f172a' }}
          maskColor="rgba(0, 0, 0, 0.4)"
          nodeColor={(node) => {
            if (node.id === '__root__') return '#a855f7';
            if (node.id.startsWith('__subject_')) {
              const data = node.data as { color?: string };
              return data?.color || '#6366f1';
            }
            const data = node.data as { subject?: { color: string }; status?: string };
            // Tint by subject color for minimap
            return data?.subject?.color || '#60a5fa';
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={30} size={0.8} color="#1e293b80" />
      </ReactFlow>
    </div>
  );
}
