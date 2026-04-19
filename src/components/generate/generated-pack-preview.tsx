"use client";

import React, { useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  type Edge as FlowEdge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Badge } from '@/components/ui/badge';
import { ConceptNode } from '@/components/graph/concept-node';
import { SectorBackground } from '@/components/graph/sector-background';
import { SubjectNode } from '@/components/graph/subject-node';
import { TopicNode } from '@/components/graph/topic-node';
import { computeRadialLayout, buildTopicNodeId } from '@/lib/radial-layout';
import { getTopicKey, getTopicLabel, type LearnerState } from '@/lib/learner-state';
import type { ContentPack } from '@/lib/content-pack';
import type { Edge, KnowledgeNode, NodeStatus, Subject } from '@/types';

const nodeTypes = {
  concept: ConceptNode,
  subject: SubjectNode,
  topic: TopicNode,
};

interface GeneratedPackPreviewProps {
  pack: ContentPack;
  existingSubjects: Subject[];
  selectedNodeKey?: string | null;
  onNodeClick?: (nodeKey: string) => void;
}

export function GeneratedPackPreview({ pack, existingSubjects, selectedNodeKey, onNodeClick }: GeneratedPackPreviewProps) {
  const previewData = useMemo(() => {
    const now = new Date().toISOString();
    const packSubjects = new Map<string, Subject>();

    for (const subject of pack.subjects) {
      packSubjects.set(subject.key, {
        id: `pack-subject:${subject.key}`,
        name: subject.name,
        color: subject.color,
        description: subject.description,
        icon: subject.icon,
        created_at: now,
      });
    }

    const subjectLookup = new Map<string, Subject>();
    for (const [key, subject] of packSubjects) {
      subjectLookup.set(key, subject);
      subjectLookup.set(subject.name, subject);
    }
    for (const subject of existingSubjects) {
      subjectLookup.set(subject.name, subject);
    }

    const knowledgeNodes: KnowledgeNode[] = pack.nodes.map((node) => {
      const subject = node.subject ? subjectLookup.get(node.subject) : undefined;
      return {
        id: `pack-node:${node.key}`,
        title: node.title,
        slug: node.slug || node.key,
        subject_id: subject?.id,
        topic: node.topic || undefined,
        description: node.description,
        why_it_matters: node.why_it_matters || undefined,
        use_cases: node.use_cases,
        difficulty: node.difficulty,
        position_x: node.position?.x ?? 0,
        position_y: node.position?.y ?? 0,
        created_at: now,
        updated_at: now,
        subject,
      };
    });

    const nodesByKey = new Map(pack.nodes.map((node, index) => [node.key, knowledgeNodes[index]]));
    const nodesBySlug = new Map(knowledgeNodes.map((node) => [node.slug, node]));
    const previewSubjects = Array.from(
      new Map(knowledgeNodes.filter((node) => node.subject).map((node) => [node.subject!.id, node.subject!])).values()
    );

    const edgeRecords: Edge[] = [];
    for (const edge of pack.edges) {
      const sourceNode = nodesByKey.get(edge.source) || nodesBySlug.get(edge.source);
      const targetNode = nodesByKey.get(edge.target) || nodesBySlug.get(edge.target);
      if (!sourceNode || !targetNode) continue;
      edgeRecords.push({
        id: `preview-edge:${edge.source}:${edge.target}:${edge.relationship_type}`,
        source_node_id: sourceNode.id,
        target_node_id: targetNode.id,
        relationship_type: edge.relationship_type,
        created_at: now,
      });
    }

    const { positions, sectors } = computeRadialLayout(knowledgeNodes, edgeRecords, previewSubjects);
    const topicClusters = new Map<string, { id: string; label: string; subjectId: string; color: string; count: number }>();

    for (const node of knowledgeNodes) {
      if (!node.subject_id || !node.subject) continue;
      const topicLabel = getTopicLabel(node.topic);
      const clusterKey = getTopicKey(node.subject_id, topicLabel);
      const clusterId = buildTopicNodeId(node.subject_id, topicLabel);

      if (!topicClusters.has(clusterKey)) {
        topicClusters.set(clusterKey, {
          id: clusterId,
          label: topicLabel,
          subjectId: node.subject_id,
          color: node.subject.color,
          count: 0,
        });
      }

      topicClusters.get(clusterKey)!.count += 1;
    }

    const rfNodes: Node[] = [];

    for (const subject of previewSubjects) {
      const pos = positions.get(`__subject_${subject.id}`);
      if (!pos) continue;
      const nodeCount = knowledgeNodes.filter((node) => node.subject_id === subject.id).length;
      rfNodes.push({
        id: `__subject_${subject.id}`,
        type: 'subject',
        position: { x: pos.x - 154, y: pos.y - 154 },
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

    for (const cluster of topicClusters.values()) {
      const pos = positions.get(cluster.id);
      if (!pos) continue;
      rfNodes.push({
        id: cluster.id,
        type: 'topic',
        position: { x: pos.x - 106, y: pos.y - 106 },
        data: {
          label: cluster.label,
          color: cluster.color,
          nodeCount: cluster.count,
        },
        selectable: false,
        draggable: false,
      });
    }

    for (const node of knowledgeNodes) {
      const pos = positions.get(node.id);
      if (!pos) continue;
      const nodeSize = node.difficulty <= 2 ? 180 : node.difficulty <= 4 ? 240 : 300;
      const offset = nodeSize / 2;
      const nodeKey = node.id.replace('pack-node:', '');
      rfNodes.push({
        id: node.id,
        type: 'concept',
        position: { x: pos.x - offset, y: pos.y - offset },
        selected: nodeKey === selectedNodeKey,
        data: {
          label: node.title,
          subject: node.subject,
          status: 'untouched' satisfies NodeStatus,
          difficulty: node.difficulty,
          topic: node.topic,
          nodeData: node,
          connectedSubjectColors: node.subject?.color ? [node.subject.color] : [],
          learningState: 'ready' satisfies LearnerState,
        },
        style: onNodeClick ? { cursor: 'pointer' } : undefined,
        draggable: false,
      });
    }

    const flowEdges: FlowEdge[] = [];

    for (const cluster of topicClusters.values()) {
      flowEdges.push({
        id: `subject-to-topic:${cluster.subjectId}:${cluster.id}`,
        source: `__subject_${cluster.subjectId}`,
        target: cluster.id,
        sourceHandle: 'center-src',
        targetHandle: 'center-tgt',
        type: 'straight',
        style: { stroke: cluster.color, strokeWidth: 1.8, opacity: 0.28 },
      });
    }

    for (const node of knowledgeNodes) {
      if (!node.subject_id) continue;
      const topicId = buildTopicNodeId(node.subject_id, getTopicLabel(node.topic));
      flowEdges.push({
        id: `topic-to-node:${topicId}:${node.id}`,
        source: topicId,
        target: node.id,
        sourceHandle: 'center-src',
        targetHandle: 'center-tgt',
        type: 'straight',
        style: { stroke: node.subject?.color || '#64748b', strokeWidth: 1.2, opacity: 0.18 },
      });
    }

    for (const edge of edgeRecords) {
      flowEdges.push({
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        sourceHandle: 'center-src',
        targetHandle: 'center-tgt',
        type: 'straight',
        style: { stroke: '#94a3b8', strokeWidth: 1.3, opacity: 0.45 },
      });
    }

    for (const prerequisite of pack.prerequisites) {
      const node = nodesByKey.get(prerequisite.node) || nodesBySlug.get(prerequisite.node);
      const prerequisiteNode = nodesByKey.get(prerequisite.prerequisite) || nodesBySlug.get(prerequisite.prerequisite);
      if (!node || !prerequisiteNode) continue;

      flowEdges.push({
        id: `preview-prereq:${prerequisite.prerequisite}:${prerequisite.node}`,
        source: prerequisiteNode.id,
        target: node.id,
        sourceHandle: 'center-src',
        targetHandle: 'center-tgt',
        type: 'straight',
        style: { stroke: '#f59e0b', strokeWidth: 1.4, opacity: 0.5, strokeDasharray: '5 5' },
      });
    }

    return { rfNodes, flowEdges, sectors };
  }, [existingSubjects, onNodeClick, pack, selectedNodeKey]);

  if (pack.nodes.length === 0) {
    return (
      <div className="flex h-130 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Generate a content pack to preview its network.
      </div>
    );
  }

  return (
    <div className="h-170 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-slate-800 text-slate-200 border-slate-700">
            Preview
          </Badge>
          <span className="text-sm font-medium text-slate-100">Generated Network</span>
        </div>
        <div className="flex items-center gap-3">
          {onNodeClick && (
            <span className="text-xs text-slate-500">Click a node to edit</span>
          )}
          <span className="text-xs text-slate-400">
            {pack.subjects.length} subject{pack.subjects.length === 1 ? '' : 's'} • {pack.nodes.length} node{pack.nodes.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <ReactFlow
        nodes={previewData.rfNodes}
        edges={previewData.flowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4, maxZoom: 1 }}
        minZoom={0.05}
        maxZoom={2}
        nodesDraggable={false}
        elementsSelectable={false}
        onNodeClick={(_, node) => {
          if (node.type === 'concept' && onNodeClick) {
            const nodeKey = node.id.replace('pack-node:', '');
            onNodeClick(nodeKey);
          }
        }}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        connectionMode={ConnectionMode.Loose}
        proOptions={{ hideAttribution: true }}
        className="bg-slate-950"
      >
        <SectorBackground sectors={previewData.sectors} maxRadius={4600} opacity={0.04} />
        <MiniMap
          nodeStrokeWidth={3}
          className="border border-slate-700/50 rounded-lg shadow-lg"
          style={{ backgroundColor: '#0f172a' }}
          maskColor="rgba(0, 0, 0, 0.42)"
          nodeColor={(node) => {
            if (node.id.startsWith('__subject_')) {
              return (node.data as { color?: string }).color || '#64748b';
            }
            if (node.id.startsWith('__topic_')) {
              return (node.data as { color?: string }).color || '#94a3b8';
            }
            return ((node.data as { subject?: { color?: string } }).subject?.color) || '#60a5fa';
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={32} size={0.8} color="#1e293b80" />
      </ReactFlow>
    </div>
  );
}
