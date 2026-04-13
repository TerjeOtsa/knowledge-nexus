"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface SubjectNodeData {
  label: string;
  color: string;
  icon?: string;
  nodeCount: number;
  dimmed?: boolean;
  solar?: boolean;
  orbitPeriod?: number;
  [key: string]: unknown;
}

function SubjectNodeComponent({ data }: NodeProps & { data: SubjectNodeData }) {
  const isDimmed = Boolean(data.dimmed);

  return (
    <div
      className="relative flex items-center justify-center w-77 h-77 rounded-full bg-slate-950"
      style={{
        opacity: isDimmed ? 0.28 : 1,
        filter: isDimmed ? 'saturate(0.65) brightness(0.72)' : 'none',
        transition: 'opacity 180ms ease, filter 180ms ease',
      }}
    >
      <div
        className="absolute w-77 h-77 rounded-full pointer-events-none"
        style={{
          boxShadow: `0 0 64px 24px ${data.color}66, 0 0 128px 52px ${data.color}26`,
        }}
      />

      {data.solar && (
        <>
          <div
            className="absolute rounded-full border border-white/25 animate-spin pointer-events-none"
            style={{
              width: '370px',
              height: '370px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animationDuration: `${data.orbitPeriod ?? 18}s`,
            }}
          />
          <div
            className="absolute rounded-full border border-white/12 animate-spin pointer-events-none"
            style={{
              width: '450px',
              height: '450px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animationDuration: `${(data.orbitPeriod ?? 18) * 1.5}s`,
              animationDirection: 'reverse',
            }}
          />
        </>
      )}

      <div
        className="absolute w-77 h-77 rounded-full animate-pulse pointer-events-none"
        style={{
          backgroundColor: `${data.color}24`,
          animationDuration: '3s',
        }}
      />

      <div
        className="relative w-77 h-77 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          background: `radial-gradient(ellipse at 35% 35%, ${data.color}52, ${data.color}24 48%, #10182a 78%)`,
          border: `3.5px solid ${data.color}bb`,
          boxShadow: `0 0 24px ${data.color}55, inset 0 0 46px ${data.color}35`,
        }}
      >
        <span className="text-7xl" style={{ filter: `drop-shadow(0 0 14px ${data.color}) brightness(1.08)` }}>
          {data.icon || '📚'}
        </span>
        <span
          className="text-[23px] font-bold mt-1 text-center leading-tight tracking-wide"
          style={{ color: '#f8fafc', textShadow: `0 0 16px ${data.color}aa` }}
        >
          {data.label}
        </span>
        <span className="text-[18px] mt-1" style={{ color: '#e2e8f0' }}>
          {data.nodeCount} topics
        </span>
      </div>

      <Handle type="source" position={Position.Top} id="center-src" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, opacity: 0, border: 'none', background: 'transparent' }} />
      <Handle type="target" position={Position.Top} id="center-tgt" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, opacity: 0, border: 'none', background: 'transparent' }} />
    </div>
  );
}

export const SubjectNode = memo(SubjectNodeComponent);
