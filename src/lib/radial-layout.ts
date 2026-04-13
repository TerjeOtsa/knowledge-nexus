/**
 * Radial Tree Layout Engine for Knowledge Nexus
 *
 * Layout hierarchy:
 *   - Center: root node
 *   - Ring 1: subjects
 *   - Ring 2: topics within each subject sector
 *   - Outer rings: concepts grouped by topic and ordered by difficulty
 */

import { getTopicLabel } from '@/lib/learner-state';
import type { Edge, KnowledgeNode, Subject } from '@/types';

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

export interface SectorInfo {
  subjectId: string;
  subjectName: string;
  color: string;
  startAngle: number;
  endAngle: number;
  midAngle: number;
}

export interface RadialLayoutResult {
  positions: Map<string, LayoutNode>;
  sectors: SectorInfo[];
  maxRadius: number;
}

export interface RadialLayoutConfig {
  subjectRingRadius: number;
  topicRingRadius: number;
  firstConceptRing: number;
  ringSpacing: number;
  sectorPadding: number;
  topicPadding: number;
  centerX: number;
  centerY: number;
}

const DEFAULT_CONFIG: RadialLayoutConfig = {
  subjectRingRadius: 800,    // base; scales up adaptively with node count
  topicRingRadius: 1300,
  firstConceptRing: 1850,
  ringSpacing: 440,
  sectorPadding: 0.22,
  topicPadding: 0.12,
  centerX: 0,
  centerY: 0,
};

interface TopicGroup {
  label: string;
  nodesByDifficulty: Map<number, KnowledgeNode[]>;
  totalCount: number;
}

function slugifyTopicLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

export function buildTopicNodeId(subjectId: string, topicLabel: string): string {
  return `__topic_${subjectId}_${slugifyTopicLabel(topicLabel)}`;
}

function groupNodesBySubjectTopicAndDifficulty(
  nodes: KnowledgeNode[],
  subjects: Subject[]
): Map<string, Map<string, TopicGroup>> {
  const grouped = new Map<string, Map<string, TopicGroup>>();

  for (const subject of subjects) {
    grouped.set(subject.id, new Map());
  }

  grouped.set('__none__', new Map());

  for (const node of nodes) {
    const subjectId = node.subject_id || '__none__';
    if (!grouped.has(subjectId)) {
      grouped.set(subjectId, new Map());
    }

    const topicLabel = getTopicLabel(node.topic);
    const subjectTopics = grouped.get(subjectId)!;

    if (!subjectTopics.has(topicLabel)) {
      subjectTopics.set(topicLabel, {
        label: topicLabel,
        nodesByDifficulty: new Map<number, KnowledgeNode[]>(),
        totalCount: 0,
      });
    }

    const topicGroup = subjectTopics.get(topicLabel)!;
    if (!topicGroup.nodesByDifficulty.has(node.difficulty)) {
      topicGroup.nodesByDifficulty.set(node.difficulty, []);
    }

    topicGroup.nodesByDifficulty.get(node.difficulty)!.push(node);
    topicGroup.totalCount += 1;
  }

  return grouped;
}

