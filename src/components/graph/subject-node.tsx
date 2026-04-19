"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  DEFAULT_GRAPH_DESIGN_SETTINGS,
  alphaHex,
  getGraphTheme,
  getStructureNodeSize,
  resolveGraphAccent,
  type GraphDesignSettings,
} from './design-settings';

interface SubjectNodeData {
  label: string;
  color: string;
  icon?: string;
  nodeCount: number;
  dimmed?: boolean;
  solar?: boolean;
  orbitPeriod?: number;
  design?: GraphDesignSettings;
  [key: string]: unknown;
}

function SubjectNodeComponent({ data }: NodeProps & { data: SubjectNodeData }) {
  const design = data.design ?? DEFAULT_GRAPH_DESIGN_SETTINGS;
  const theme = getGraphTheme(design.themeId);
  const accentColor = resolveGraphAccent(data.color, theme);
  const glowMultiplier = design.glowStrength * theme.glowBase;
  const glowEnabled = glowMultiplier > 0.03;
  const size = getStructureNodeSize('subject', design);
  const orbitInner = 370 * design.structureScale;
  const orbitOuter = 450 * design.structureScale;
  const iconSize = 72 * design.fontScale;
  const labelSize = 23 * design.fontScale;
  const countSize = 18 * design.fontScale;
  const isDimmed = Boolean(data.dimmed);

  return (
    <div
      className="relative flex items-center justify-center w-77 h-77 rounded-full bg-slate-950"
      style={{
        width: size,
        height: size,
        backgroundColor: theme.nodeShell,
        opacity: isDimmed ? 0.28 : 1,
        filter: isDimmed ? 'saturate(0.65) brightness(0.72)' : 'none',
        transition: 'opacity 180ms ease, filter 180ms ease',
      }}
    >
      <div
        className="absolute w-77 h-77 rounded-full pointer-events-none"
        style={{
          width: size,
          height: size,
          boxShadow: glowEnabled
            ? `0 0 ${64 * design.structureScale}px ${24 * design.structureScale}px ${accentColor}${alphaHex(0.4 * glowMultiplier)}, 0 0 ${128 * design.structureScale}px ${52 * design.structureScale}px ${accentColor}${alphaHex(0.15 * glowMultiplier)}`
            : 'none',
        }}
      />

      {data.solar && (
        <>
          <div
            className="absolute rounded-full border border-white/25 animate-spin pointer-events-none"
            style={{
              width: orbitInner,
              height: orbitInner,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animationDuration: `${data.orbitPeriod ?? 18}s`,
              borderColor: `${theme.orbitColor}${alphaHex(0.25)}`,
            }}
          />
          <div
            className="absolute rounded-full border border-white/12 animate-spin pointer-events-none"
            style={{
              width: orbitOuter,
              height: orbitOuter,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animationDuration: `${(data.orbitPeriod ?? 18) * 1.5}s`,
              animationDirection: 'reverse',
              borderColor: `${theme.orbitColor}${alphaHex(0.12)}`,
            }}
          />
        </>
      )}

      <div
        className="absolute w-77 h-77 rounded-full animate-pulse pointer-events-none"
        style={{
          width: size,
          height: size,
          backgroundColor: `${accentColor}${alphaHex(0.14 * glowMultiplier)}`,
          animationDuration: '3s',
        }}
      />

      <div
        className="relative w-77 h-77 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(ellipse at 35% 35%, ${accentColor}${alphaHex(0.32)}, ${accentColor}${alphaHex(0.14)} 48%, ${theme.nodeSurface} 78%)`,
          border: `3.5px solid ${accentColor}${alphaHex(0.73)}`,
          boxShadow: glowEnabled
            ? `0 0 24px ${accentColor}${alphaHex(0.33 * glowMultiplier)}, inset 0 0 46px ${accentColor}${alphaHex(0.21 * glowMultiplier)}`
            : 'none',
        }}
      >
        <span
          style={{
            filter: glowEnabled ? `drop-shadow(0 0 14px ${accentColor}) brightness(1.08)` : 'none',
            fontSize: iconSize,
            lineHeight: 1,
          }}
        >
          {data.icon || '📚'}
        </span>
        <span
          className="font-bold mt-1 text-center leading-tight tracking-wide"
          style={{
            color: theme.nodeTextStrong,
            fontSize: labelSize,
            maxWidth: size * 0.82,
            overflowWrap: 'anywhere',
            textShadow: glowEnabled ? `0 0 16px ${accentColor}${alphaHex(0.67 * glowMultiplier)}` : 'none',
          }}
        >
          {data.label}
        </span>
        <span className="mt-1" style={{ color: theme.nodeText, fontSize: countSize }}>
          {data.nodeCount} topics
        </span>
      </div>

      <Handle type="source" position={Position.Top} id="center-src" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, opacity: 0, border: 'none', background: 'transparent' }} />
      <Handle type="target" position={Position.Top} id="center-tgt" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, opacity: 0, border: 'none', background: 'transparent' }} />
    </div>
  );
}

export const SubjectNode = memo(SubjectNodeComponent);
