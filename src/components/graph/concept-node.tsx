"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { NodeStatus, Subject, KnowledgeNode } from '@/types';
import { getDifficultyLabel } from '@/lib/utils';

interface ConceptNodeData {
  label: string;
  subject?: Subject;
  status: NodeStatus;
  difficulty: number;
  topic?: string;
  nodeData: KnowledgeNode;
  connectedSubjectColors?: string[];
  [key: string]: unknown;
}

/**
 * Blend an array of hex colors into one averaged color.
 */
function blendColors(colors: string[]): string {
  if (colors.length === 0) return '#6b7280';
  if (colors.length === 1) return colors[0];
  let r = 0, g = 0, b = 0;
  for (const hex of colors) {
    const h = hex.replace('#', '');
    r += parseInt(h.substring(0, 2), 16);
    g += parseInt(h.substring(2, 4), 16);
    b += parseInt(h.substring(4, 6), 16);
  }
  const n = colors.length;
  const toHex = (v: number) => Math.round(v / n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * PoE-inspired node tiers based on difficulty:
 *   1-2 → small (basic passive)
 *   3-4 → notable
 *   5   → keystone
 */
function getNodeTier(difficulty: number): 'small' | 'notable' | 'keystone' {
  if (difficulty <= 2) return 'small';
  if (difficulty <= 4) return 'notable';
  return 'keystone';
}

/**
 * Path of Exile-inspired concept node.
 * Dark backgrounds, glowing borders, tier-based sizing.
 * Mastered = bright glow, in_progress = dim pulse, untouched = dark.
 */
function ConceptNodeComponent({ data, selected }: NodeProps & { data: ConceptNodeData }) {
  const subjectColor = data.subject?.color || '#6b7280';
  const connectedColors = data.connectedSubjectColors || [subjectColor];
  const isMultiSubject = connectedColors.length > 1;
  const glowColor = isMultiSubject ? blendColors(connectedColors) : subjectColor;
  const tier = getNodeTier(data.difficulty);

  // Status-based glow intensity
  const isMastered = data.status === 'mastered';
  const isInProgress = data.status === 'in_progress';

  // Tier sizing (2.3x scale: small=120, notable=156, keystone=193)
  const sizeClasses = {
    small: 'w-[120px] h-[120px]',
    notable: 'w-[156px] h-[156px]',
    keystone: 'w-[193px] h-[193px]',
  };

  // Border thickness by tier
  const borderWidth = tier === 'keystone' ? 4 : tier === 'notable' ? 3.5 : 3;

  // Glow strength
  const glowIntensity = isMastered ? 0.9 : isInProgress ? 0.45 : 0.15;
  const glowSpread = tier === 'keystone' ? 40 : tier === 'notable' ? 28 : 18;

  // Inner bg opacity (darker for untouched, lighter for mastered)
  const bgOpacity = isMastered ? 0.35 : isInProgress ? 0.2 : 0.1;

  // Shape: keystone = octagon-ish (rounded square), notable = rounded, small = circle
  const shapeClass = {
    small: 'rounded-full',
    notable: 'rounded-xl',
    keystone: 'rounded-lg',
  };

  // Text size (1.5x: 8→12, 9→13.5≈14, 10→15)
  const textSize = tier === 'keystone' ? 'text-[15px]' : tier === 'notable' ? 'text-[14px]' : 'text-[12px]';

  return (
    <div className="relative flex items-center justify-center" title={getDifficultyLabel(data.difficulty)}>
      {/* Outer glow ring (PoE allocated-node feel) */}
      <div
        className={`absolute ${sizeClasses[tier]} ${shapeClass[tier]} pointer-events-none`}
        style={{
          boxShadow: `0 0 ${glowSpread}px ${Math.round(glowSpread * 0.6)}px ${glowColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}`,
        }}
      />

      {/* Mastered pulse animation */}
      {isMastered && (
        <div
          className={`absolute ${sizeClasses[tier]} ${shapeClass[tier]} animate-ping pointer-events-none`}
          style={{
            backgroundColor: glowColor,
            opacity: 0.15,
            animationDuration: '3s',
          }}
        />
      )}

      {/* In-progress subtle pulse */}
      {isInProgress && (
        <div
          className={`absolute ${sizeClasses[tier]} ${shapeClass[tier]} animate-pulse pointer-events-none`}
          style={{
            backgroundColor: glowColor,
            opacity: 0.1,
            animationDuration: '2.5s',
          }}
        />
      )}

      {/* Main node body */}
      <div
        className={`
          relative ${sizeClasses[tier]} ${shapeClass[tier]}
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-200
          ${selected ? 'scale-110' : 'hover:scale-105'}
        `}
        style={{
          background: `radial-gradient(ellipse at 30% 30%, ${glowColor}${Math.round(bgOpacity * 255).toString(16).padStart(2, '0')}, #0a0e1a ${isMastered ? '90%' : '70%'})`,
          border: `${borderWidth}px solid ${glowColor}${Math.round((isMastered ? 0.9 : isInProgress ? 0.5 : 0.25) * 255).toString(16).padStart(2, '0')}`,
          boxShadow: selected
            ? `0 0 20px 8px ${glowColor}88, inset 0 0 12px ${glowColor}33`
            : `inset 0 0 ${tier === 'keystone' ? 15 : 8}px ${glowColor}${Math.round(bgOpacity * 0.6 * 255).toString(16).padStart(2, '0')}`,
        }}
      >
        {/* Multi-subject indicator — small dots at top for cross-subject nodes */}
        {isMultiSubject && (
          <div className="absolute -top-2 flex gap-1">
            {connectedColors.slice(0, 4).map((color, idx) => (
              <div
                key={idx}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
              />
            ))}
          </div>
        )}

        {/* Node label */}
        <span
          className={`${textSize} font-bold text-center leading-tight px-2 max-w-full`}
          style={{
            color: isMastered ? '#ffffff' : isInProgress ? '#e2e8f0' : '#94a3b8',
            textShadow: isMastered ? `0 0 6px ${glowColor}` : 'none',
          }}
        >
          {data.label}
        </span>

        {/* Difficulty pips — only for notable and keystone */}
        {tier !== 'small' && (
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: tier === 'keystone' ? 6 : 5,
                  height: tier === 'keystone' ? 6 : 5,
                  backgroundColor: i < data.difficulty
                    ? glowColor
                    : `${glowColor}33`,
                  boxShadow: i < data.difficulty ? `0 0 3px ${glowColor}` : 'none',
                }}
              />
            ))}
          </div>
        )}

        {/* Mastered checkmark */}
        {isMastered && (
          <div
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{
              backgroundColor: '#0a0e1a',
              border: `2px solid ${glowColor}`,
              boxShadow: `0 0 8px ${glowColor}`,
              color: glowColor,
            }}
          >
            ✓
          </div>
        )}
      </div>

      {/* Handles for connections — bidirectional for spider-web layout */}
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

export const ConceptNode = memo(ConceptNodeComponent);
