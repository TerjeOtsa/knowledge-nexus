"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeStatus, Subject, KnowledgeNode } from '@/types';
import { getNodeStatusColor, getDifficultyLabel } from '@/lib/utils';
import { BookOpen, CheckCircle, Circle, Lock } from 'lucide-react';

interface ConceptNodeData {
  label: string;
  subject?: Subject;
  status: NodeStatus;
  difficulty: number;
  topic?: string;
  nodeData: KnowledgeNode;
  [key: string]: unknown;
}

/**
 * Custom React Flow node for knowledge concepts.
 * Color-coded by mastery status.
 */
function ConceptNodeComponent({ data, selected }: NodeProps & { data: ConceptNodeData }) {
  const statusColor = getNodeStatusColor(data.status);
  const subjectColor = data.subject?.color || '#6b7280';

  const StatusIcon = () => {
    switch (data.status) {
      case 'mastered':
        return <CheckCircle className="w-3.5 h-3.5 text-white" />;
      case 'in_progress':
        return <BookOpen className="w-3.5 h-3.5 text-white" />;
      default:
        return <Circle className="w-3.5 h-3.5 text-white/70" />;
    }
  };

  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl shadow-md border-2 transition-all duration-200
        min-w-[140px] max-w-[200px] cursor-pointer
        ${selected ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : 'hover:shadow-lg hover:scale-[1.02]'}
      `}
      style={{
        backgroundColor: statusColor,
        borderColor: selected ? '#3b82f6' : statusColor,
      }}
    >
      {/* Subject indicator strip */}
      <div
        className="absolute top-0 left-3 right-3 h-1 rounded-b-full"
        style={{ backgroundColor: subjectColor }}
      />

      {/* Node content */}
      <div className="flex items-start gap-2 mt-1">
        <StatusIcon />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white leading-tight truncate">
            {data.label}
          </h3>
          {data.topic && (
            <p className="text-[10px] text-white/70 mt-0.5 truncate">{data.topic}</p>
          )}
        </div>
      </div>

      {/* Difficulty dots */}
      <div className="flex items-center gap-0.5 mt-1.5" title={getDifficultyLabel(data.difficulty)}>
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`w-1.5 h-1.5 rounded-full ${
              level <= data.difficulty ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-white/50 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-white/50 !border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-white/50 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-white/50 !border-white"
      />
    </div>
  );
}

export const ConceptNode = memo(ConceptNodeComponent);
