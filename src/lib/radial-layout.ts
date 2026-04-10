/**
 * Radial Tree Layout Engine for Knowledge Nexus
 *
 * Computes node positions in a radial tree:
 *   - Center: root "Knowledge Nexus" node
 *   - First ring: subjects (Math, Physics, etc.)
 *   - Outer rings: concept nodes ordered by difficulty
 *     (elementary near center → advanced at edges)
 *
 * Each subject gets an angular sector.
 * Within a sector, nodes are placed on concentric rings
 * based on difficulty level, with prerequisite-aware ordering.
 */

import type { KnowledgeNode, Edge, Subject } from '@/types';

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
}

/** Info about a subject's angular sector in the radial layout */
export interface SectorInfo {
  subjectId: string;
  subjectName: string;
  color: string;
  startAngle: number;
  endAngle: number;
  midAngle: number;
}

/** Result of the radial layout computation */
export interface RadialLayoutResult {
  positions: Map<string, LayoutNode>;
  sectors: SectorInfo[];
}

export interface RadialLayoutConfig {
  /** Radius for the subject ring */
  subjectRingRadius: number;
  /** Starting radius for difficulty=1 nodes */
  firstConceptRing: number;
  /** Additional radius per difficulty level */
  ringSpacing: number;
  /** Angular padding (radians) between sectors */
  sectorPadding: number;
  /** Center X coordinate */
  centerX: number;
  /** Center Y coordinate */
  centerY: number;
}

const DEFAULT_CONFIG: RadialLayoutConfig = {
  subjectRingRadius: 600,
  firstConceptRing: 950,
  ringSpacing: 400,
  sectorPadding: 0.25, // ~14 degrees gap between sectors
  centerX: 0,
  centerY: 0,
};

/**
 * Groups nodes by subject and then by difficulty within each subject.
 */
function groupNodesBySubjectAndDifficulty(
  nodes: KnowledgeNode[],
  subjects: Subject[]
): Map<string, Map<number, KnowledgeNode[]>> {
  const grouped = new Map<string, Map<number, KnowledgeNode[]>>();

  // Initialize groups for all subjects
  for (const subject of subjects) {
    grouped.set(subject.id, new Map());
  }

  // Also handle nodes without a subject
  grouped.set('__none__', new Map());

  for (const node of nodes) {
    const subjectId = node.subject_id || '__none__';
    if (!grouped.has(subjectId)) {
      grouped.set(subjectId, new Map());
    }
    const subjectGroup = grouped.get(subjectId)!;
    if (!subjectGroup.has(node.difficulty)) {
      subjectGroup.set(node.difficulty, []);
    }
    subjectGroup.get(node.difficulty)!.push(node);
  }

  return grouped;
}

/**
 * Builds a simple prerequisite adjacency: for a given node,
 * which nodes come before it? We use this to order nodes within
 * the same difficulty ring so prerequisites come first angularly.
 */
function buildPrerequisiteOrder(
  nodesInRing: KnowledgeNode[],
  edges: Edge[]
): KnowledgeNode[] {
  if (nodesInRing.length <= 1) return nodesInRing;

  const nodeIds = new Set(nodesInRing.map((n) => n.id));

  // Build in-degree map based on "leads_to" and "requires" edges
  // within this same ring
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  for (const n of nodesInRing) {
    inDegree.set(n.id, 0);
    adjList.set(n.id, []);
  }

  for (const edge of edges) {
    if (
      nodeIds.has(edge.source_node_id) &&
      nodeIds.has(edge.target_node_id) &&
      (edge.relationship_type === 'leads_to' || edge.relationship_type === 'requires')
    ) {
      adjList.get(edge.source_node_id)!.push(edge.target_node_id);
      inDegree.set(edge.target_node_id, (inDegree.get(edge.target_node_id) || 0) + 1);
    }
  }

  // Topological sort (Kahn's algorithm)
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjList.get(current) || []) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Add any remaining (cycle protection)
  const sortedSet = new Set(sorted);
  for (const n of nodesInRing) {
    if (!sortedSet.has(n.id)) {
      sorted.push(n.id);
    }
  }

  const nodeMap = new Map(nodesInRing.map((n) => [n.id, n]));
  return sorted.map((id) => nodeMap.get(id)!);
}

/**
 * Main layout function:
 * Returns a Map<nodeId, {x, y}> for all nodes + subject nodes + root node.
 */
