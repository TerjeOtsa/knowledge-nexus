"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Layers3 } from 'lucide-react';

interface TopicNodeData {
  label: string;
  color: string;
  nodeCount: number;
  dimmed?: boolean;
  [key: string]: unknown;
}

function TopicNodeComponent({ data }: NodeProps & { data: TopicNodeData }) {
  const isDimmed = Boolean(data.dimmed);

  return (
    <div
      className="relative flex items-center justify-center w-53 h-53 rounded-4xl bg-slate-950"
      style={{
        opacity: isDimmed ? 0.24 : 1,
        filter: isDimmed ? 'saturate(0.7) brightness(0.76)' : 'none',
        transition: 'opacity 180ms ease, filter 180ms ease',
      }}
    >
      <div
        className="absolute w-53 h-53 rounded-4xl pointer-events-none"
        style={{
          boxShadow: `0 0 42px 14px ${data.color}33, 0 0 84px 28px ${data.color}14`,
        }}
      />

      <div
        className="relative w-53 h-53 rounded-4xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          background: `radial-gradient(circle at 30% 28%, ${data.color}30, ${data.color}14 48%, #101827 82%)`,
          borderColor: `${data.color}88`,
          boxShadow: `0 0 18px ${data.color}35, inset 0 0 28px ${data.color}22`,
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
          style={{
            backgroundColor: `${data.color}22`,
            border: `1px solid ${data.color}66`,
          }}
        >
          <Layers3 className="w-9 h-9" style={{ color: data.color }} />
        </div>
        <span className="px-3 text-[20px] font-semibold text-slate-50 text-center leading-tight tracking-wide">
          {data.label}
        </span>
        <span className="mt-2 text-[17px] text-slate-300">
          {data.nodeCount} concepts
        </span>
      </div>

      <Handle type="source" position={Position.Top} id="center-src" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, opacity: 0, border: 'none', background: 'transparent' }} />
      <Handle type="target" position={Position.Top} id="center-tgt" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, opacity: 0, border: 'none', background: 'transparent' }} />
    </div>
  );
}

export const TopicNode = memo(TopicNodeComponent);
