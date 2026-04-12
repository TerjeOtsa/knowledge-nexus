"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface SubjectNodeData {
  label: string;
  color: string;
  icon?: string;
  nodeCount: number;
  dimmed?: boolean;
  [key: string]: unknown;
}

function SubjectNodeComponent({ data }: NodeProps & { data: SubjectNodeData }) {
  const isDimmed = Boolean(data.dimmed);

  return (
    <div
      className="relative flex items-center justify-center w-64 h-64"
      style={{
        opacity: isDimmed ? 0.28 : 1,
        filter: isDimmed ? 'saturate(0.65) brightness(0.72)' : 'none',
        transition: 'opacity 180ms ease, filter 180ms ease',
      }}
    >
      <div
        className="absolute w-64 h-64 rounded-full pointer-events-none"
        style={{
          boxShadow: `0 0 64px 24px ${data.color}66, 0 0 128px 52px ${data.color}26`,
        }}
      />

      <div
        className="absolute w-64 h-64 rounded-full animate-pulse pointer-events-none"
        style={{
          backgroundColor: `${data.color}24`,
          animationDuration: '3s',
        }}
      />

      <div
        className="relative w-64 h-64 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          background: `radial-gradient(ellipse at 35% 35%, ${data.color}52, ${data.color}24 48%, #10182a 78%)`,
          border: `3.5px solid ${data.color}bb`,
          boxShadow: `0 0 24px ${data.color}55, inset 0 0 46px ${data.color}35`,
        }}
      >
        <span className="text-5xl" style={{ filter: `drop-shadow(0 0 14px ${data.color}) brightness(1.08)` }}>
          {data.icon || '📚'}
        </span>
        <span
          className="text-[15px] font-bold mt-1 text-center leading-tight tracking-wide"
          style={{ color: '#f8fafc', textShadow: `0 0 16px ${data.color}aa` }}
        >
          {data.label}
        </span>
        <span className="text-[12px] mt-1" style={{ color: '#e2e8f0' }}>
          {data.nodeCount} topics
        </span>
      </div>

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
