"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge as FlowEdge,
  type Node,
  type NodeChange,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Search, Filter, Tags, Plus, Link2, LayoutGrid, Layers3, Lock, Sparkles, RotateCcw, Sun, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore, useGraphStore } from '@/store';
import { getRelationshipLabel } from '@/lib/utils';
import { estimateStudyMinutes, getNodeLearningMeta, getTopicKey, getTopicLabel } from '@/lib/learner-state';
import { buildTopicNodeId, computeRadialLayout, computeSolarLayout } from '@/lib/radial-layout';
import type { NodeStatus, RelationshipType } from '@/types';
import { ConceptNode } from './concept-node';
import { DesignMenu } from './design-menu';
import {
  DEFAULT_GRAPH_DESIGN_SETTINGS,
  alphaHex,
  getConceptNodeSize,
  getGraphFontFamily,
  getGraphTheme,
  getStructureNodeSize,
  loadGraphDesignSettings,
  persistGraphDesignSettings,
  resolveGraphAccent,
  sanitizeGraphDesignSettings,
  scaleOpacity,
  type GraphDesignSettings,
} from './design-settings';
import { RootNode } from './root-node';
import { SectorBackground } from './sector-background';
import { SubjectNode } from './subject-node';
import { TopicNode } from './topic-node';

const POSITIONS_KEY = 'kn-node-positions';

function loadSavedPositions(): Record<string, { x: number; y: number }> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(POSITIONS_KEY) ?? '{}'); } catch { return {}; }
}

function persistPositions(pos: Record<string, { x: number; y: number }>) {
  try { localStorage.setItem(POSITIONS_KEY, JSON.stringify(pos)); } catch { /* ignore */ }
}

const nodeTypes = {
  concept: ConceptNode,
  root: RootNode,
  subject: SubjectNode,
  topic: TopicNode,
};

interface MergedConnection {
  source: string;
  target: string;
  type: RelationshipType;
}

interface TopicCluster {
  id: string;
  label: string;
  subjectId: string;
  color: string;
  nodeIds: string[];
  nodeCount: number;
  minDifficulty: number;
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

  const isAnimatingRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const [layoutPreset, setLayoutPreset] = useState<'radial' | 'solar'>('radial');
  const [savedPositions, setSavedPositions] = useState<Record<string, { x: number; y: number }>>(() => loadSavedPositions());
  const [designSettings, setDesignSettings] = useState<GraphDesignSettings>(() => loadGraphDesignSettings());
  const graphTheme = useMemo(() => getGraphTheme(designSettings.themeId), [designSettings.themeId]);
  const graphFontFamily = useMemo(() => getGraphFontFamily(designSettings.fontId), [designSettings.fontId]);
  const edgeGlowMultiplier = designSettings.glowStrength * graphTheme.glowBase;
  const edgeOpacityMultiplier = designSettings.edgeStrength * graphTheme.edgeBase;
  const edgeWidthMultiplier = 0.78 + (designSettings.edgeStrength * 0.22);

  const panelStyle = useMemo<React.CSSProperties>(() => ({
    backgroundColor: graphTheme.panelBg,
    borderColor: graphTheme.panelBorder,
    color: graphTheme.panelText,
  }), [graphTheme]);

  const softPanelStyle = useMemo<React.CSSProperties>(() => ({
    backgroundColor: graphTheme.panelSoftBg,
    borderColor: graphTheme.panelBorder,
    color: graphTheme.panelText,
  }), [graphTheme]);

  const flowStyle = useMemo(() => ({
    background: graphTheme.canvasBackground,
    color: graphTheme.panelText,
    fontFamily: graphFontFamily,
    '--graph-background': graphTheme.canvasBackground,
    '--graph-panel-bg': graphTheme.panelBg,
    '--graph-panel-border': graphTheme.panelBorder,
    '--graph-panel-text': graphTheme.panelText,
    '--graph-panel-muted': graphTheme.panelMuted,
    '--graph-control-bg': graphTheme.panelSoftBg,
    '--graph-control-hover': graphTheme.inputBg,
    '--graph-accent': graphTheme.rootAccent,
  } as React.CSSProperties), [graphFontFamily, graphTheme]);

