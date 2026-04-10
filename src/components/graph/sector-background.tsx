"use client";

import React, { memo } from 'react';
import { useViewport } from '@xyflow/react';
import type { SectorInfo } from '@/lib/radial-layout';

interface SectorBackgroundProps {
  sectors: SectorInfo[];
  /** How far out the sector wedges extend (in graph units) */
  maxRadius?: number;
  /** Opacity of the sector fill (0-1) */
  opacity?: number;
}

/**
 * Hex color → { r, g, b } (0-255)
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/**
 * Generate an SVG arc path for a sector wedge from center (cx, cy).
 * Goes from startAngle to endAngle at the given radius.
 */
function sectorPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const sweep = endAngle - startAngle;
  const largeArc = sweep > Math.PI ? 1 : 0;

  // Outer arc points
  const ox1 = cx + outerRadius * Math.cos(startAngle);
  const oy1 = cy + outerRadius * Math.sin(startAngle);
  const ox2 = cx + outerRadius * Math.cos(endAngle);
  const oy2 = cy + outerRadius * Math.sin(endAngle);

  // Inner arc points
  const ix1 = cx + innerRadius * Math.cos(startAngle);
  const iy1 = cy + innerRadius * Math.sin(startAngle);
  const ix2 = cx + innerRadius * Math.cos(endAngle);
  const iy2 = cy + innerRadius * Math.sin(endAngle);

  return [
    `M ${ix1} ${iy1}`,
    `L ${ox1} ${oy1}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
    'Z',
  ].join(' ');
}

/**
 * Blend region path for the boundary between two adjacent sectors.
 * Creates a thin wedge at the boundary that fades both colors.
 */
function blendWedgePath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  centerAngle: number,
  halfWidth: number
): string {
  return sectorPath(cx, cy, innerRadius, outerRadius, centerAngle - halfWidth, centerAngle + halfWidth);
}

/**
 * SVG layer rendered behind the React Flow nodes, drawing colored
 * pie-slice sectors for each subject. Uses the React Flow viewport
 * transform so the sectors move/zoom with the graph.
 */
function SectorBackgroundComponent({ sectors, maxRadius = 2500, opacity = 0.07 }: SectorBackgroundProps) {
  const { x, y, zoom } = useViewport();

  if (sectors.length === 0) return null;

  const cx = 0;
  const cy = 0;
  const innerR = 100; // small gap around root

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%', overflow: 'visible', zIndex: 0 }}
    >
      <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
        <defs>
          {/* Radial gradient for each sector — fades out toward edges */}
          {sectors.map((sector) => {
            const rgb = hexToRgb(sector.color);
            return (
              <radialGradient
                key={`grad-${sector.subjectId}`}
                id={`sector-grad-${sector.subjectId}`}
                cx="0"
                cy="0"
                r={maxRadius}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={sector.color} stopOpacity={opacity * 1.5} />
                <stop offset="30%" stopColor={sector.color} stopOpacity={opacity} />
                <stop offset="70%" stopColor={sector.color} stopOpacity={opacity * 0.6} />
                <stop offset="100%" stopColor={sector.color} stopOpacity={0} />
              </radialGradient>
            );
          })}

          {/* Blend gradients for boundaries between adjacent sectors */}
          {sectors.map((sector, i) => {
            const nextSector = sectors[(i + 1) % sectors.length];
            const rgb1 = hexToRgb(sector.color);
            const rgb2 = hexToRgb(nextSector.color);
            const blendR = Math.round((rgb1.r + rgb2.r) / 2);
            const blendG = Math.round((rgb1.g + rgb2.g) / 2);
            const blendB = Math.round((rgb1.b + rgb2.b) / 2);
            const blendColor = `rgb(${blendR}, ${blendG}, ${blendB})`;
            return (
              <radialGradient
                key={`blend-grad-${i}`}
                id={`blend-grad-${i}`}
                cx="0"
                cy="0"
                r={maxRadius}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={blendColor} stopOpacity={opacity * 0.8} />
                <stop offset="50%" stopColor={blendColor} stopOpacity={opacity * 0.4} />
                <stop offset="100%" stopColor={blendColor} stopOpacity={0} />
              </radialGradient>
            );
          })}
        </defs>

        {/* Main sector wedges */}
        {sectors.map((sector) => (
          <path
            key={`sector-${sector.subjectId}`}
            d={sectorPath(cx, cy, innerR, maxRadius, sector.startAngle, sector.endAngle)}
            fill={`url(#sector-grad-${sector.subjectId})`}
          />
        ))}

        {/* Blend wedges at boundaries between adjacent sectors */}
        {sectors.length > 1 &&
          sectors.map((sector, i) => {
            const nextSector = sectors[(i + 1) % sectors.length];
            // Boundary angle is midpoint between sector.endAngle and nextSector.startAngle
            const boundaryAngle = (sector.endAngle + nextSector.startAngle) / 2;
            // Blend wedge spans the gap + a bit into each sector
            const blendHalf = 0.12; // ~7 degrees each side

            return (
              <path
                key={`blend-${i}`}
                d={blendWedgePath(cx, cy, innerR, maxRadius, boundaryAngle, blendHalf)}
                fill={`url(#blend-grad-${i})`}
              />
            );
          })}

        {/* Subtle sector boundary lines */}
        {sectors.map((sector) => {
          const x1 = cx + innerR * Math.cos(sector.startAngle);
          const y1 = cy + innerR * Math.sin(sector.startAngle);
          const x2 = cx + maxRadius * Math.cos(sector.startAngle);
          const y2 = cy + maxRadius * Math.sin(sector.startAngle);
          return (
            <line
              key={`line-${sector.subjectId}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={sector.color}
              strokeWidth={1}
              strokeOpacity={0.08}
              strokeDasharray="8 12"
            />
          );
        })}
      </g>
    </svg>
  );
}

export const SectorBackground = memo(SectorBackgroundComponent);
