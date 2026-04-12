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

  const { positions: layoutPositions, sectors: subjectSectors } = useMemo(
    () => computeRadialLayout(knowledgeNodes, knowledgeEdges, subjects),
    [knowledgeNodes, knowledgeEdges, subjects]
  );

  const rfNodes = useMemo(() => {
    const result: Node[] = [];
    const hasSelection = selectedNodeId !== null;
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const hasSearchQuery = normalizedSearchQuery.length > 0;

    const rootPos = layoutPositions.get('__root__');
    if (rootPos) {
      result.push({
        id: '__root__',
        type: 'root',
        position: { x: rootPos.x - 165, y: rootPos.y - 165 },
        data: { label: 'Knowledge Nexus', dimmed: hasSelection },
        selectable: false,
        draggable: false,
      });
    }

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
          dimmed: hasSelection,
        },
        selectable: false,
        draggable: false,
      });
    }

    const visibleNodes = knowledgeNodes.filter((node) => {
      if (subjectFilter && node.subject_id !== subjectFilter) {
        return false;
      }
      return true;
    });

    for (const node of visibleNodes) {
      const pos = layoutPositions.get(node.id);
      if (!pos) continue;

      const status: NodeStatus = userProgress[node.id]?.status || 'untouched';
      const subject = subjects.find((s) => s.id === node.subject_id);

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

      const diff = node.difficulty || 1;
      const nodeSize = diff <= 2 ? 120 : diff <= 4 ? 156 : 193;
      const offset = nodeSize / 2;
      const isSelected = node.id === selectedNodeId;
      const isSearchMatch =
        hasSearchQuery &&
        (
          node.title.toLowerCase().includes(normalizedSearchQuery) ||
          node.topic?.toLowerCase().includes(normalizedSearchQuery) ||
          node.description.toLowerCase().includes(normalizedSearchQuery)
        );
      const isDimmed = isSelected
        ? false
        : (hasSelection && node.id !== selectedNodeId) || (hasSearchQuery && !isSearchMatch);

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
          dimmed: isDimmed,
          searchMatched: isSearchMatch,
          searchActive: hasSearchQuery,
        },
        selected: isSelected,
      });
    }

    return result;
  }, [knowledgeNodes, knowledgeEdges, subjects, layoutPositions, userProgress, searchQuery, subjectFilter, selectedNodeId]);

  const rfEdges = useMemo<FlowEdge[]>(() => {
    const visibleNodeIds = new Set(rfNodes.map((n) => n.id));
    const hasSelection = selectedNodeId !== null;

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
        style: {
          stroke: s.color,
          strokeWidth: hasSelection ? 1.8 : 2.6,
          opacity: hasSelection ? 0.1 : 0.62,
          filter: hasSelection ? '' : `drop-shadow(0 0 7px ${s.color}88)`,
        },
        animated: false,
      }];
    });

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
        const sDist = Math.hypot(nodePos.x - subjectPos.x, nodePos.y - subjectPos.y);
        const sT = Math.min(1, Math.max(0, (sDist - 150) / 500));
        const sFade = 1 - sT * 0.7;
        const shortEdgeBoost = 1 + (1 - sT) * 0.55;
        const isSelectedEdge = selectedNodeId === node.id;
        const baseSubjectEdgeWidth = 2.2 * (0.9 + 0.55 * sFade);
        const baseSubjectEdgeOpacity = Math.min(0.82, 0.46 * sFade * shortEdgeBoost);

        subjectConceptEdges.push({
          id: `subject-${subject.id}-to-${node.id}`,
          source: `__subject_${subject.id}`,
          target: node.id,
          sourceHandle,
          targetHandle,
          type: 'straight',
          style: {
            stroke: subject.color,
            strokeWidth: hasSelection && !isSelectedEdge
              ? Math.max(0.9, baseSubjectEdgeWidth * 0.72)
              : baseSubjectEdgeWidth,
            opacity: hasSelection && !isSelectedEdge
              ? Math.max(0.06, baseSubjectEdgeOpacity * 0.16)
              : baseSubjectEdgeOpacity,
            filter: hasSelection && !isSelectedEdge
              ? ''
              : sFade > 0.35 ? `drop-shadow(0 0 6px ${subject.color}77)` : '',
          },
          animated: false,
        });
      }
    }

    const connectionMap = new Map<string, MergedConnection>();

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

        const sourceNode = knowledgeNodes.find((n) => n.id === conn.source);
        const targetNode = knowledgeNodes.find((n) => n.id === conn.target);
        const sourceSubject = subjects.find((s) => s.id === sourceNode?.subject_id);
        const targetSubject = subjects.find((s) => s.id === targetNode?.subject_id);

        let dist = 300;
        if (sourcePos && targetPos) {
          dist = Math.hypot(targetPos.x - sourcePos.x, targetPos.y - sourcePos.y);
        }
        const t = Math.min(1, Math.max(0, (dist - 150) / 650));
        const distanceFade = 1 - t * 0.85;

        const shortEdgeBoost = 1 + (1 - t) * 0.55;
        const isSelectedEdge = selectedNodeId === conn.source || selectedNodeId === conn.target;

        let edgeColor = '#475569';
        let baseWidth = 1;
        let baseOpacity = 0.4;
        let edgeFilter = '';

        if (sourceSubject && targetSubject) {
          if (sourceSubject.id === targetSubject.id) {
            edgeColor = sourceSubject.color;
            baseWidth = 1.35;
            baseOpacity = 0.5;
            edgeFilter = `drop-shadow(0 0 4px ${edgeColor}55)`;
          } else {
            const c1 = sourceSubject.color.replace('#', '');
            const c2 = targetSubject.color.replace('#', '');
            const r = Math.round((parseInt(c1.substring(0, 2), 16) + parseInt(c2.substring(0, 2), 16)) / 2);
            const g = Math.round((parseInt(c1.substring(2, 4), 16) + parseInt(c2.substring(2, 4), 16)) / 2);
            const b = Math.round((parseInt(c1.substring(4, 6), 16) + parseInt(c2.substring(4, 6), 16)) / 2);
            edgeColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            baseWidth = 1.85;
            baseOpacity = 0.58;
            edgeFilter = `drop-shadow(0 0 6px ${edgeColor}77)`;
          }
        }

        const baseEdgeOpacity = Math.min(0.96, baseOpacity * distanceFade * shortEdgeBoost);
        const baseEdgeWidth = baseWidth * (0.95 + 1.0 * distanceFade);
        const edgeOpacity = hasSelection && !isSelectedEdge
          ? Math.max(0.08, baseEdgeOpacity * 0.18)
          : baseEdgeOpacity;
        const edgeWidth = hasSelection && !isSelectedEdge
          ? Math.max(0.95, baseEdgeWidth * 0.72)
          : baseEdgeWidth;
        const finalFilter = hasSelection && !isSelectedEdge
          ? ''
          : distanceFade > 0.25 ? edgeFilter : '';

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
          labelStyle: {
            fontSize: 9,
            fill: hasSelection && !isSelectedEdge ? '#64748b' : '#cbd5e1',
            fontWeight: 400,
          },
          labelBgStyle: { fill: '#0f172a', fillOpacity: hasSelection && !isSelectedEdge ? 0.35 : 0.9 },
          labelBgPadding: [3, 1] as [number, number],
          labelBgBorderRadius: 3,
        };
      });

    return [...subjectEdges, ...subjectConceptEdges, ...conceptEdges];
  }, [knowledgeEdges, prerequisites, rfNodes, subjects, knowledgeNodes, layoutPositions, showEdgeLabels, selectedNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (node.id === '__root__' || node.id.startsWith('__subject_')) return;

      setSelectedNodeId(node.id);
      onNodeClick(node.id);

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
      <Panel position="top-left" className="flex flex-col gap-2 z-10">
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

        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg shadow-lg p-2">
          <Search className="w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 h-8 text-sm border-0 focus:ring-0 bg-transparent text-slate-200 placeholder:text-slate-500"
          />
        </div>
      </Panel>

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
              <span className="text-slate-500">Small - Basics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-slate-600" />
              <span className="text-slate-500">Notable - Intermediate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-slate-600" />
              <span className="text-slate-500">Keystone - Advanced</span>
            </div>
          </div>
        </div>
      </Panel>

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
            return data?.subject?.color || '#60a5fa';
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={30} size={0.8} color="#1e293b80" />
      </ReactFlow>
    </div>
  );
}