  useEffect(() => {
    persistGraphDesignSettings(designSettings);
  }, [designSettings]);

  const { positions: layoutPositions, sectors: subjectSectors, maxRadius: layoutMaxRadius } = useMemo(
    () => layoutPreset === 'solar'
      ? computeSolarLayout(knowledgeNodes, knowledgeEdges, subjects)
      : computeRadialLayout(knowledgeNodes, knowledgeEdges, subjects),
    [knowledgeNodes, knowledgeEdges, subjects, layoutPreset]
  );

  const themedSubjectSectors = useMemo(
    () => subjectSectors.map((sector) => ({
      ...sector,
      color: resolveGraphAccent(sector.color, graphTheme),
    })),
    [graphTheme, subjectSectors]
  );

  const visibleNodes = useMemo(
    () => knowledgeNodes.filter((node) => !subjectFilter || node.subject_id === subjectFilter),
    [knowledgeNodes, subjectFilter]
  );

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const hasSearchQuery = normalizedSearchQuery.length > 0;

  const searchMatchedNodeIds = useMemo(() => {
    if (!hasSearchQuery) {
      return new Set<string>();
    }

    return new Set(
      visibleNodes
        .filter((node) =>
          node.title.toLowerCase().includes(normalizedSearchQuery) ||
          getTopicLabel(node.topic).toLowerCase().includes(normalizedSearchQuery) ||
          node.description.toLowerCase().includes(normalizedSearchQuery)
        )
        .map((node) => node.id)
    );
  }, [visibleNodes, hasSearchQuery, normalizedSearchQuery]);

  const topicClusters = useMemo<TopicCluster[]>(() => {
    const clusters = new Map<string, TopicCluster>();

    for (const node of visibleNodes) {
      if (!node.subject_id) {
        continue;
      }

      const subject = subjects.find((entry) => entry.id === node.subject_id);
      if (!subject) {
        continue;
      }

      const topicLabel = getTopicLabel(node.topic);
      const clusterKey = getTopicKey(subject.id, topicLabel);
      const clusterId = buildTopicNodeId(subject.id, topicLabel);

      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, {
          id: clusterId,
          label: topicLabel,
          subjectId: subject.id,
          color: subject.color,
          nodeIds: [],
          nodeCount: 0,
          minDifficulty: node.difficulty,
        });
      }

      const cluster = clusters.get(clusterKey)!;
      cluster.nodeIds.push(node.id);
      cluster.nodeCount += 1;
      cluster.minDifficulty = Math.min(cluster.minDifficulty, node.difficulty);
    }

