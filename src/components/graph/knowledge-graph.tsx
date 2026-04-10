"use client";

import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge as RFEdge,
  type OnConnect,
  type NodeChange,
  type EdgeChange,
  type NodeMouseHandler,
  ConnectionMode,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ConceptNode } from './concept-node';
import { useGraphStore, useAuthStore } from '@/store';
import { getRelationshipLabel } from '@/lib/utils';
import type { KnowledgeNode, Edge, NodeStatus } from '@/types';
import { Search, Filter, Tags, ZoomIn, Plus, Link2, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Register custom node types
const nodeTypes = { concept: ConceptNode };

interface KnowledgeGraphProps {
  onNodeClick: (nodeId: string) => void;
  onAddNode: (sourceNodeId?: string) => void;
  onLinkNodes: (sourceNodeId?: string) => void;
}

export function KnowledgeGraph({ onNodeClick, onAddNode, onLinkNodes }: KnowledgeGraphProps) {
  const {
    nodes: knowledgeNodes,
    edges: knowledgeEdges,
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
    updateNode,
  } = useGraphStore();

  const { user } = useAuthStore();

  // Convert knowledge nodes to React Flow nodes
  const rfNodes = useMemo(() => {
    return knowledgeNodes
      .filter((node) => {
        // Apply search filter
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
        // Apply subject filter
        if (subjectFilter && node.subject_id !== subjectFilter) {
          return false;
        }
        return true;
      })
      .map((node) => {
        const status: NodeStatus = userProgress[node.id]?.status || 'untouched';
        const subject = subjects.find((s) => s.id === node.subject_id);
        return {
          id: node.id,
          type: 'concept',
          position: { x: node.position_x, y: node.position_y },
          data: {
            label: node.title,
            subject,
            status,
            difficulty: node.difficulty,
            topic: node.topic,
            nodeData: node,
          },
          selected: node.id === selectedNodeId,
        };
      });
  }, [knowledgeNodes, userProgress, subjects, searchQuery, subjectFilter, selectedNodeId]);

  // Convert edges to React Flow edges
  const rfEdges = useMemo(() => {
    const visibleNodeIds = new Set(rfNodes.map((n) => n.id));
    return knowledgeEdges
      .filter((edge) => visibleNodeIds.has(edge.source_node_id) && visibleNodeIds.has(edge.target_node_id))
      .map((edge) => ({
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        label: showEdgeLabels ? getRelationshipLabel(edge.relationship_type) : undefined,
        type: 'smoothstep',
        animated: edge.relationship_type === 'requires',
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        labelStyle: { fontSize: 10, fill: '#64748b', fontWeight: 500 },
        labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.9 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
        data: { relationship_type: edge.relationship_type },
      }));
  }, [knowledgeEdges, rfNodes, showEdgeLabels]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Sync React Flow state with store when data changes
  useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes, setNodes]);

  useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  // Handle node click
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
      onNodeClick(node.id);

      // Mark as in_progress if untouched (user interaction)
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

  // Handle node drag end - save new position
  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateNode(node.id, {
        position_x: node.position.x,
        position_y: node.position.y,
      });
      // Persist position to database
      fetch(`/api/nodes/${node.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position_x: node.position.x,
          position_y: node.position.y,
        }),
      }).catch(console.error);
    },
    [updateNode]
  );

  return (
    <div className="w-full h-full relative">
      {/* Graph Toolbar */}
      <Panel position="top-left" className="flex flex-col gap-2 z-10">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur rounded-lg shadow-md p-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 h-8 text-sm border-0 focus:ring-0"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur rounded-lg shadow-md p-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select
            value={subjectFilter || 'all'}
            onValueChange={(value) => setSubjectFilter(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-48 h-8 text-sm border-0">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
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
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur rounded-lg shadow-md p-2">
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
          <div className="flex flex-col gap-1.5 bg-white/95 backdrop-blur rounded-lg shadow-md p-2">
            <Button size="sm" variant="outline" onClick={() => onAddNode(selectedNodeId || undefined)}>
              <Plus className="w-4 h-4 mr-1" /> Add Node
            </Button>
            <Button size="sm" variant="outline" onClick={() => onLinkNodes(selectedNodeId || undefined)}>
              <Link2 className="w-4 h-4 mr-1" /> Link Nodes
            </Button>
            <Button size="sm" variant="outline" onClick={toggleEdgeLabels}>
              <Tags className="w-4 h-4 mr-1" /> {showEdgeLabels ? 'Hide' : 'Show'} Labels
            </Button>
          </div>
        )}

        {/* Legend */}
        <div className="bg-white/95 backdrop-blur rounded-lg shadow-md p-3 text-xs">
          <p className="font-medium text-gray-700 mb-2">Legend</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-gray-600">Untouched</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Mastered</span>
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
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-slate-50"
      >
        <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
        <MiniMap
          nodeStrokeWidth={3}
          className="border border-gray-200 rounded-lg shadow-sm"
          maskColor="rgba(0, 0, 0, 0.1)"
          nodeColor={(node) => {
            const data = node.data as { status?: string };
            switch (data?.status) {
              case 'mastered': return '#22c55e';
              case 'in_progress': return '#ef4444';
              default: return '#60a5fa';
            }
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}