export function computeRadialLayout(
  nodes: KnowledgeNode[],
  edges: Edge[],
  subjects: Subject[],
  config: Partial<RadialLayoutConfig> = {}
): RadialLayoutResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const positions = new Map<string, LayoutNode>();

  // 1. Root node at center
  positions.set('__root__', {
    id: '__root__',
    x: cfg.centerX,
    y: cfg.centerY,
  });

  const grouped = groupNodesBySubjectAndDifficulty(nodes, subjects);

  // Filter to subjects that actually have nodes
  const activeSubjects = subjects.filter((s) => {
    const group = grouped.get(s.id);
    return group && group.size > 0;
  });

  if (activeSubjects.length === 0) return { positions, sectors: [] };

  // 2. Divide the circle into sectors for each subject
  const totalPadding = cfg.sectorPadding * activeSubjects.length;
  const availableAngle = 2 * Math.PI - totalPadding;

  // Count total nodes per subject to allocate proportional angular space
  const nodeCounts = new Map<string, number>();
  let totalNodes = 0;
  for (const subject of activeSubjects) {
    const group = grouped.get(subject.id)!;
    let count = 0;
    for (const [, ringNodes] of group) {
      count += ringNodes.length;
    }
    nodeCounts.set(subject.id, count);
    totalNodes += count;
  }

  // Build sector assignments
  interface InternalSector {
    subject: Subject;
    startAngle: number;
    endAngle: number;
    midAngle: number;
  }

  const internalSectors: InternalSector[] = [];
  const exportedSectors: SectorInfo[] = [];
  let currentAngle = -Math.PI / 2; // Start from top

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

    // 3. Place subject label node on the subject ring
    positions.set(`__subject_${subject.id}`, {
      id: `__subject_${subject.id}`,
      x: cfg.centerX + cfg.subjectRingRadius * Math.cos(midAngle),
      y: cfg.centerY + cfg.subjectRingRadius * Math.sin(midAngle),
    });

    currentAngle = endAngle + cfg.sectorPadding;
  }

  // 4. Place concept nodes within each sector
  // As difficulty increases (outer rings), narrow the angular spread
  // toward the sector midline — this creates a "flower petal" shape
  // where nodes bloom outward rather than spreading flat along an arc.
  for (const sector of internalSectors) {
    const subjectGroup = grouped.get(sector.subject.id);
    if (!subjectGroup) continue;

    // Get all difficulty levels sorted
    const difficulties = Array.from(subjectGroup.keys()).sort((a, b) => a - b);
    const maxDiff = difficulties.length > 0 ? difficulties[difficulties.length - 1] : 1;
    const minDiff = difficulties.length > 0 ? difficulties[0] : 1;
    const diffRange = Math.max(maxDiff - minDiff, 1);

    for (const difficulty of difficulties) {
      const ringNodes = subjectGroup.get(difficulty)!;
      const ordered = buildPrerequisiteOrder(ringNodes, edges);

      // Radius for this difficulty ring
      const ring = cfg.firstConceptRing + (difficulty - 1) * cfg.ringSpacing;

      // Taper the angular span: inner rings use full sector width,
      // outer rings converge toward the midline.
      // t=0 at lowest difficulty (full width), t=1 at highest (narrowest)
      const t = diffRange > 0 ? (difficulty - minDiff) / diffRange : 0;
      const taperFactor = 1 - t * 0.45; // outer rings use ~55% of sector width
      const sectorSpan = (sector.endAngle - sector.startAngle) * taperFactor;
      const sectorCenter = sector.midAngle;
      const taperStart = sectorCenter - sectorSpan / 2;

      if (ordered.length === 1) {
        // Single node → place at sector midpoint
        const angle = sectorCenter;
        positions.set(ordered[0].id, {
          id: ordered[0].id,
          x: cfg.centerX + ring * Math.cos(angle),
          y: cfg.centerY + ring * Math.sin(angle),
        });
      } else {
        // Multiple nodes → spread evenly within tapered sector
        const padding = sectorSpan * 0.08;
        const usableSpan = sectorSpan - 2 * padding;
        const step = usableSpan / (ordered.length - 1);

        for (let i = 0; i < ordered.length; i++) {
          const angle = taperStart + padding + step * i;
          positions.set(ordered[i].id, {
            id: ordered[i].id,
            x: cfg.centerX + ring * Math.cos(angle),
            y: cfg.centerY + ring * Math.sin(angle),
          });
        }
      }
    }
  }

  return { positions, sectors: exportedSectors };
}

/**
 * Utility: compute the angle from center to a point.
 * Used to determine optimal handle/edge direction.
 */
export function angleFromCenter(
  nodeX: number,
  nodeY: number,
  centerX: number = 0,
  centerY: number = 0
): number {
  return Math.atan2(nodeY - centerY, nodeX - centerX);
}

/**
 * Determine source/target handle ids based on relative positions
 * for cleaner edge routing in radial layout.
 * Handles use "-src"/"-tgt" suffixes so every direction supports both types.
 */
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

  return { sourceHandle: `${sourceDir}-src`, targetHandle: `${targetDir}-tgt` };
}