    return Array.from(clusters.values()).sort((a, b) => {
      if (a.subjectId !== b.subjectId) {
        return a.subjectId.localeCompare(b.subjectId);
      }
      if (a.minDifficulty !== b.minDifficulty) {
        return a.minDifficulty - b.minDifficulty;
      }
      return a.label.localeCompare(b.label);
    });
  }, [visibleNodes, subjects]);

  const rfNodes = useMemo(() => {
    const result: Node[] = [];
    const hasSelection = selectedNodeId !== null;

    const rootPos = layoutPositions.get('__root__');
    if (rootPos) {
      const rootSize = getStructureNodeSize('root', designSettings);
      result.push({
        id: '__root__',
        type: 'root',
        position: savedPositions['__root__'] ?? { x: rootPos.x - rootSize / 2, y: rootPos.y - rootSize / 2 },
        data: { label: 'Knowledge Nexus', dimmed: hasSelection, design: designSettings },
        selectable: false,
      });
    }

    for (const subject of subjects) {
      const pos = layoutPositions.get(`__subject_${subject.id}`);
      const nodeCount = visibleNodes.filter((node) => node.subject_id === subject.id).length;
      if (!pos || nodeCount === 0) continue;

      const subjectHasSearchMatch = !hasSearchQuery ||
        visibleNodes.some((node) => node.subject_id === subject.id && searchMatchedNodeIds.has(node.id));
      const subjectSize = getStructureNodeSize('subject', designSettings);

      result.push({
        id: `__subject_${subject.id}`,
        type: 'subject',
        position: savedPositions[`__subject_${subject.id}`] ?? { x: pos.x - subjectSize / 2, y: pos.y - subjectSize / 2 },
        data: {
          label: subject.name,
          color: subject.color,
          icon: subject.icon,
          nodeCount,
          dimmed: hasSelection || !subjectHasSearchMatch,
          solar: layoutPreset === 'solar',
          orbitPeriod: 12 + (subjects.indexOf(subject) * 7) % 16,
          design: designSettings,
        },
        selectable: false,
      });
    }

    for (const cluster of topicClusters) {
      const pos = layoutPositions.get(cluster.id);
      if (!pos) continue;

      const topicHasSearchMatch = !hasSearchQuery ||
        cluster.label.toLowerCase().includes(normalizedSearchQuery) ||
        cluster.nodeIds.some((id) => searchMatchedNodeIds.has(id));
      const topicSize = getStructureNodeSize('topic', designSettings);

      result.push({
        id: cluster.id,
        type: 'topic',
        position: savedPositions[cluster.id] ?? { x: pos.x - topicSize / 2, y: pos.y - topicSize / 2 },
        data: {
          label: cluster.label,
          color: cluster.color,
          nodeCount: cluster.nodeCount,
          dimmed: hasSelection || !topicHasSearchMatch,
          design: designSettings,
        },
        selectable: false,
      });
    }

    for (const node of visibleNodes) {
      const pos = layoutPositions.get(node.id);
      if (!pos) continue;

      const status: NodeStatus = userProgress[node.id]?.status || 'untouched';
      const subject = subjects.find((entry) => entry.id === node.subject_id);
      const learningMeta = getNodeLearningMeta(node, prerequisites, userProgress);

      const connectedSubjectColors = new Set<string>();
      if (subject?.color) connectedSubjectColors.add(subject.color);

      for (const edge of knowledgeEdges) {
        let otherNodeId: string | null = null;
        if (edge.source_node_id === node.id) otherNodeId = edge.target_node_id;
        else if (edge.target_node_id === node.id) otherNodeId = edge.source_node_id;
        if (!otherNodeId) continue;

        const otherNode = knowledgeNodes.find((entry) => entry.id === otherNodeId);
        if (otherNode && otherNode.subject_id !== node.subject_id) {
          const otherSubject = subjects.find((entry) => entry.id === otherNode.subject_id);
          if (otherSubject?.color) connectedSubjectColors.add(otherSubject.color);
        }
      }

      const diff = node.difficulty || 1;
      const nodeSize = getConceptNodeSize(diff, designSettings);
      const offset = nodeSize / 2;
      const isSelected = node.id === selectedNodeId;
      const isSearchMatch = hasSearchQuery && searchMatchedNodeIds.has(node.id);
      const isDimmed = isSelected
        ? false
        : (hasSelection && node.id !== selectedNodeId) || (hasSearchQuery && !isSearchMatch);

      result.push({
        id: node.id,
        type: 'concept',
        position: savedPositions[node.id] ?? { x: pos.x - offset, y: pos.y - offset },
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
          learningState: learningMeta.learnerState,
          prerequisiteSummary: learningMeta.isLocked
            ? `${learningMeta.masteredPrerequisiteIds.length}/${learningMeta.prerequisiteIds.length} prerequisites mastered`
            : undefined,
          estimatedMinutes: estimateStudyMinutes(node.difficulty),
          design: designSettings,
        },
        selected: isSelected,
      });
    }

    return result;
  }, [
    designSettings,
    knowledgeEdges,
    knowledgeNodes,
    layoutPositions,
    layoutPreset,
    normalizedSearchQuery,
    prerequisites,
    searchMatchedNodeIds,
    selectedNodeId,
    savedPositions,
    subjects,
    topicClusters,
    userProgress,
    visibleNodes,
    hasSearchQuery,
  ]);

  const rfEdges = useMemo<FlowEdge[]>(() => {
    const visibleNodeIds = new Set(rfNodes.map((node) => node.id));
    const hasSelection = selectedNodeId !== null;

    const subjectEdges: FlowEdge[] = subjects.flatMap((subject) => {
      if (!visibleNodeIds.has(`__subject_${subject.id}`)) {
        return [];
      }
      const edgeColor = resolveGraphAccent(subject.color, graphTheme);

      return [{
        id: `root-to-${subject.id}`,
        source: '__root__',
        target: `__subject_${subject.id}`,
        sourceHandle: 'center-src',
        targetHandle: 'center-tgt',
        type: 'straight',
        style: {
          stroke: edgeColor,
          strokeWidth: (hasSelection ? 1.8 : 2.8) * edgeWidthMultiplier,
          opacity: scaleOpacity(hasSelection ? 0.1 : 0.62, edgeOpacityMultiplier),
          filter: hasSelection || edgeGlowMultiplier <= 0.03 ? '' : `drop-shadow(0 0 7px ${edgeColor}${alphaHex(0.53 * edgeGlowMultiplier)})`,
        },
        animated: false,
      }];
    });

    const subjectTopicEdges: FlowEdge[] = topicClusters.flatMap((cluster) => {
      if (!visibleNodeIds.has(cluster.id) || !visibleNodeIds.has(`__subject_${cluster.subjectId}`)) {
        return [];
      }

      const isSelectedEdge = cluster.nodeIds.includes(selectedNodeId || '');
      const opacity = hasSelection && !isSelectedEdge ? 0.08 : 0.32;

      return [{
        id: `subject-${cluster.subjectId}-to-topic-${cluster.id}`,
        source: `__subject_${cluster.subjectId}`,
        target: cluster.id,
        sourceHandle: 'center-src',
        targetHandle: 'center-tgt',
        type: 'straight',
        style: {
            stroke: resolveGraphAccent(cluster.color, graphTheme),
            strokeWidth: 1.8 * edgeWidthMultiplier,
            opacity: scaleOpacity(opacity, edgeOpacityMultiplier),
            filter: (hasSelection && !isSelectedEdge) || edgeGlowMultiplier <= 0.03
              ? ''
              : `drop-shadow(0 0 5px ${resolveGraphAccent(cluster.color, graphTheme)}${alphaHex(0.27 * edgeGlowMultiplier)})`,
          },
        }];
      });

    const topicConceptEdges: FlowEdge[] = topicClusters.flatMap((cluster) => {
      const lowestDifficulty = Math.min(
        ...cluster.nodeIds.map((nodeId) => knowledgeNodes.find((node) => node.id === nodeId)?.difficulty ?? Number.POSITIVE_INFINITY)
      );

      const entryNodes = cluster.nodeIds.filter(
        (nodeId) => (knowledgeNodes.find((node) => node.id === nodeId)?.difficulty ?? Number.POSITIVE_INFINITY) === lowestDifficulty
      );

      return entryNodes.flatMap((nodeId) => {
        if (!visibleNodeIds.has(cluster.id) || !visibleNodeIds.has(nodeId)) {
          return [];
        }

        const isSelectedEdge = selectedNodeId === nodeId;

        return [{
          id: `topic-${cluster.id}-to-${nodeId}`,
          source: cluster.id,
          target: nodeId,
          sourceHandle: 'center-src',
          targetHandle: 'center-tgt',
          type: 'straight',
          style: {
            stroke: resolveGraphAccent(cluster.color, graphTheme),
            strokeWidth: (hasSelection && !isSelectedEdge ? 1 : 1.7) * edgeWidthMultiplier,
            opacity: scaleOpacity(hasSelection && !isSelectedEdge ? 0.08 : 0.24, edgeOpacityMultiplier),
            filter: (hasSelection && !isSelectedEdge) || edgeGlowMultiplier <= 0.03
              ? ''
              : `drop-shadow(0 0 5px ${resolveGraphAccent(cluster.color, graphTheme)}${alphaHex(0.2 * edgeGlowMultiplier)})`,
          },
        }];
      });
    });

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

    for (const prerequisite of prerequisites) {
      const key = [prerequisite.prerequisite_node_id, prerequisite.node_id].sort().join('::');
      if (!connectionMap.has(key)) {
        connectionMap.set(key, {
          source: prerequisite.prerequisite_node_id,
          target: prerequisite.node_id,
          type: 'requires',
        });
      }
    }

    const conceptEdges: FlowEdge[] = Array.from(connectionMap.entries())
      .filter(([, connection]) => visibleNodeIds.has(connection.source) && visibleNodeIds.has(connection.target))
      .map(([key, connection]) => {
        const sourcePos = layoutPositions.get(connection.source);
        const targetPos = layoutPositions.get(connection.target);

        const sourceNode = knowledgeNodes.find((node) => node.id === connection.source);
        const targetNode = knowledgeNodes.find((node) => node.id === connection.target);
        const sourceSubject = subjects.find((subject) => subject.id === sourceNode?.subject_id);
        const targetSubject = subjects.find((subject) => subject.id === targetNode?.subject_id);

        let distance = 300;
        if (sourcePos && targetPos) {
          distance = Math.hypot(targetPos.x - sourcePos.x, targetPos.y - sourcePos.y);
        }

        const t = Math.min(1, Math.max(0, (distance - 150) / 650));
        const distanceFade = 1 - t * 0.85;
        const shortEdgeBoost = 1 + (1 - t) * 0.55;
        const isSelectedEdge = selectedNodeId === connection.source || selectedNodeId === connection.target;

        let edgeColor = '#475569';
        let baseWidth = 1;
        let baseOpacity = 0.4;
        let edgeFilter = '';

        if (sourceSubject && targetSubject) {
          const sourceColor = resolveGraphAccent(sourceSubject.color, graphTheme);
          const targetColor = resolveGraphAccent(targetSubject.color, graphTheme);
          if (sourceSubject.id === targetSubject.id) {
            edgeColor = sourceColor;
            baseWidth = 1.35;
            baseOpacity = 0.5;
            edgeFilter = edgeGlowMultiplier <= 0.03 ? '' : `drop-shadow(0 0 4px ${edgeColor}${alphaHex(0.33 * edgeGlowMultiplier)})`;
          } else {
            const c1 = sourceColor.replace('#', '');
            const c2 = targetColor.replace('#', '');
            const r = Math.round((parseInt(c1.substring(0, 2), 16) + parseInt(c2.substring(0, 2), 16)) / 2);
            const g = Math.round((parseInt(c1.substring(2, 4), 16) + parseInt(c2.substring(2, 4), 16)) / 2);
            const b = Math.round((parseInt(c1.substring(4, 6), 16) + parseInt(c2.substring(4, 6), 16)) / 2);
            edgeColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            baseWidth = 1.85;
            baseOpacity = 0.58;
            edgeFilter = edgeGlowMultiplier <= 0.03 ? '' : `drop-shadow(0 0 6px ${edgeColor}${alphaHex(0.47 * edgeGlowMultiplier)})`;
          }
        }

        const baseEdgeOpacity = Math.min(0.96, baseOpacity * distanceFade * shortEdgeBoost * edgeOpacityMultiplier);
        const baseEdgeWidth = baseWidth * (0.95 + 1.0 * distanceFade) * edgeWidthMultiplier;
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
          source: connection.source,
          target: connection.target,
          sourceHandle: 'center-src',
          targetHandle: 'center-tgt',
          label: showEdgeLabels ? getRelationshipLabel(connection.type) : undefined,
          type: 'straight',
          animated: false,
          style: { stroke: edgeColor, strokeWidth: edgeWidth, opacity: edgeOpacity, filter: finalFilter },
          labelStyle: {
            fontSize: 9 * designSettings.fontScale,
            fill: hasSelection && !isSelectedEdge ? graphTheme.panelMuted : graphTheme.edgeLabelText,
            fontWeight: 400,
          },
          labelBgStyle: { fill: graphTheme.edgeLabelBg, fillOpacity: hasSelection && !isSelectedEdge ? 0.35 : 0.9 },
          labelBgPadding: [3, 1] as [number, number],
          labelBgBorderRadius: 3,
        };
      });

    return [...subjectEdges, ...subjectTopicEdges, ...topicConceptEdges, ...conceptEdges];
  }, [
    designSettings.fontScale,
    edgeGlowMultiplier,
    edgeOpacityMultiplier,
    edgeWidthMultiplier,
    graphTheme,
    knowledgeEdges,
    knowledgeNodes,
    layoutPositions,
    prerequisites,
    rfNodes,
    selectedNodeId,
    showEdgeLabels,
    subjects,
    topicClusters,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  useEffect(() => {
    if (!isAnimatingRef.current) {
      setNodes(rfNodes);
    }
  }, [rfNodes, setNodes]);

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges, setEdges]);

  const switchPreset = useCallback((preset: 'radial' | 'solar') => {
    setSavedPositions({});
    persistPositions({});
    setLayoutPreset(preset);
  }, []);

  const handleDesignSettingsChange = useCallback((settings: GraphDesignSettings) => {
    setDesignSettings(sanitizeGraphDesignSettings(settings));
  }, []);

  const handleResetDesign = useCallback(() => {
    setDesignSettings(DEFAULT_GRAPH_DESIGN_SETTINGS);
  }, []);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);

    let hasNew = false;
    const updated = { ...savedPositions };
    for (const change of changes) {
      if (change.type === 'position' && change.dragging === false && change.position) {
        updated[change.id] = { x: change.position.x, y: change.position.y };
        hasNew = true;
      }
    }
    if (hasNew) {
      setSavedPositions(updated);
      persistPositions(updated);
    }
  }, [onNodesChange, savedPositions]);

  const handleResetLayout = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const startSnapshot: Record<string, { x: number; y: number }> = {};
    setNodes(current => {
      for (const n of current) startSnapshot[n.id] = { ...n.position };
      return current;
    });

    const getTarget = (nodeId: string): { x: number; y: number } | null => {
      const pos = layoutPositions.get(nodeId);
      if (!pos) return null;
      if (nodeId === '__root__') {
        const size = getStructureNodeSize('root', designSettings);
        return { x: pos.x - size / 2, y: pos.y - size / 2 };
      }
      if (nodeId.startsWith('__subject_')) {
        const size = getStructureNodeSize('subject', designSettings);
        return { x: pos.x - size / 2, y: pos.y - size / 2 };
      }
      if (nodeId.startsWith('__topic_')) {
        const size = getStructureNodeSize('topic', designSettings);
        return { x: pos.x - size / 2, y: pos.y - size / 2 };
      }
      const kn = knowledgeNodes.find(n => n.id === nodeId);
      const diff = kn?.difficulty ?? 1;
      const size = getConceptNodeSize(diff, designSettings);
      return { x: pos.x - size / 2, y: pos.y - size / 2 };
    };

    const duration = 3000;
    const startTime = performance.now();
    isAnimatingRef.current = true;

    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const e = easeInOut(t);

      setNodes(current =>
        current.map(node => {
          const start = startSnapshot[node.id];
          const target = getTarget(node.id);
          if (!start || !target) return node;
          return {
            ...node,
            position: {
              x: start.x + (target.x - start.x) * e,
              y: start.y + (target.y - start.y) * e,
            },
          };
        })
      );

      if (t < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        isAnimatingRef.current = false;
        animationRef.current = null;
        setSavedPositions({});
        persistPositions({});
      }
    };

    animationRef.current = requestAnimationFrame(tick);
  }, [designSettings, layoutPositions, knowledgeNodes, setNodes]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (
        node.id === '__root__' ||
        node.id.startsWith('__subject_') ||
        node.id.startsWith('__topic_')
      ) {
        return;
      }

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
    [onNodeClick, setSelectedNodeId, user, userProgress]
  );

  const handlePaneDoubleClick = useCallback(() => {
    if (graphMode === 'edit') {
      onAddNode(selectedNodeId || undefined);
    }
  }, [graphMode, onAddNode, selectedNodeId]);

  return (
    <div className="w-full h-full relative" style={{ fontFamily: graphFontFamily }}>
      <Panel position="top-left" className="flex flex-col gap-2 z-10">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg shadow-lg p-2" style={panelStyle}>
          <Filter className="w-4 h-4 text-slate-500" style={{ color: graphTheme.panelMuted }} />
          <Select
            value={subjectFilter || 'all'}
            onValueChange={(value) => setSubjectFilter(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-48 h-8 text-sm border-0 bg-transparent text-slate-200" style={{ color: graphTheme.panelText }}>
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200" style={panelStyle}>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: resolveGraphAccent(subject.color, graphTheme) }} />
                    {subject.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg shadow-lg p-2" style={panelStyle}>
          <Search className="w-4 h-4 text-slate-500" style={{ color: graphTheme.panelMuted }} />
          <Input
            placeholder="Search nodes or topics..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-72 h-8 text-sm border-0 focus:ring-0 bg-transparent text-slate-200 placeholder:text-slate-500"
            style={{ color: graphTheme.panelText, backgroundColor: 'transparent' }}
          />
        </div>
      </Panel>

      <Panel position="top-right" className="flex flex-col gap-2 z-10">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg shadow-lg p-2" style={panelStyle}>
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

        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg shadow-lg p-2" style={panelStyle}>
          <Button
            variant={layoutPreset === 'radial' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-1.5"
            onClick={() => switchPreset('radial')}
            title="Radial layout — hierarchical sectors"
          >
            <Network className="w-3.5 h-3.5" />
            Radial
          </Button>
          <Button
            variant={layoutPreset === 'solar' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-1.5"
            onClick={() => switchPreset('solar')}
            title="Solar system layout — planets and moons"
          >
            <Sun className="w-3.5 h-3.5" />
            Solar
          </Button>
        </div>

        <DesignMenu
          settings={designSettings}
          theme={graphTheme}
          onSettingsChange={handleDesignSettingsChange}
          onReset={handleResetDesign}
        />

        {graphMode === 'edit' && (
          <div className="flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg shadow-lg p-2" style={panelStyle}>
            <Button size="sm" variant="outline" onClick={() => onAddNode(selectedNodeId || undefined)}>
              <Plus className="w-4 h-4 mr-1" /> Add Node
            </Button>
            <Button size="sm" variant="outline" onClick={() => onLinkNodes(selectedNodeId || undefined)}>
              <Link2 className="w-4 h-4 mr-1" /> Link Nodes
            </Button>
            <Button size="sm" variant="outline" onClick={toggleEdgeLabels}>
              <Tags className="w-4 h-4 mr-1" /> {showEdgeLabels ? 'Hide' : 'Show'} Labels
            </Button>
            <p className="text-[10px] text-slate-500 text-center px-1" style={{ color: graphTheme.panelMuted }}>
              Double-click canvas to add
            </p>
          </div>
        )}

        <div className="bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-lg shadow-lg p-3 text-xs" style={panelStyle}>
          <p className="font-medium text-slate-400 mb-2 tracking-wide uppercase text-[10px]" style={{ color: graphTheme.panelMuted }}>Learning State</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-500" style={{ color: graphTheme.lockedColor }} />
              <span className="text-slate-500" style={{ color: graphTheme.panelMuted }}>Locked by prerequisites</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" style={{ color: graphTheme.readyColor }} />
              <span className="text-slate-300" style={{ color: graphTheme.panelText }}>Ready next</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-amber-500/50" style={{ backgroundColor: graphTheme.nodeShell, borderColor: `${graphTheme.progressColor}${alphaHex(0.5)}`, boxShadow: edgeGlowMultiplier > 0.03 ? `0 0 6px ${graphTheme.progressColor}${alphaHex(0.4 * edgeGlowMultiplier)}` : 'none' }} />
              <span className="text-slate-400" style={{ color: graphTheme.panelMuted }}>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-amber-300" style={{ color: graphTheme.reviewColor }} />
              <span className="text-slate-300" style={{ color: graphTheme.panelText }}>Review due</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-emerald-400/50" style={{ backgroundColor: graphTheme.nodeShell, borderColor: `${graphTheme.masteredColor}${alphaHex(0.5)}`, boxShadow: edgeGlowMultiplier > 0.03 ? `0 0 8px ${graphTheme.masteredColor}${alphaHex(0.5 * edgeGlowMultiplier)}` : 'none' }} />
              <span className="text-slate-200" style={{ color: graphTheme.panelText }}>Mastered</span>
            </div>
            <hr className="my-1 border-slate-700/50" style={{ borderColor: graphTheme.panelBorder }} />
            <p className="font-medium text-slate-400 mb-1 tracking-wide uppercase text-[10px]" style={{ color: graphTheme.panelMuted }}>Structure</p>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-fuchsia-500/70" style={{ backgroundColor: graphTheme.rootAccent }} />
              <span className="text-slate-400" style={{ color: graphTheme.panelMuted }}>Root</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-300/70" style={{ backgroundColor: graphTheme.nodeText }} />
              <span className="text-slate-400" style={{ color: graphTheme.panelMuted }}>Subject</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers3 className="w-3.5 h-3.5 text-slate-300" style={{ color: graphTheme.nodeText }} />
              <span className="text-slate-400" style={{ color: graphTheme.panelMuted }}>Topic</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-slate-300/70" style={{ backgroundColor: graphTheme.nodeText }} />
              <span className="text-slate-400" style={{ color: graphTheme.panelMuted }}>Concept</span>
            </div>
          </div>
        </div>
      </Panel>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={() => {}}
        onDoubleClick={handlePaneDoubleClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.42, maxZoom: 1 }}
        minZoom={0.02}
        maxZoom={4}
        zoomOnScroll
        zoomOnPinch
        panOnScroll={false}
        panOnDrag
        selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
        className="bg-slate-950 knowledge-graph-surface"
        style={flowStyle}
      >
        <SectorBackground
          sectors={themedSubjectSectors}
          maxRadius={layoutMaxRadius}
          opacity={0.04 * designSettings.backgroundIntensity * graphTheme.sectorBase}
        />
        <Controls className="bg-slate-900 border border-slate-700/50 rounded-lg shadow-lg [&>button]:bg-slate-800 [&>button]:border-slate-700 [&>button]:text-slate-300 [&>button:hover]:bg-slate-700" />
        <Panel position="bottom-left" style={{ marginLeft: '52px', marginBottom: '10px' }}>
          <button
            onClick={handleResetLayout}
            className="bg-slate-900 border border-slate-700/50 rounded-lg shadow-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
            style={softPanelStyle}
            title="Reset to default layout"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </Panel>
        <MiniMap
          nodeStrokeWidth={3}
          className="border border-slate-700/50 rounded-lg shadow-lg"
          style={{ backgroundColor: graphTheme.minimapBg, borderColor: graphTheme.panelBorder }}
          maskColor={graphTheme.minimapMask}
          nodeColor={(node) => {
            if (node.id === '__root__') return graphTheme.rootAccent;
            if (node.id.startsWith('__subject_')) {
              const data = node.data as { color?: string };
              return resolveGraphAccent(data.color, graphTheme);
            }
            if (node.id.startsWith('__topic_')) {
              const data = node.data as { color?: string };
              return resolveGraphAccent(data.color, graphTheme);
            }
            const data = node.data as { subject?: { color: string } };
            return resolveGraphAccent(data.subject?.color, graphTheme);
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={designSettings.backgroundIntensity === 0 ? 0 : Math.max(0.2, 0.8 * designSettings.backgroundIntensity)}
          color={designSettings.backgroundIntensity === 0 ? 'transparent' : graphTheme.gridColor}
        />
      </ReactFlow>
    </div>
  );
}
