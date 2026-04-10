"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Brain } from 'lucide-react';

interface RootNodeData {
  label: string;
  [key: string]: unknown;
}

/**
 * PoE Keystone-style root node — the center of the passive tree.
 * Dark core with dramatic multi-color glow.
 */
function RootNodeComponent({ selected }: NodeProps & { data: RootNodeData }) {
  return (
    <div className="relative flex items-center justify-center w-82.5 h-82.5">
      {/* Outermost glow ring */}
      <div
        className="absolute w-82.5 h-82.5 rounded-full pointer-events-none"
        style={{
          boxShadow: '0 0 80px 30px rgba(168, 85, 247, 0.3), 0 0 160px 60px rgba(99, 102, 241, 0.15)',
        }}
      />

      {/* Slow rotating ring effect */}
      <div
        className="absolute w-90 h-90 rounded-full border-2 border-purple-400/20 animate-spin pointer-events-none"
        style={{ animationDuration: '20s' }}
      />
      <div
        className="absolute w-97.5 h-97.5 rounded-full border border-indigo-400/10 animate-spin pointer-events-none"
        style={{ animationDuration: '30s', animationDirection: 'reverse' }}
      />

      {/* Pulse ring */}
      <div
        className="absolute w-82.5 h-82.5 rounded-full animate-ping pointer-events-none"
        style={{
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          animationDuration: '4s',
        }}
      />

      {/* Main body */}
      <div
        className={`
          relative w-82.5 h-82.5 rounded-full
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-300
          ${selected ? 'scale-110' : 'hover:scale-105'}
        `}
        style={{
          background: 'radial-gradient(ellipse at 35% 35%, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.15) 40%, #0a0e1a 75%)',
          border: '4px solid rgba(168, 85, 247, 0.6)',
          boxShadow: selected
            ? '0 0 50px 20px rgba(168, 85, 247, 0.5), inset 0 0 40px rgba(168, 85, 247, 0.2)'
            : 'inset 0 0 50px rgba(168, 85, 247, 0.15)',
        }}
      >
        <Brain className="w-16 h-16 text-purple-300" style={{ filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.6))' }} />
        <span
          className="text-lg font-bold text-purple-200 tracking-wider text-center leading-tight mt-2"
          style={{ textShadow: '0 0 14px rgba(168, 85, 247, 0.5)' }}
        >
          Knowledge<br />Nexus
        </span>
      </div>

      {/* Handles in all directions for radial connections */}
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
