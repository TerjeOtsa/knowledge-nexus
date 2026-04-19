"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Brain } from 'lucide-react';
import {
  DEFAULT_GRAPH_DESIGN_SETTINGS,
  alphaHex,
  getGraphTheme,
  getStructureNodeSize,
  type GraphDesignSettings,
} from './design-settings';

interface RootNodeData {
  label: string;
  dimmed?: boolean;
  design?: GraphDesignSettings;
  [key: string]: unknown;
}

function RootNodeComponent({ data, selected }: NodeProps & { data: RootNodeData }) {
  const design = data.design ?? DEFAULT_GRAPH_DESIGN_SETTINGS;
  const theme = getGraphTheme(design.themeId);
  const glowMultiplier = design.glowStrength * theme.glowBase;
  const glowEnabled = glowMultiplier > 0.03;
  const size = getStructureNodeSize('root', design);
  const innerRingSize = 432 * design.structureScale;
  const outerRingSize = 468 * design.structureScale;
  const iconSize = 80 * design.fontScale;
  const labelSize = 27 * design.fontScale;
  const isDimmed = Boolean(data.dimmed);

  return (
    <div
      className="relative flex items-center justify-center w-99 h-99 rounded-full bg-slate-950"
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
        className="absolute w-99 h-99 rounded-full pointer-events-none"
        style={{
          width: size,
          height: size,
          boxShadow: glowEnabled
            ? `0 0 ${96 * design.structureScale}px ${36 * design.structureScale}px ${theme.rootAccent}${alphaHex(0.45 * glowMultiplier)}, 0 0 ${180 * design.structureScale}px ${72 * design.structureScale}px ${theme.rootSecondary}${alphaHex(0.22 * glowMultiplier)}`
            : 'none',
        }}
      />

      <div
        className="absolute w-108 h-108 rounded-full border-2 border-purple-400/20 animate-spin pointer-events-none"
        style={{
          width: innerRingSize,
          height: innerRingSize,
          borderColor: `${theme.rootAccent}${alphaHex(0.2)}`,
          animationDuration: '20s',
        }}
      />
      <div
        className="absolute w-117 h-117 rounded-full border border-indigo-400/10 animate-spin pointer-events-none"
        style={{
          width: outerRingSize,
          height: outerRingSize,
          borderColor: `${theme.rootSecondary}${alphaHex(0.1)}`,
          animationDuration: '30s',
          animationDirection: 'reverse',
        }}
      />

      <div
        className="absolute w-99 h-99 rounded-full animate-ping pointer-events-none"
        style={{
          width: size,
          height: size,
          backgroundColor: `${theme.rootAccent}${alphaHex(0.16 * glowMultiplier)}`,
          animationDuration: '4s',
        }}
      />

      <div
        className={`
          relative w-99 h-99 rounded-full
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-300
          ${selected ? 'scale-110' : 'hover:scale-105'}
        `}
        style={{
          width: size,
          height: size,
          background: `radial-gradient(ellipse at 35% 35%, ${theme.rootAccent}${alphaHex(0.38)}, ${theme.rootSecondary}${alphaHex(0.24)} 42%, ${theme.nodeSurface} 76%)`,
          border: `4px solid ${theme.rootAccent}${alphaHex(0.82)}`,
          boxShadow: !glowEnabled
            ? 'none'
            : selected
              ? `0 0 62px 24px ${theme.rootAccent}${alphaHex(0.62 * glowMultiplier)}, inset 0 0 46px ${theme.rootAccent}${alphaHex(0.3 * glowMultiplier)}`
              : `0 0 28px ${theme.rootAccent}${alphaHex(0.24 * glowMultiplier)}, inset 0 0 54px ${theme.rootAccent}${alphaHex(0.22 * glowMultiplier)}`,
        }}
      >
        <Brain
          className="text-fuchsia-100"
          style={{
            width: iconSize,
            height: iconSize,
            color: theme.nodeTextStrong,
            filter: glowEnabled ? `drop-shadow(0 0 16px ${theme.rootAccent}${alphaHex(0.8 * glowMultiplier)})` : 'none',
          }}
        />
        <span
          className="font-bold tracking-wider text-center leading-tight mt-2"
          style={{
            color: theme.nodeTextStrong,
            fontSize: labelSize,
            maxWidth: size * 0.76,
            overflowWrap: 'anywhere',
            textShadow: glowEnabled ? `0 0 18px ${theme.rootAccent}${alphaHex(0.7 * glowMultiplier)}` : 'none',
          }}
        >
          Knowledge<br />Nexus
        </span>
      </div>

      <Handle type="source" position={Position.Top} id="center-src" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, opacity: 0, border: 'none', background: 'transparent' }} />
      <Handle type="target" position={Position.Top} id="center-tgt" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, opacity: 0, border: 'none', background: 'transparent' }} />
    </div>
  );
}

export const RootNode = memo(RootNodeComponent);
