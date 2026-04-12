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
  dimmed?: boolean;
  searchMatched?: boolean;
  searchActive?: boolean;
  [key: string]: unknown;
}

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

function getNodeTier(difficulty: number): 'small' | 'notable' | 'keystone' {
  if (difficulty <= 2) return 'small';
  if (difficulty <= 4) return 'notable';
  return 'keystone';
}

function ConceptNodeComponent({ data, selected }: NodeProps & { data: ConceptNodeData }) {
  const subjectColor = data.subject?.color || '#6b7280';
  const connectedColors = data.connectedSubjectColors || [subjectColor];
  const isMultiSubject = connectedColors.length > 1;
  const tier = getNodeTier(data.difficulty);
  const isDimmed = Boolean(data.dimmed);
  const isSearchMatched = Boolean(data.searchMatched);
  const isSearchActive = Boolean(data.searchActive);

  const isMastered = data.status === 'mastered';
  const isInProgress = data.status === 'in_progress';
  const baseGlowColor = isMultiSubject ? blendColors(connectedColors) : subjectColor;
  const masteryGlowColor = '#22c55e';
  const glowColor = isMastered ? masteryGlowColor : baseGlowColor;
  const fillColor = isMastered ? blendColors([baseGlowColor, masteryGlowColor]) : glowColor;
  const searchGlowColor = '#fef08a';

  const sizeClasses = {
    small: 'w-[120px] h-[120px]',
    notable: 'w-[156px] h-[156px]',
    keystone: 'w-[193px] h-[193px]',
  };

  const borderWidth = tier === 'keystone' ? 4 : tier === 'notable' ? 3.5 : 3;
  const glowIntensity = isMastered ? 0.95 : isInProgress ? 0.62 : 0.28;
  const glowSpread = tier === 'keystone' ? 52 : tier === 'notable' ? 36 : 24;
  const bgOpacity = isMastered ? 0.48 : isInProgress ? 0.34 : 0.2;

  const shapeClass = {
    small: 'rounded-full',
    notable: 'rounded-xl',
    keystone: 'rounded-lg',
  };

  const textSize = tier === 'keystone' ? 'text-[15px]' : tier === 'notable' ? 'text-[14px]' : 'text-[12px]';

  return (
    <div
      className="relative flex items-center justify-center"
      title={getDifficultyLabel(data.difficulty)}
      style={{
        opacity: isDimmed ? (isSearchActive ? 0.16 : 0.28) : 1,
        filter: isDimmed
          ? isSearchActive
            ? 'saturate(0.45) brightness(0.54)'
            : 'saturate(0.65) brightness(0.72)'
          : 'none',
        transition: 'opacity 180ms ease, filter 180ms ease',
      }}
    >
      <div
        className={`absolute ${sizeClasses[tier]} ${shapeClass[tier]} pointer-events-none`}
        style={{
          boxShadow: isSearchMatched
            ? `0 0 ${glowSpread + 18}px ${Math.round(glowSpread * 0.75)}px ${glowColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}, 0 0 ${glowSpread + 34}px ${Math.round(glowSpread * 0.55)}px ${searchGlowColor}66`
            : `0 0 ${glowSpread}px ${Math.round(glowSpread * 0.6)}px ${glowColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}`,
        }}
      />

      {isSearchMatched && (
        <div
          className={`absolute ${sizeClasses[tier]} ${shapeClass[tier]} pointer-events-none`}
          style={{
            border: `2px solid ${searchGlowColor}cc`,
            boxShadow: `0 0 20px 7px ${searchGlowColor}7a, inset 0 0 14px ${searchGlowColor}33`,
          }}
        />
      )}

      {isMastered && (
        <div
          className={`absolute ${sizeClasses[tier]} ${shapeClass[tier]} animate-ping pointer-events-none`}
          style={{
            backgroundColor: glowColor,
            opacity: 0.2,
            animationDuration: '3s',
          }}
        />
      )}

      {isInProgress && (
        <div
          className={`absolute ${sizeClasses[tier]} ${shapeClass[tier]} animate-pulse pointer-events-none`}
          style={{
            backgroundColor: glowColor,
            opacity: 0.16,
            animationDuration: '2.5s',
          }}
        />
      )}

      <div
        className={`
          relative ${sizeClasses[tier]} ${shapeClass[tier]}
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-200
          ${selected ? 'scale-110' : 'hover:scale-105'}
        `}
        style={{
          background: `radial-gradient(ellipse at 30% 28%, ${fillColor}${Math.round((bgOpacity + 0.08) * 255).toString(16).padStart(2, '0')}, ${glowColor}22 42%, #10182a 78%)`,
          border: `${borderWidth}px solid ${(isSearchMatched ? searchGlowColor : glowColor)}${Math.round((isMastered ? 0.95 : isInProgress ? 0.72 : isSearchMatched ? 0.8 : 0.45) * 255).toString(16).padStart(2, '0')}`,
          boxShadow: selected
            ? `0 0 26px 10px ${(isSearchMatched ? searchGlowColor : glowColor)}aa, inset 0 0 18px ${glowColor}55`
            : isSearchMatched
              ? `0 0 ${tier === 'keystone' ? 28 : 18}px ${searchGlowColor}88, 0 0 ${tier === 'keystone' ? 18 : 10}px ${glowColor}${Math.round((glowIntensity * 0.5) * 255).toString(16).padStart(2, '0')}, inset 0 0 ${tier === 'keystone' ? 18 : 10}px ${glowColor}${Math.round(bgOpacity * 0.75 * 255).toString(16).padStart(2, '0')}`
              : `0 0 ${tier === 'keystone' ? 18 : 10}px ${glowColor}${Math.round((glowIntensity * 0.5) * 255).toString(16).padStart(2, '0')}, inset 0 0 ${tier === 'keystone' ? 18 : 10}px ${glowColor}${Math.round(bgOpacity * 0.75 * 255).toString(16).padStart(2, '0')}`,
        }}
      >
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

        <span
          className={`${textSize} font-bold text-center leading-tight px-2 max-w-full`}
          style={{
            color: isSearchMatched ? '#fffef0' : isMastered ? '#ffffff' : isInProgress ? '#f1f5f9' : '#cbd5e1',
            textShadow: isSearchMatched
              ? `0 0 12px ${searchGlowColor}, 0 0 8px ${glowColor}`
              : isMastered
              ? `0 0 9px ${glowColor}`
              : isInProgress
                ? `0 0 6px ${glowColor}88`
                : `0 0 4px ${glowColor}55`,
          }}
        >
          {data.label}
        </span>

        {tier !== 'small' && (
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: tier === 'keystone' ? 6 : 5,
                  height: tier === 'keystone' ? 6 : 5,
                  backgroundColor: i < data.difficulty ? glowColor : `${glowColor}33`,
                  boxShadow: i < data.difficulty ? `0 0 3px ${glowColor}` : 'none',
                }}
              />
            ))}
          </div>
        )}

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
