"use client";

import React, { useEffect, useState } from 'react';
import { useGraphStore, useTestStore, useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X, BookOpen, CheckCircle, PlayCircle, Plus, Link2, Edit,
  ArrowRight, ArrowLeft, Lightbulb, Target, Layers, AlertCircle
} from 'lucide-react';
import { getRelationshipLabel, getDifficultyLabel, formatDate } from '@/lib/utils';
import type { MasteryTest, KnowledgeNode, Edge as KEdge } from '@/types';

interface NodeDetailPanelProps {
  nodeId: string;
  onClose: () => void;
  onStartTest: (nodeId: string) => void;
  onAddConnectedNode: (nodeId: string) => void;
  onLinkExistingNode: (nodeId: string) => void;
  onEditNode: (nodeId: string) => void;
}

interface NodeDetails {
  node: KnowledgeNode;
  outgoingEdges: Array<KEdge & { target_node?: { id: string; title: string; slug: string } }>;
  incomingEdges: Array<KEdge & { source_node?: { id: string; title: string; slug: string } }>;
  prerequisites: Array<{ prerequisite_node?: { id: string; title: string; slug: string } }>;
  dependents: Array<{ dependent_node?: { id: string; title: string; slug: string } }>;
  masteryTest: MasteryTest | null;
}

export function NodeDetailPanel({
  nodeId,
  onClose,
  onStartTest,
  onAddConnectedNode,
  onLinkExistingNode,
  onEditNode,
}: NodeDetailPanelProps) {
  const { userProgress, graphMode, setSelectedNodeId } = useGraphStore();
  const { user } = useAuthStore();
  const [details, setDetails] = useState<NodeDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNodeDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/nodes/${nodeId}`);
        if (res.ok) {
          const data = await res.json();
          setDetails(data);
        }
      } catch (error) {
        console.error('Failed to fetch node details:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNodeDetails();
  }, [nodeId]);

  if (loading) {
    return (
      <div className="w-[420px] h-full bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!details?.node) {
    return (
      <div className="w-[420px] h-full bg-white border-l border-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Node not found</p>
      </div>
    );
  }

  const { node, outgoingEdges, incomingEdges, prerequisites, dependents, masteryTest } = details;
  const progress = userProgress[nodeId];
  const status = progress?.status || 'untouched';
  const isMastered = status === 'mastered';

  const statusConfig = {
    untouched: { label: 'Not Started', color: 'bg-blue-100 text-blue-800', icon: BookOpen },
    in_progress: { label: 'In Progress', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    mastered: { label: 'Mastered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div
      className={`w-[420px] h-full border-l flex flex-col shadow-xl ${isMastered ? 'border-emerald-200' : 'border-gray-200'}`}
      style={{
        background: isMastered
          ? 'linear-gradient(180deg, #ecfdf5 0%, #ffffff 20%, #f0fdf4 100%)'
          : '#ffffff',
      }}
    >
      {/* Header */}
      <div className={`flex items-start justify-between p-5 border-b ${isMastered ? 'border-emerald-200 bg-emerald-50/80' : 'border-gray-100'}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {node.subject && (
              <Badge
                variant="outline"
                style={{ borderColor: node.subject.color, color: node.subject.color }}
              >
                {node.subject.name}
              </Badge>
            )}
            <Badge variant="secondary">{getDifficultyLabel(node.difficulty)}</Badge>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-2">{node.title}</h2>
          {node.topic && <p className="text-sm text-gray-500 mt-0.5">{node.topic}</p>}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          {/* Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusConfig[status].color}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{statusConfig[status].label}</span>
            {progress?.latest_score !== undefined && progress?.latest_score !== null && (
              <span className="ml-auto text-sm">Last score: {progress.latest_score}%</span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Description
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{node.description}</p>
          </div>

          {/* Why it Matters */}
          {node.why_it_matters && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" /> Why It Matters
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{node.why_it_matters}</p>
            </div>
          )}

          {/* Use Cases */}
          {node.use_cases && node.use_cases.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Use Cases
              </h3>
              <ul className="space-y-1.5">
                {node.use_cases.map((uc, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {uc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {prerequisites.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Prerequisites
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {prerequisites.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (p.prerequisite_node?.id) {
                        setSelectedNodeId(p.prerequisite_node.id);
                      }
                    }}
                    className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {p.prerequisite_node?.title || 'Unknown'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Connected Concepts */}
          {(outgoingEdges.length > 0 || incomingEdges.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Connections
              </h3>
              <div className="space-y-1.5">
                {outgoingEdges.map((edge) => (
                  <button
                    key={edge.id}
                    onClick={() => {
                      if (edge.target_node?.id) {
                        setSelectedNodeId(edge.target_node.id);
                      }
                    }}
                    className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-medium">{edge.target_node?.title}</span>
                    <span className="text-xs text-blue-500 ml-auto">
                      {getRelationshipLabel(edge.relationship_type)}
                    </span>
                  </button>
                ))}
                {incomingEdges.map((edge) => (
                  <button
                    key={edge.id}
                    onClick={() => {
                      if (edge.source_node?.id) {
                        setSelectedNodeId(edge.source_node.id);
                      }
                    }}
                    className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span className="font-medium">{edge.source_node?.title}</span>
                    <span className="text-xs text-purple-500 ml-auto">
                      {getRelationshipLabel(edge.relationship_type)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mastery Test Info */}
          {masteryTest && (
            <div className={isMastered ? 'bg-emerald-50 border border-emerald-200 rounded-lg p-3' : 'bg-gray-50 rounded-lg p-3'}>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Mastery Test</h3>
              <p className="text-xs text-gray-500 mb-2">
                {masteryTest.questions?.length || 0} questions · Pass: {masteryTest.passing_score}%
              </p>
              {progress?.attempt_count ? (
                <p className="text-xs text-gray-500">
                  Attempts: {progress.attempt_count} · Best: {progress.latest_score}%
                </p>
              ) : null}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="border-t border-gray-100 p-4 space-y-2">
        {/* Primary actions */}
        <div className="flex gap-2">
          {masteryTest && status !== 'mastered' && (
            <Button className="flex-1" onClick={() => onStartTest(nodeId)}>
              <PlayCircle className="w-4 h-4 mr-1.5" />
              Take Mastery Test
            </Button>
          )}
          {status === 'mastered' && masteryTest && (
            <Button variant="success" className="flex-1" onClick={() => onStartTest(nodeId)}>
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Retake Test
            </Button>
          )}
          {!masteryTest && (
            <Button variant="secondary" className="flex-1" disabled>
              No test available
            </Button>
          )}
        </div>

        {/* Build actions */}
        {(graphMode === 'edit' || user?.role === 'admin' || user?.role === 'editor') && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onAddConnectedNode(nodeId)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Connected
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onLinkExistingNode(nodeId)}>
              <Link2 className="w-3.5 h-3.5 mr-1" /> Link Existing
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEditNode(nodeId)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
