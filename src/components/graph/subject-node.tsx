"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface SubjectNodeData {
  label: string;
  color: string;
  icon?: string;
  nodeCount: number;
  [key: string]: unknown;
}

/**
 * PoE-style Subject node — a major cluster hub, like a class starting area.
 * Dark orb with pulsing subject-color aura.
 */
function SubjectNodeComponent({ data }: NodeProps & { data: SubjectNodeData }) {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer glow */}
      <div
        className="absolute w-64 h-64 rounded-full pointer-events-none"
        style={{
          boxShadow: `0 0 50px 20px ${data.color}44, 0 0 100px 40px ${data.color}1a`,
        }}
      />

      {/* Slow pulse */}
      <div
        className="absolute w-64 h-64 rounded-full animate-pulse pointer-events-none"
        style={{
          backgroundColor: `${data.color}15`,
          animationDuration: '3s',
        }}
      />

      {/* Main body */}
      <div
        className="relative w-64 h-64 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          background: `radial-gradient(ellipse at 35% 35%, ${data.color}30, ${data.color}10 50%, #0a0e1a 80%)`,
          border: `3.5px solid ${data.color}88`,
          boxShadow: `inset 0 0 40px ${data.color}20`,
        }}
      >
        <span className="text-5xl" style={{ filter: `drop-shadow(0 0 10px ${data.color})` }}>
          {data.icon || '📚'}
        </span>
        <span
          className="text-[15px] font-bold mt-1 text-center leading-tight tracking-wide"
          style={{ color: data.color, textShadow: `0 0 12px ${data.color}66` }}
        >
          {data.label}
        </span>
        <span className="text-[12px] mt-1" style={{ color: `${data.color}99` }}>
          {data.nodeCount} topics
        </span>
      </div>

      {/* Handles */}
      <Handle type="source" position={Position.Top} id="top-src" className="w-1! h-1! border-0! opacity-0!" style={{ backgroundColor: data.color }} />
      <Handle type="target" position={Position.Top} id="top-tgt" className="w-1! h-1! border-0! opacity-0!" style={{ backgroundColor: data.color }} />
      <Handle type="source" position={Position.Bottom} id="bottom-src" className="w-1! h-1! border-0! opacity-0!" style={{ backgroundColor: data.color }} />
      <Handle type="target" position={Position.Bottom} id="bottom-tgt" className="w-1! h-1! border-0! opacity-0!" style={{ backgroundColor: data.color }} />
      <Handle type="source" position={Position.Left} id="left-src" className="w-1! h-1! border-0! opacity-0!" style={{ backgroundColor: data.color }} />
      <Handle type="target" position={Position.Left} id="left-tgt" className="w-1! h-1! border-0! opacity-0!" style={{ backgroundColor: data.color }} />
      <Handle type="source" position={Position.Right} id="right-src" className="w-1! h-1! border-0! opacity-0!" style={{ backgroundColor: data.color }} />
      <Handle type="target" position={Position.Right} id="right-tgt" className="w-1! h-1! border-0! opacity-0!" style={{ backgroundColor: data.color }} />
    </div>
  );
}

export const SubjectNode = memo(SubjectNodeComponent);
