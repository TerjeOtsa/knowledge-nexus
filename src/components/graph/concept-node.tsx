"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Lock, Sparkles, RotateCcw } from 'lucide-react';
import type { LearnerState } from '@/lib/learner-state';
import type { NodeStatus, Subject, KnowledgeNode } from '@/types';
import { getDifficultyLabel } from '@/lib/utils';
import {
  DEFAULT_GRAPH_DESIGN_SETTINGS,
  alphaHex,
  getConceptNodeSize,
  getGraphTheme,
  resolveGraphAccent,
  type GraphDesignSettings,
} from './design-settings';

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
  learningState?: LearnerState;
  prerequisiteSummary?: string;
  design?: GraphDesignSettings;
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
  const design = data.design ?? DEFAULT_GRAPH_DESIGN_SETTINGS;
  const theme = getGraphTheme(design.themeId);
  const subjectColor = resolveGraphAccent(data.subject?.color || '#6b7280', theme);
  const connectedColors = (data.connectedSubjectColors?.length ? data.connectedSubjectColors : [subjectColor])
    .map((color) => resolveGraphAccent(color, theme));
  const isMultiSubject = connectedColors.length > 1;
  const tier = getNodeTier(data.difficulty);
  const isDimmed = Boolean(data.dimmed);
  const isSearchMatched = Boolean(data.searchMatched);
  const isSearchActive = Boolean(data.searchActive);
  const learningState = data.learningState || 'ready';
  const isLocked = learningState === 'locked';
  const isReady = learningState === 'ready';
  const isReviewDue = learningState === 'review';

  const isMastered = data.status === 'mastered';
  const isInProgress = data.status === 'in_progress';
  const baseGlowColor = isMultiSubject ? blendColors(connectedColors) : subjectColor;
  const masteryGlowColor = theme.masteredColor;
  const readyGlowColor = theme.readyColor;
  const reviewGlowColor = theme.reviewColor;
  const lockedGlowColor = theme.lockedColor;
  const glowColor = isLocked
    ? lockedGlowColor
    : isReviewDue
      ? reviewGlowColor
      : isMastered
        ? masteryGlowColor
        : isReady
          ? readyGlowColor
          : baseGlowColor;
  const fillColor = isMastered ? blendColors([baseGlowColor, masteryGlowColor]) : glowColor;
  const searchGlowColor = theme.searchColor;
  const glowMultiplier = design.glowStrength * theme.glowBase;
  const glowEnabled = glowMultiplier > 0.03;
  const nodeSize = getConceptNodeSize(data.difficulty, design);
  const textSizePx = (tier === 'keystone' ? 33 : tier === 'notable' ? 27 : 23) * design.fontScale;

  const sizeStyle = {
    width: nodeSize,
    height: nodeSize,
  };

  const borderWidth = tier === 'keystone' ? 4 : tier === 'notable' ? 3.5 : 3;
  const glowIntensity = (isMastered ? 0.95 : isInProgress ? 0.62 : 0.28) * glowMultiplier;
  const glowSpread = (tier === 'keystone' ? 52 : tier === 'notable' ? 36 : 24) * design.conceptScale;
  const bgOpacity = isMastered ? 0.48 : isInProgress ? 0.34 : 0.2;

  const shapeClass = {
    small: 'rounded-full',
    notable: 'rounded-xl',
    keystone: 'rounded-lg',
  };

  return (
    <div
      className={`relative flex items-center justify-center bg-slate-950 ${shapeClass[tier]}`}
      title={getDifficultyLabel(data.difficulty)}
      style={{
        backgroundColor: theme.nodeShell,
        opacity: isDimmed ? (isSearchActive ? 0.16 : 0.28) : isLocked ? 0.78 : 1,
        filter: isDimmed
          ? isSearchActive
            ? 'saturate(0.45) brightness(0.54)'
            : 'saturate(0.65) brightness(0.72)'
          : isLocked ? 'saturate(0.7)' : 'none',
        transition: 'opacity 180ms ease, filter 180ms ease',
      }}
    >
      <div
        className={`absolute ${shapeClass[tier]} pointer-events-none`}
        style={{
          ...sizeStyle,
          boxShadow: isSearchMatched
            ? `0 0 ${glowSpread + 18}px ${Math.round(glowSpread * 0.75)}px ${glowColor}${alphaHex(glowIntensity)}, 0 0 ${glowSpread + 34}px ${Math.round(glowSpread * 0.55)}px ${searchGlowColor}${alphaHex(0.4 * glowMultiplier)}`
            : `0 0 ${glowSpread}px ${Math.round(glowSpread * 0.6)}px ${glowColor}${alphaHex(glowIntensity)}`,
        }}
      />

      {isSearchMatched && (
        <div
          className={`absolute ${shapeClass[tier]} pointer-events-none`}
          style={{
            ...sizeStyle,
            border: `2px solid ${searchGlowColor}cc`,
            boxShadow: glowEnabled ? `0 0 20px 7px ${searchGlowColor}${alphaHex(0.48 * glowMultiplier)}, inset 0 0 14px ${searchGlowColor}33` : 'none',
          }}
        />
      )}

      {isMastered && (
        <div
          className={`absolute ${shapeClass[tier]} animate-ping pointer-events-none`}
          style={{
            ...sizeStyle,
            backgroundColor: glowColor,
            opacity: 0.2 * glowMultiplier,
            animationDuration: '3s',
          }}
        />
      )}

      {isInProgress && (
        <div
          className={`absolute ${shapeClass[tier]} animate-pulse pointer-events-none`}
          style={{
            ...sizeStyle,
            backgroundColor: glowColor,
            opacity: 0.16 * glowMultiplier,
            animationDuration: '2.5s',
          }}
        />
      )}

      {isReady && !isInProgress && !isMastered && (
        <div
          className={`absolute ${shapeClass[tier]} pointer-events-none`}
          style={{
            ...sizeStyle,
            border: `2px solid ${readyGlowColor}${alphaHex(0.4)}`,
            boxShadow: glowEnabled ? `0 0 18px 4px ${readyGlowColor}${alphaHex(0.17 * glowMultiplier)}` : 'none',
          }}
        />
      )}

      <div
        className={`
          relative ${shapeClass[tier]}
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-200
          ${selected ? 'scale-110' : 'hover:scale-105'}
        `}
        style={{
          ...sizeStyle,
          background: `radial-gradient(ellipse at 30% 28%, ${fillColor}${alphaHex(bgOpacity + 0.08)}, ${glowColor}${alphaHex(0.13)} 42%, ${theme.nodeSurface} 78%)`,
          border: `${borderWidth}px ${isLocked ? 'dashed' : 'solid'} ${(isSearchMatched ? searchGlowColor : glowColor)}${alphaHex(isMastered ? 0.95 : isInProgress ? 0.72 : isSearchMatched ? 0.8 : isLocked ? 0.7 : 0.45)}`,
          boxShadow: !glowEnabled
            ? 'none'
            : selected
              ? `0 0 26px 10px ${(isSearchMatched ? searchGlowColor : glowColor)}${alphaHex(0.67 * glowMultiplier)}, inset 0 0 18px ${glowColor}${alphaHex(0.33 * glowMultiplier)}`
              : isSearchMatched
                ? `0 0 ${tier === 'keystone' ? 28 : 18}px ${searchGlowColor}${alphaHex(0.53 * glowMultiplier)}, 0 0 ${tier === 'keystone' ? 18 : 10}px ${glowColor}${alphaHex(glowIntensity * 0.5)}, inset 0 0 ${tier === 'keystone' ? 18 : 10}px ${glowColor}${alphaHex(bgOpacity * 0.75 * glowMultiplier)}`
                : `0 0 ${tier === 'keystone' ? 18 : 10}px ${glowColor}${alphaHex(glowIntensity * 0.5)}, inset 0 0 ${tier === 'keystone' ? 18 : 10}px ${glowColor}${alphaHex(bgOpacity * 0.75 * glowMultiplier)}`,
        }}
      >
        {isMultiSubject && (
          <div className="absolute -top-3 flex gap-2">
            {connectedColors.slice(0, 4).map((color, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color, boxShadow: glowEnabled ? `0 0 6px ${color}` : 'none' }}
              />
            ))}
          </div>
        )}

        {isLocked && (
          <div
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: theme.panelSoftBg,
              border: `1px solid ${lockedGlowColor}aa`,
              boxShadow: glowEnabled ? `0 0 10px ${lockedGlowColor}${alphaHex(0.33 * glowMultiplier)}` : 'none',
            }}
            title={data.prerequisiteSummary || 'Complete prerequisites first'}
          >
            <Lock className="w-4 h-4" style={{ color: theme.panelText }} />
          </div>
        )}

        {isReviewDue && (
          <div
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: theme.panelSoftBg,
              border: `1px solid ${reviewGlowColor}bb`,
              boxShadow: glowEnabled ? `0 0 12px ${reviewGlowColor}${alphaHex(0.33 * glowMultiplier)}` : 'none',
            }}
            title="Review due"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
          </div>
        )}

        <span
          className="font-bold text-center leading-tight px-2 max-w-full"
          style={{
            color: isSearchMatched ? theme.nodeTextStrong : isMastered ? theme.nodeTextStrong : isInProgress ? theme.nodeTextStrong : theme.nodeText,
            fontSize: textSizePx,
            maxWidth: nodeSize * 0.86,
            overflowWrap: 'anywhere',
            textShadow: !glowEnabled
              ? 'none'
              : isSearchMatched
                ? `0 0 12px ${searchGlowColor}, 0 0 8px ${glowColor}`
                : isMastered
                  ? `0 0 9px ${glowColor}`
                  : isInProgress
                    ? `0 0 6px ${glowColor}${alphaHex(0.53 * glowMultiplier)}`
                    : `0 0 4px ${glowColor}${alphaHex(0.33 * glowMultiplier)}`,
          }}
        >
          {data.label}
        </span>

        {tier !== 'small' && (
          <div className="flex items-center gap-2 mt-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: tier === 'keystone' ? 12 : 10,
                  height: tier === 'keystone' ? 12 : 10,
                  backgroundColor: i < data.difficulty ? glowColor : `${glowColor}33`,
                  boxShadow: i < data.difficulty && glowEnabled ? `0 0 6px ${glowColor}` : 'none',
                }}
              />
            ))}
          </div>
        )}

        {isReady && !isInProgress && !isMastered && !isLocked && (
          <div
            className="absolute -bottom-2 -left-2 px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-semibold tracking-wide"
            style={{
              backgroundColor: theme.panelSoftBg,
              color: theme.panelText,
              border: `1px solid ${readyGlowColor}${alphaHex(0.65)}`,
              boxShadow: glowEnabled ? `0 0 12px ${readyGlowColor}${alphaHex(0.35 * glowMultiplier)}` : 'none',
            }}
          >
            <Sparkles className="w-3 h-3" />
            Ready
          </div>
        )}

        {isMastered && (
          <div
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{
              backgroundColor: theme.nodeShell,
              border: `2px solid ${glowColor}`,
              boxShadow: glowEnabled ? `0 0 8px ${glowColor}` : 'none',
              color: glowColor,
            }}
          >
            ✓
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Top} id="center-src" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, opacity: 0, border: 'none', background: 'transparent' }} />
      <Handle type="target" position={Position.Top} id="center-tgt" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1, height: 1, opacity: 0, border: 'none', background: 'transparent' }} />
    </div>
  );
}

export const ConceptNode = memo(ConceptNodeComponent);