function buildPrerequisiteOrder(nodesInRing: KnowledgeNode[], edges: Edge[]): KnowledgeNode[] {
  if (nodesInRing.length <= 1) return nodesInRing;

  const nodeIds = new Set(nodesInRing.map((node) => node.id));
  const inDegree = new Map<string, number>();
  const adjacencyList = new Map<string, string[]>();

  for (const node of nodesInRing) {
    inDegree.set(node.id, 0);
    adjacencyList.set(node.id, []);
  }

  for (const edge of edges) {
    if (
      nodeIds.has(edge.source_node_id) &&
      nodeIds.has(edge.target_node_id) &&
      (edge.relationship_type === 'leads_to' || edge.relationship_type === 'requires')
    ) {
      adjacencyList.get(edge.source_node_id)!.push(edge.target_node_id);
      inDegree.set(edge.target_node_id, (inDegree.get(edge.target_node_id) || 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) {
      queue.push(id);
    }
  }

  const sortedNodeIds: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sortedNodeIds.push(current);

    for (const neighbor of adjacencyList.get(current) || []) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  const sortedSet = new Set(sortedNodeIds);
  for (const node of nodesInRing) {
    if (!sortedSet.has(node.id)) {
      sortedNodeIds.push(node.id);
    }
  }

  const nodeMap = new Map(nodesInRing.map((node) => [node.id, node]));
  return sortedNodeIds.map((id) => nodeMap.get(id)!);
}

export function computeRadialLayout(
  nodes: KnowledgeNode[],
  edges: Edge[],
  subjects: Subject[],
  config: Partial<RadialLayoutConfig> = {}
): RadialLayoutResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const positions = new Map<string, LayoutNode>();

  positions.set('__root__', {
    id: '__root__',
    x: cfg.centerX,
    y: cfg.centerY,
  });

  const grouped = groupNodesBySubjectTopicAndDifficulty(nodes, subjects);

  const activeSubjects = subjects.filter((subject) => {
    const subjectTopics = grouped.get(subject.id);
    return subjectTopics && subjectTopics.size > 0;
  });

  if (activeSubjects.length === 0) {
    return { positions, sectors: [], maxRadius: cfg.firstConceptRing + 5 * cfg.ringSpacing + 300 };
  }

  const totalPadding = cfg.sectorPadding * activeSubjects.length;
  const availableAngle = 2 * Math.PI - totalPadding;

  const nodeCounts = new Map<string, number>();
  let totalNodes = 0;
  for (const subject of activeSubjects) {
    const subjectTopics = grouped.get(subject.id)!;
    const count = Array.from(subjectTopics.values()).reduce((sum, topicGroup) => sum + topicGroup.totalCount, 0);
    nodeCounts.set(subject.id, count);
    totalNodes += count;
  }

  // Adaptive scaling: layout expands gently as nodes are added.
  // Baseline 30 nodes = 1.0×; ~1.6× at 120 nodes, ~2× at 300 nodes.
  const nodeScaleFactor = Math.max(1.0, Math.pow(totalNodes / 30, 0.35));
  const adaptiveSubjectRadius = cfg.subjectRingRadius * nodeScaleFactor;
  const adaptiveTopicRadius = adaptiveSubjectRadius + (cfg.topicRingRadius - cfg.subjectRingRadius) * Math.max(1.0, nodeScaleFactor * 0.8);
  const adaptiveFirstConceptRing = adaptiveTopicRadius + (cfg.firstConceptRing - cfg.topicRingRadius) * Math.max(1.0, nodeScaleFactor * 0.8);
  const adaptiveRingSpacing = cfg.ringSpacing * Math.max(1.0, nodeScaleFactor * 0.75);
  const maxRadius = Math.ceil(adaptiveFirstConceptRing + 5 * adaptiveRingSpacing + 300);

  interface InternalSector {
    subject: Subject;
    startAngle: number;
    endAngle: number;
    midAngle: number;
  }

  const internalSectors: InternalSector[] = [];
  const exportedSectors: SectorInfo[] = [];
  let currentAngle = -Math.PI / 2;

  for (const subject of activeSubjects) {
    const count = nodeCounts.get(subject.id) || 1;
    const sectorAngle = (count / Math.max(totalNodes, 1)) * availableAngle;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sectorAngle;
    const midAngle = (startAngle + endAngle) / 2;

    internalSectors.push({ subject, startAngle, endAngle, midAngle });
    exportedSectors.push({
      subjectId: subject.id,
      subjectName: subject.name,
      color: subject.color,
      startAngle,
      endAngle,
      midAngle,
    });

    positions.set(`__subject_${subject.id}`, {
      id: `__subject_${subject.id}`,
      x: cfg.centerX + adaptiveSubjectRadius * Math.cos(midAngle),
      y: cfg.centerY + adaptiveSubjectRadius * Math.sin(midAngle),
    });

    currentAngle = endAngle + cfg.sectorPadding;
  }

  for (const sector of internalSectors) {
    const subjectTopics = grouped.get(sector.subject.id);
    if (!subjectTopics || subjectTopics.size === 0) {
      continue;
    }

    const topics = Array.from(subjectTopics.values()).sort((a, b) => {
      const aMin = a.nodesByDifficulty.size > 0 ? Math.min(...a.nodesByDifficulty.keys()) : 999;
      const bMin = b.nodesByDifficulty.size > 0 ? Math.min(...b.nodesByDifficulty.keys()) : 999;
      if (aMin !== bMin) return aMin - bMin;
      return a.label.localeCompare(b.label);
    });

    const totalTopicPadding = cfg.topicPadding * Math.max(0, topics.length - 1);
    const topicAvailableAngle = Math.max(
      sector.endAngle - sector.startAngle - totalTopicPadding,
      0.2
    );
    const topicTotalNodes = topics.reduce((sum, topic) => sum + topic.totalCount, 0);

    let topicStartAngle = sector.startAngle;

    for (const topic of topics) {
      const topicAngle = (topic.totalCount / Math.max(topicTotalNodes, 1)) * topicAvailableAngle;
      const topicEndAngle = topicStartAngle + topicAngle;
      const topicMidAngle = (topicStartAngle + topicEndAngle) / 2;

      positions.set(buildTopicNodeId(sector.subject.id, topic.label), {
        id: buildTopicNodeId(sector.subject.id, topic.label),
        x: cfg.centerX + adaptiveTopicRadius * Math.cos(topicMidAngle),
        y: cfg.centerY + adaptiveTopicRadius * Math.sin(topicMidAngle),
      });

      const difficulties = Array.from(topic.nodesByDifficulty.keys()).sort((a, b) => a - b);
      const minDiff = difficulties.length > 0 ? difficulties[0] : 1;
      const maxDiff = difficulties.length > 0 ? difficulties[difficulties.length - 1] : 1;
      const diffRange = Math.max(maxDiff - minDiff, 1);

      for (const difficulty of difficulties) {
        const ringNodes = topic.nodesByDifficulty.get(difficulty)!;
        const orderedNodes = buildPrerequisiteOrder(ringNodes, edges);
        const ring = adaptiveFirstConceptRing + (difficulty - 1) * adaptiveRingSpacing;
        const t = diffRange > 0 ? (difficulty - minDiff) / diffRange : 0;
        const taperFactor = 1 - t * 0.25;
        const topicSpan = (topicEndAngle - topicStartAngle) * taperFactor;
        const taperStart = topicMidAngle - topicSpan / 2;

        if (orderedNodes.length === 1) {
          positions.set(orderedNodes[0].id, {
            id: orderedNodes[0].id,
            x: cfg.centerX + ring * Math.cos(topicMidAngle),
            y: cfg.centerY + ring * Math.sin(topicMidAngle),
          });
          continue;
        }

        const padding = topicSpan * 0.1;
        const usableSpan = Math.max(topicSpan - 2 * padding, topicSpan * 0.5);
        const step = usableSpan / Math.max(orderedNodes.length - 1, 1);

        for (let index = 0; index < orderedNodes.length; index += 1) {
          const angle = taperStart + padding + step * index;
          positions.set(orderedNodes[index].id, {
            id: orderedNodes[index].id,
            x: cfg.centerX + ring * Math.cos(angle),
            y: cfg.centerY + ring * Math.sin(angle),
          });
        }
      }

      topicStartAngle = topicEndAngle + cfg.topicPadding;
    }
  }

  return { positions, sectors: exportedSectors, maxRadius };
}

// Varied orbital radii for subjects — mimics inner rocky planets vs outer gas giants.
// Cycles if there are more subjects than entries.
const SOLAR_ORBITAL_RADII = [1600, 2400, 3300, 4400, 2100, 3000, 3800, 1400, 2700];

// Golden angle (~137.5°) produces naturally skewed, non-uniform angular placement —
// the same pattern used by sunflowers and pine cones. No two planets share a quadrant.
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Solar System layout preset.
 *
 * Root = sun at center.
 * Subjects = planets at varied orbital radii, evenly distributed angularly.
 * Topics = moons evenly distributed 360° around their planet.
 * Concepts = asteroids in difficulty rings evenly distributed 360° around their moon.
 */
export function computeSolarLayout(
  nodes: KnowledgeNode[],
  _edges: Edge[],
  subjects: Subject[],
  config: Partial<RadialLayoutConfig> = {}
): RadialLayoutResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const positions = new Map<string, LayoutNode>();

  positions.set('__root__', { id: '__root__', x: cfg.centerX, y: cfg.centerY });

  const grouped = groupNodesBySubjectTopicAndDifficulty(nodes, subjects);

  const activeSubjects = subjects.filter((s) => {
    const topicMap = grouped.get(s.id);
    return topicMap && topicMap.size > 0;
  });

  if (activeSubjects.length === 0) {
    return { positions, sectors: [], maxRadius: 3000 };
  }

  // Count nodes per subject for ordering and adaptive scale
  const subjectNodeCounts = new Map<string, number>();
  let totalNodes = 0;
  for (const s of activeSubjects) {
    const topicMap = grouped.get(s.id)!;
    const count = Array.from(topicMap.values()).reduce((sum, t) => sum + t.totalCount, 0);
    subjectNodeCounts.set(s.id, count);
    totalNodes += count;
  }

  // Same gentle adaptive scale as the radial layout
  const scaleFactor = Math.max(1.0, Math.pow(totalNodes / 30, 0.35));

  // Fewer nodes = inner orbit (rocky planet), more nodes = outer orbit (gas giant)
  const sortedSubjects = [...activeSubjects].sort(
    (a, b) => (subjectNodeCounts.get(a.id) ?? 0) - (subjectNodeCounts.get(b.id) ?? 0)
  );

  let maxReach = 0;

  for (let i = 0; i < sortedSubjects.length; i++) {
    const subject = sortedSubjects[i];
    const orbitalRadius = SOLAR_ORBITAL_RADII[i % SOLAR_ORBITAL_RADII.length] * scaleFactor;
    // Golden angle gives organic, asymmetric placement — no cardinal clustering
    const subjectAngle = i * GOLDEN_ANGLE - Math.PI / 2;

    const sx = cfg.centerX + orbitalRadius * Math.cos(subjectAngle);
    const sy = cfg.centerY + orbitalRadius * Math.sin(subjectAngle);
    positions.set(`__subject_${subject.id}`, { id: `__subject_${subject.id}`, x: sx, y: sy });

    const topicMap = grouped.get(subject.id)!;
    const topics = Array.from(topicMap.values());
    const numTopics = topics.length;

    // Moon orbital radius: enough arc that topic nodes don't overlap
    const topicOrbitalRadius = Math.max(500, numTopics * 90) * scaleFactor;

    for (let j = 0; j < numTopics; j++) {
      const topic = topics[j];
      const topicAngle = (j / numTopics) * 2 * Math.PI - Math.PI / 2;
      const tx = sx + topicOrbitalRadius * Math.cos(topicAngle);
      const ty = sy + topicOrbitalRadius * Math.sin(topicAngle);
      positions.set(buildTopicNodeId(subject.id, topic.label), {
        id: buildTopicNodeId(subject.id, topic.label),
        x: tx,
        y: ty,
      });

      // Direction from planet to this moon — concepts fan outward along this axis
      const outwardAngle = Math.atan2(ty - sy, tx - sx);
      const arcSpan = Math.PI * (200 / 180); // 200° fan

      // Minimum center-to-center distance between adjacent concepts to prevent overlap
      const MIN_CONCEPT_GAP = 215;

      // Concept rings: one ring per difficulty, fanned outward from the planet
      const difficulties = Array.from(topic.nodesByDifficulty.keys()).sort((a, b) => a - b);
      const baseConceptRadius = Math.max(400, 70) * scaleFactor;
      const ringSpacing = 280 * scaleFactor;

      for (let di = 0; di < difficulties.length; di++) {
        const difficulty = difficulties[di];
        const ringNodes = topic.nodesByDifficulty.get(difficulty)!;
        const numInRing = ringNodes.length;

        // Expand the ring radius until adjacent concepts are at least MIN_CONCEPT_GAP apart.
        // Chord between two adjacent points on an arc: 2R·sin(halfStep)
        const halfStep = numInRing > 1 ? arcSpan / (2 * (numInRing - 1)) : 0;
        const minRadiusForSpacing = halfStep > 0
          ? MIN_CONCEPT_GAP / (2 * Math.sin(halfStep))
          : 0;
        const conceptRadius = Math.max(baseConceptRadius + di * ringSpacing, minRadiusForSpacing);

        for (let ci = 0; ci < numInRing; ci++) {
          const conceptAngle = numInRing === 1
            ? outwardAngle
            : outwardAngle - arcSpan / 2 + (ci / (numInRing - 1)) * arcSpan;
          positions.set(ringNodes[ci].id, {
            id: ringNodes[ci].id,
            x: tx + conceptRadius * Math.cos(conceptAngle),
            y: ty + conceptRadius * Math.sin(conceptAngle),
          });
        }

        maxReach = Math.max(maxReach, orbitalRadius + topicOrbitalRadius + conceptRadius);
      }

      if (difficulties.length === 0) {
        maxReach = Math.max(maxReach, orbitalRadius + topicOrbitalRadius);
      }
    }

    if (numTopics === 0) maxReach = Math.max(maxReach, orbitalRadius);
  }

  return { positions, sectors: [], maxRadius: Math.ceil(maxReach + 400) };
}

export function angleFromCenter(
  nodeX: number,
  nodeY: number,
  centerX: number = 0,
  centerY: number = 0
): number {
  return Math.atan2(nodeY - centerY, nodeX - centerX);
}

export function getRadialHandles(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): { sourceHandle: string; targetHandle: string } {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const angle = Math.atan2(dy, dx);

  let sourceDir: string;
  let targetDir: string;

  if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
    sourceDir = 'right';
    targetDir = 'left';
  } else if (angle >= Math.PI / 4 && angle < (3 * Math.PI) / 4) {
    sourceDir = 'bottom';
    targetDir = 'top';
  } else if (angle >= (-3 * Math.PI) / 4 && angle < -Math.PI / 4) {
    sourceDir = 'top';
    targetDir = 'bottom';
  } else {
    sourceDir = 'left';
    targetDir = 'right';
  }

  return {
    sourceHandle: `${sourceDir}-src`,
    targetHandle: `${targetDir}-tgt`,
  };
}
