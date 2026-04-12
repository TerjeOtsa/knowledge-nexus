"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Brain } from 'lucide-react';

interface RootNodeData {
  label: string;
  dimmed?: boolean;
  [key: string]: unknown;
}

function RootNodeComponent({ data, selected }: NodeProps & { data: RootNodeData }) {
  const isDimmed = Boolean(data.dimmed);

  return (
    <div
      className="relative flex items-center justify-center w-82.5 h-82.5"
      style={{
        opacity: isDimmed ? 0.28 : 1,
        filter: isDimmed ? 'saturate(0.65) brightness(0.72)' : 'none',
        transition: 'opacity 180ms ease, filter 180ms ease',
      }}
    >
      <div
        className="absolute w-82.5 h-82.5 rounded-full pointer-events-none"
        style={{
          boxShadow: '0 0 96px 36px rgba(168, 85, 247, 0.45), 0 0 180px 72px rgba(99, 102, 241, 0.22)',
        }}
      />

      <div
        className="absolute w-90 h-90 rounded-full border-2 border-purple-400/20 animate-spin pointer-events-none"
        style={{ animationDuration: '20s' }}
      />
      <div
        className="absolute w-97.5 h-97.5 rounded-full border border-indigo-400/10 animate-spin pointer-events-none"
        style={{ animationDuration: '30s', animationDirection: 'reverse' }}
      />

      <div
        className="absolute w-82.5 h-82.5 rounded-full animate-ping pointer-events-none"
        style={{
          backgroundColor: 'rgba(168, 85, 247, 0.16)',
          animationDuration: '4s',
        }}
      />

      <div
        className={`
          relative w-82.5 h-82.5 rounded-full
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-300
          ${selected ? 'scale-110' : 'hover:scale-105'}
        `}
        style={{
          background: 'radial-gradient(ellipse at 35% 35%, rgba(168, 85, 247, 0.38), rgba(99, 102, 241, 0.24) 42%, #10182a 76%)',
          border: '4px solid rgba(168, 85, 247, 0.82)',
          boxShadow: selected
            ? '0 0 62px 24px rgba(168, 85, 247, 0.62), inset 0 0 46px rgba(168, 85, 247, 0.3)'
            : '0 0 28px rgba(168, 85, 247, 0.24), inset 0 0 54px rgba(168, 85, 247, 0.22)',
        }}
      >
        <Brain className="w-16 h-16 text-fuchsia-100" style={{ filter: 'drop-shadow(0 0 16px rgba(168, 85, 247, 0.8))' }} />
        <span
          className="text-lg font-bold text-white tracking-wider text-center leading-tight mt-2"
          style={{ textShadow: '0 0 18px rgba(168, 85, 247, 0.7)' }}
        >
          Knowledge<br />Nexus
        </span>
      </div>

      <Handle type="source" position={Position.Top} id="top-src" className="w-1! h-1! bg-transparent! border-0! opacity-0!" />
      <Handle type="target" position={Position.Top} id="top-tgt" className="w-1! h-1! bg-transparent! border-0! opacity-0!" />
      <Handle type="source" position={Position.Bottom} id="bottom-src" className="w-1! h-1! bg-transparent! border-0! opacity-0!" />
      <Handle type="target" position={Position.Bottom} id="bottom-tgt" className="w-1! h-1! bg-transparent! border-0! opacity-0!" />
      <Handle type="source" position={Position.Left} id="left-src" className="w-1! h-1! bg-transparent! border-0! opacity-0!" />
      <Handle type="target" position={Position.Left} id="left-tgt" className="w-1! h-1! bg-transparent! border-0! opacity-0!" />
      <Handle type="source" position={Position.Right} id="right-src" className="w-1! h-1! bg-transparent! border-0! opacity-0!" />
      <Handle type="target" position={Position.Right} id="right-tgt" className="w-1! h-1! bg-transparent! border-0! opacity-0!" />
    </div>
  );
}

export const RootNode = memo(RootNodeComponent);
