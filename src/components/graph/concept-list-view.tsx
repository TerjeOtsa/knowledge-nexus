"use client";

import React, { useMemo } from 'react';
import {
  ArrowRight,
  Clock3,
  Filter,
  Layers3,
  Lock,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useGraphStore } from '@/store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { estimateStudyMinutes, getNodeLearningMeta, getTopicKey, getTopicLabel } from '@/lib/learner-state';
import { getDifficultyLabel } from '@/lib/utils';

interface ConceptListViewProps {
  onNodeClick: (nodeId: string) => void;
}

function learningBadge(state: ReturnType<typeof getNodeLearningMeta>['learnerState']) {
  if (state === 'locked') return 'border-rose-200 bg-rose-100 text-rose-700';
  if (state === 'review') return 'border-amber-200 bg-amber-100 text-amber-800';
  if (state === 'mastered') return 'border-emerald-200 bg-emerald-100 text-emerald-700';
  if (state === 'in_progress') return 'border-orange-200 bg-orange-100 text-orange-800';
  return 'border-sky-200 bg-sky-100 text-sky-700';
}

function learningLabel(state: ReturnType<typeof getNodeLearningMeta>['learnerState']) {
  if (state === 'locked') return 'Locked';
  if (state === 'review') return 'Review Due';
  if (state === 'mastered') return 'Mastered';
  if (state === 'in_progress') return 'In Progress';
  return 'Ready';
}

export function ConceptListView({ onNodeClick }: ConceptListViewProps) {
  const {
    nodes,
    prerequisites,
    searchQuery,
    setSearchQuery,
    subjectFilter,
    setSubjectFilter,
    subjects,
    userProgress,
  } = useGraphStore();

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredNodes = useMemo(() => nodes
    .filter((node) => !subjectFilter || node.subject_id === subjectFilter)
    .filter((node) => {
      if (!normalizedQuery) return true;
      return (
        node.title.toLowerCase().includes(normalizedQuery) ||
        getTopicLabel(node.topic).toLowerCase().includes(normalizedQuery) ||
        node.description.toLowerCase().includes(normalizedQuery)
      );
    }), [nodes, normalizedQuery, subjectFilter]);

  const groupedTopics = useMemo(() => {
    const groups = new Map<string, { subjectId: string; subjectName: string; subjectColor: string; topic: string; nodeIds: string[] }>();

    for (const node of filteredNodes) {
      const subject = subjects.find((entry) => entry.id === node.subject_id);
      const topic = getTopicLabel(node.topic);
      const key = getTopicKey(node.subject_id, topic);

      if (!groups.has(key)) {
        groups.set(key, {
          subjectId: subject?.id || 'unassigned',
          subjectName: subject?.name || 'Unassigned',
          subjectColor: subject?.color || '#64748b',
          topic,
          nodeIds: [],
        });
      }

      groups.get(key)!.nodeIds.push(node.id);
    }

    return Array.from(groups.values()).sort((a, b) => {
      if (a.subjectName !== b.subjectName) return a.subjectName.localeCompare(b.subjectName);
      return a.topic.localeCompare(b.topic);
    });
  }, [filteredNodes, subjects]);

  const learnerBuckets = useMemo(() => {
    const reviewDue: Array<{ node: typeof filteredNodes[number]; meta: ReturnType<typeof getNodeLearningMeta> }> = [];
    const inProgress: Array<{ node: typeof filteredNodes[number]; meta: ReturnType<typeof getNodeLearningMeta> }> = [];
    const ready: Array<{ node: typeof filteredNodes[number]; meta: ReturnType<typeof getNodeLearningMeta> }> = [];

    for (const node of filteredNodes) {
      const meta = getNodeLearningMeta(node, prerequisites, userProgress);
      const enriched = { node, meta };

      if (meta.learnerState === 'review') reviewDue.push(enriched);
      else if (meta.learnerState === 'in_progress') inProgress.push(enriched);
      else if (meta.learnerState === 'ready') ready.push(enriched);
    }

    const byDifficulty = (a: typeof reviewDue[number], b: typeof reviewDue[number]) =>
      a.node.difficulty - b.node.difficulty || a.node.title.localeCompare(b.node.title);

    reviewDue.sort(byDifficulty);
    inProgress.sort(byDifficulty);
    ready.sort(byDifficulty);

    return { reviewDue, inProgress, ready };
  }, [filteredNodes, prerequisites, userProgress]);

  return (
    <ScrollArea className="h-full bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
        <Card className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_34%),white]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers3 className="h-5 w-5 text-sky-600" />
              Beginner-Friendly List View
            </CardTitle>
            <CardDescription>
              Browse by subject and topic, or jump straight to what is ready next.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={subjectFilter || 'all'} onValueChange={(value) => setSubjectFilter(value === 'all' ? null : value)}>
                <SelectTrigger className="border-0 bg-transparent px-0">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search concepts or topics"
                className="border-0 bg-transparent px-0 focus-visible:ring-0"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-3">
          {[
            { title: 'Continue Learning', icon: Clock3, items: learnerBuckets.inProgress, empty: 'No lessons are in progress yet.' },
            { title: 'Ready Next', icon: Sparkles, items: learnerBuckets.ready, empty: 'Nothing is ready yet. Clear prerequisites first.' },
            { title: 'Review Due', icon: RotateCcw, items: learnerBuckets.reviewDue, empty: 'No reviews are due right now.' },
          ].map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-slate-700" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.items.length === 0 ? (
                    <p className="text-sm text-slate-500">{section.empty}</p>
                  ) : (
                    section.items.slice(0, 5).map(({ node }) => (
                      <button
                        key={node.id}
                        onClick={() => onNodeClick(node.id)}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-white"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{node.title}</p>
                          <p className="text-xs text-slate-500">{getTopicLabel(node.topic)} • {estimateStudyMinutes(node.difficulty)} min</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          {groupedTopics.map((group) => {
            const groupNodes = filteredNodes
              .filter((node) => group.nodeIds.includes(node.id))
              .sort((a, b) => a.difficulty - b.difficulty || a.title.localeCompare(b.title));

            return (
              <Card key={`${group.subjectId}-${group.topic}`}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" style={{ borderColor: group.subjectColor, color: group.subjectColor }}>
                      {group.subjectName}
                    </Badge>
                    <Badge variant="secondary">{group.topic}</Badge>
                  </div>
                  <CardTitle className="mt-2">{group.topic}</CardTitle>
                  <CardDescription>{groupNodes.length} concept{groupNodes.length === 1 ? '' : 's'} in this topic.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {groupNodes.map((node) => {
                    const meta = getNodeLearningMeta(node, prerequisites, userProgress);
                    return (
                      <button
                        key={node.id}
                        onClick={() => onNodeClick(node.id)}
                        className={`flex w-full flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition-colors hover:bg-slate-50 md:flex-row md:items-center md:justify-between ${
                          meta.isLocked ? 'border-rose-200 bg-rose-50/60' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{node.title}</p>
                            <Badge className={learningBadge(meta.learnerState)}>
                              {meta.learnerState === 'locked' && <Lock className="mr-1 h-3 w-3" />}
                              {learningLabel(meta.learnerState)}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">{node.description}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                          <Badge variant="outline">{getDifficultyLabel(node.difficulty)}</Badge>
                          <Badge variant="secondary">{estimateStudyMinutes(node.difficulty)} min</Badge>
                          <Badge variant="outline">
                            {meta.masteredPrerequisiteIds.length}/{meta.prerequisiteIds.length} prereqs
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
