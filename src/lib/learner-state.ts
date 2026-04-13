import type { KnowledgeNode, NodeStatus, Prerequisite, UserNodeProgress } from '@/types';

export type LearnerState = 'locked' | 'ready' | 'in_progress' | 'mastered' | 'review';

export interface NodeLearningMeta {
  status: NodeStatus;
  learnerState: LearnerState;
  prerequisiteIds: string[];
  masteredPrerequisiteIds: string[];
  missingPrerequisiteIds: string[];
  isLocked: boolean;
  isReady: boolean;
  isReviewDue: boolean;
  nextReviewAt: string | null;
}

export function getTopicLabel(topic?: string | null): string {
  const normalized = topic?.trim();
  return normalized && normalized.length > 0 ? normalized : 'General';
}

export function getTopicKey(subjectId?: string | null, topic?: string | null): string {
  return `${subjectId || 'unassigned'}::${getTopicLabel(topic).toLowerCase()}`;
}

export function estimateStudyMinutes(difficulty: number): number {
  return 8 + difficulty * 5;
}

export function getReviewIntervalDays(progress: UserNodeProgress): number {
  const latestScore = progress.latest_score ?? 70;

  if (latestScore >= 95) return 10;
  if (latestScore >= 85) return 7;
  if (latestScore >= 75) return 5;
  return 3;
}

export function getNextReviewAt(progress?: UserNodeProgress | null): string | null {
  if (!progress?.mastered_at) {
    return null;
  }

  const reviewDate = new Date(progress.mastered_at);
  reviewDate.setDate(reviewDate.getDate() + getReviewIntervalDays(progress));
  return reviewDate.toISOString();
}

export function getNodeLearningMeta(
  node: KnowledgeNode,
  prerequisites: Pick<Prerequisite, 'node_id' | 'prerequisite_node_id'>[],
  userProgress: Record<string, UserNodeProgress>,
  now: Date = new Date()
): NodeLearningMeta {
  const progress = userProgress[node.id];
  const status = progress?.status || 'untouched';
  const prerequisiteIds = prerequisites
    .filter((prerequisite) => prerequisite.node_id === node.id)
    .map((prerequisite) => prerequisite.prerequisite_node_id);

  const masteredPrerequisiteIds = prerequisiteIds.filter(
    (prerequisiteId) => userProgress[prerequisiteId]?.status === 'mastered'
  );
  const missingPrerequisiteIds = prerequisiteIds.filter(
    (prerequisiteId) => userProgress[prerequisiteId]?.status !== 'mastered'
  );

  const isLocked = status !== 'mastered' && missingPrerequisiteIds.length > 0;
  const nextReviewAt = getNextReviewAt(progress);
  const isReviewDue = Boolean(
    status === 'mastered' &&
    nextReviewAt &&
    new Date(nextReviewAt).getTime() <= now.getTime()
  );

  let learnerState: LearnerState;
  if (isReviewDue) {
    learnerState = 'review';
  } else if (status === 'mastered') {
    learnerState = 'mastered';
  } else if (isLocked) {
    learnerState = 'locked';
  } else if (status === 'in_progress') {
    learnerState = 'in_progress';
  } else {
    learnerState = 'ready';
  }

  return {
    status,
    learnerState,
    prerequisiteIds,
    masteredPrerequisiteIds,
    missingPrerequisiteIds,
    isLocked,
    isReady: learnerState === 'ready',
    isReviewDue,
    nextReviewAt,
  };
}
