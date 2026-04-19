"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Layers3 } from 'lucide-react';
import {
  DEFAULT_GRAPH_DESIGN_SETTINGS,
  alphaHex,
  getGraphTheme,
  getStructureNodeSize,
  resolveGraphAccent,
  type GraphDesignSettings,
} from './design-settings';

interface TopicNodeData {
  label: string;
  color: string;
  nodeCount: number;
  dimmed?: boolean;
  design?: GraphDesignSettings;
  [key: string]: unknown;
}

function TopicNodeComponent({ data }: NodeProps & { data: TopicNodeData }) {
  const design = data.design ?? DEFAULT_GRAPH_DESIGN_SETTINGS;
  const theme = getGraphTheme(design.themeId);
  const accentColor = resolveGraphAccent(data.color, theme);
  const glowMultiplier = design.glowStrength * theme.glowBase;
  const glowEnabled = glowMultiplier > 0.03;
  const size = getStructureNodeSize('topic', design);
  const iconBoxSize = 64 * design.structureScale;
  const iconSize = 36 * design.structureScale;
  const labelSize = 20 * design.fontScale;
  const countSize = 17 * design.fontScale;
  const isDimmed = Boolean(data.dimmed);

  return (
    <div
      className="relative flex items-center justify-center w-53 h-53 rounded-4xl bg-slate-950"
      style={{
        width: size,
        height: size,
        backgroundColor: theme.nodeShell,
        opacity: isDimmed ? 0.24 : 1,
        filter: isDimmed ? 'saturate(0.7) brightness(0.76)' : 'none',
        transition: 'opacity 180ms ease, filter 180ms ease',
      }}
    >
      <div
        className="absolute w-53 h-53 rounded-4xl pointer-events-none"
        style={{
          width: size,
          height: size,
          boxShadow: glowEnabled
            ? `0 0 ${42 * design.structureScale}px ${14 * design.structureScale}px ${accentColor}${alphaHex(0.2 * glowMultiplier)}, 0 0 ${84 * design.structureScale}px ${28 * design.structureScale}px ${accentColor}${alphaHex(0.08 * glowMultiplier)}`
            : 'none',
        }}
      />

      <div
        className="relative w-53 h-53 rounded-4xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 30% 28%, ${accentColor}${alphaHex(0.19)}, ${accentColor}${alphaHex(0.08)} 48%, ${theme.nodeSurface} 82%)`,
          borderColor: `${accentColor}${alphaHex(0.53)}`,
          boxShadow: glowEnabled
            ? `0 0 18px ${accentColor}${alphaHex(0.21 * glowMultiplier)}, inset 0 0 28px ${accentColor}${alphaHex(0.13 * glowMultiplier)}`
            : 'none',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
          style={{
            width: iconBoxSize,
            height: iconBoxSize,
            backgroundColor: `${accentColor}${alphaHex(0.13)}`,
            border: `1px solid ${accentColor}${alphaHex(0.4)}`,
          }}
        >
          <Layers3 style={{ color: accentColor, width: iconSize, height: iconSize }} />
        </div>
        <span
          className="px-3 font-semibold text-center leading-tight tracking-wide"
          style={{
            color: theme.nodeTextStrong,
            fontSize: labelSize,
            maxWidth: size * 0.86,
            overflowWrap: 'anywhere',
            textShadow: glowEnabled ? `0 0 10px ${accentColor}${alphaHex(0.35 * glowMultiplier)}` : 'none',
          }}
        >
          {data.label}
        </span>
        <span className="mt-2" style={{ color: theme.nodeText, fontSize: countSize }}>
          {data.nodeCount} concepts
        </span>
      </div>

      <Handle type="source" position={Position.Top} id="center-src" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, opacity: 0, border: 'none', background: 'transparent' }} />
      <Handle type="target" position={Position.Top} id="center-tgt" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, opacity: 0, border: 'none', background: 'transparent' }} />
    </div>
  );
}

export const TopicNode = memo(TopicNodeComponent);
