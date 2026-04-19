"use client";

export type GraphThemeId = 'nexus' | 'midnight' | 'library' | 'contrast';
export type GraphFontId = 'geist' | 'system' | 'serif' | 'mono' | 'rounded';

export interface GraphDesignSettings {
  themeId: GraphThemeId;
  fontId: GraphFontId;
  conceptScale: number;
  structureScale: number;
  fontScale: number;
  glowStrength: number;
  edgeStrength: number;
  backgroundIntensity: number;
}

export interface GraphTheme {
  id: GraphThemeId;
  label: string;
  description: string;
  accentMode: 'subject' | 'soft' | 'mono';
  accentMixColor: string;
  accentMixAmount: number;
  monoAccent: string;
  canvasBackground: string;
  canvasBase: string;
  panelBg: string;
  panelSoftBg: string;
  panelBorder: string;
  panelText: string;
  panelMuted: string;
  inputBg: string;
  nodeShell: string;
  nodeSurface: string;
  nodeText: string;
  nodeTextStrong: string;
  edgeLabelText: string;
  edgeLabelBg: string;
  minimapBg: string;
  minimapMask: string;
  gridColor: string;
  orbitColor: string;
  rootAccent: string;
  rootSecondary: string;
  readyColor: string;
  masteredColor: string;
  progressColor: string;
  reviewColor: string;
  lockedColor: string;
  searchColor: string;
  glowBase: number;
  edgeBase: number;
  sectorBase: number;
}

const STORAGE_KEY = 'kn-graph-design-settings';

export const DEFAULT_GRAPH_DESIGN_SETTINGS: GraphDesignSettings = {
  themeId: 'nexus',
  fontId: 'geist',
  conceptScale: 1,
  structureScale: 1,
  fontScale: 1,
  glowStrength: 1,
  edgeStrength: 1,
  backgroundIntensity: 1,
};

export const GRAPH_FONT_OPTIONS: Array<{ id: GraphFontId; label: string; family: string }> = [
  { id: 'geist', label: 'Geist', family: 'var(--font-geist-sans), Arial, Helvetica, sans-serif' },
  { id: 'system', label: 'System', family: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'serif', label: 'Serif', family: 'Georgia, "Times New Roman", serif' },
  { id: 'mono', label: 'Mono', family: 'var(--font-geist-mono), "SFMono-Regular", Consolas, monospace' },
  { id: 'rounded', label: 'Rounded', family: '"Trebuchet MS", "Avenir Next Rounded", Arial, sans-serif' },
];

export const GRAPH_THEMES: GraphTheme[] = [
  {
    id: 'nexus',
    label: 'Nexus Neon',
    description: 'The current vivid dark graph style.',
    accentMode: 'subject',
    accentMixColor: '#ffffff',
    accentMixAmount: 0,
    monoAccent: '#a855f7',
    canvasBackground: 'radial-gradient(ellipse at center, #1e1b4b 0%, #0f172a 50%, #020617 100%)',
    canvasBase: '#020617',
    panelBg: 'rgba(15, 23, 42, 0.9)',
    panelSoftBg: 'rgba(30, 41, 59, 0.78)',
    panelBorder: 'rgba(51, 65, 85, 0.72)',
    panelText: '#e2e8f0',
    panelMuted: '#94a3b8',
    inputBg: 'rgba(15, 23, 42, 0.35)',
    nodeShell: '#020617',
    nodeSurface: '#10182a',
    nodeText: '#cbd5e1',
    nodeTextStrong: '#ffffff',
    edgeLabelText: '#cbd5e1',
    edgeLabelBg: '#0f172a',
    minimapBg: '#0f172a',
    minimapMask: 'rgba(0, 0, 0, 0.4)',
    gridColor: '#1e293b80',
    orbitColor: '#ffffff',
    rootAccent: '#a855f7',
    rootSecondary: '#6366f1',
    readyColor: '#38bdf8',
    masteredColor: '#22c55e',
    progressColor: '#f59e0b',
    reviewColor: '#f59e0b',
    lockedColor: '#64748b',
    searchColor: '#fef08a',
    glowBase: 1,
    edgeBase: 1,
    sectorBase: 1,
  },
  {
    id: 'midnight',
    label: 'Midnight Calm',
    description: 'Dark, quieter, and less saturated.',
    accentMode: 'soft',
    accentMixColor: '#94a3b8',
    accentMixAmount: 0.42,
    monoAccent: '#94a3b8',
    canvasBackground: 'radial-gradient(ellipse at center, #172033 0%, #111827 52%, #080b12 100%)',
    canvasBase: '#080b12',
    panelBg: 'rgba(17, 24, 39, 0.92)',
    panelSoftBg: 'rgba(31, 41, 55, 0.76)',
    panelBorder: 'rgba(75, 85, 99, 0.62)',
    panelText: '#e5e7eb',
    panelMuted: '#9ca3af',
    inputBg: 'rgba(17, 24, 39, 0.48)',
    nodeShell: '#0b1120',
    nodeSurface: '#172033',
    nodeText: '#d1d5db',
    nodeTextStrong: '#f9fafb',
    edgeLabelText: '#d1d5db',
    edgeLabelBg: '#111827',
    minimapBg: '#111827',
    minimapMask: 'rgba(8, 11, 18, 0.48)',
    gridColor: '#33415566',
    orbitColor: '#cbd5e1',
    rootAccent: '#8b9ac7',
    rootSecondary: '#64748b',
    readyColor: '#7dd3fc',
    masteredColor: '#86efac',
    progressColor: '#fbbf24',
    reviewColor: '#fbbf24',
    lockedColor: '#6b7280',
    searchColor: '#fde68a',
    glowBase: 0.44,
    edgeBase: 0.82,
    sectorBase: 0.62,
  },
  {
    id: 'library',
    label: 'Library Light',
    description: 'Light, studious, and soft on glow.',
    accentMode: 'soft',
    accentMixColor: '#334155',
    accentMixAmount: 0.28,
    monoAccent: '#2563eb',
    canvasBackground: 'linear-gradient(180deg, #f8fafc 0%, #e8edf5 54%, #dbe4ee 100%)',
    canvasBase: '#f8fafc',
    panelBg: 'rgba(255, 255, 255, 0.92)',
    panelSoftBg: 'rgba(241, 245, 249, 0.88)',
    panelBorder: 'rgba(148, 163, 184, 0.56)',
    panelText: '#0f172a',
    panelMuted: '#475569',
    inputBg: 'rgba(255, 255, 255, 0.82)',
    nodeShell: '#e2e8f0',
    nodeSurface: '#ffffff',
    nodeText: '#1e293b',
    nodeTextStrong: '#0f172a',
    edgeLabelText: '#334155',
    edgeLabelBg: '#ffffff',
    minimapBg: '#f8fafc',
    minimapMask: 'rgba(148, 163, 184, 0.26)',
    gridColor: '#94a3b866',
    orbitColor: '#475569',
    rootAccent: '#475569',
    rootSecondary: '#64748b',
    readyColor: '#0284c7',
    masteredColor: '#15803d',
    progressColor: '#b45309',
    reviewColor: '#b45309',
    lockedColor: '#64748b',
    searchColor: '#ca8a04',
    glowBase: 0.2,
    edgeBase: 0.72,
    sectorBase: 0.5,
  },
  {
    id: 'contrast',
    label: 'High Contrast',
    description: 'Reduced color variety with strong outlines.',
    accentMode: 'mono',
    accentMixColor: '#ffffff',
    accentMixAmount: 0,
    monoAccent: '#f8fafc',
    canvasBackground: 'linear-gradient(180deg, #000000 0%, #09090b 100%)',
    canvasBase: '#000000',
    panelBg: 'rgba(0, 0, 0, 0.94)',
    panelSoftBg: 'rgba(24, 24, 27, 0.9)',
    panelBorder: 'rgba(244, 244, 245, 0.5)',
    panelText: '#f8fafc',
    panelMuted: '#d4d4d8',
    inputBg: 'rgba(24, 24, 27, 0.84)',
    nodeShell: '#000000',
    nodeSurface: '#111111',
    nodeText: '#f4f4f5',
    nodeTextStrong: '#ffffff',
    edgeLabelText: '#ffffff',
    edgeLabelBg: '#000000',
    minimapBg: '#09090b',
    minimapMask: 'rgba(0, 0, 0, 0.55)',
    gridColor: '#ffffff40',
    orbitColor: '#ffffff',
    rootAccent: '#ffffff',
    rootSecondary: '#a1a1aa',
    readyColor: '#ffffff',
    masteredColor: '#ffffff',
    progressColor: '#ffffff',
    reviewColor: '#ffffff',
    lockedColor: '#a1a1aa',
    searchColor: '#facc15',
    glowBase: 0.1,
    edgeBase: 1.12,
    sectorBase: 0.24,
  },
];

export function getGraphTheme(themeId: GraphThemeId): GraphTheme {
  return GRAPH_THEMES.find((theme) => theme.id === themeId) ?? GRAPH_THEMES[0];
}

export function getGraphFontFamily(fontId: GraphFontId): string {
  return GRAPH_FONT_OPTIONS.find((font) => font.id === fontId)?.family ?? GRAPH_FONT_OPTIONS[0].family;
}

export function alphaHex(opacity: number): string {
  return Math.round(clamp(opacity, 0, 1) * 255).toString(16).padStart(2, '0');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getStructureNodeSize(kind: 'root' | 'subject' | 'topic', settings: GraphDesignSettings): number {
  const base = kind === 'root' ? 396 : kind === 'subject' ? 308 : 212;
  return base * settings.structureScale;
}

export function getConceptNodeSize(difficulty: number, settings: GraphDesignSettings): number {
  const base = difficulty <= 2 ? 180 : difficulty <= 4 ? 240 : 300;
  return base * settings.conceptScale;
}

export function scaleOpacity(base: number, multiplier: number, min = 0, max = 1): number {
  return clamp(base * multiplier, min, max);
}

export function resolveGraphAccent(color: string | undefined, theme: GraphTheme): string {
  const fallback = theme.accentMode === 'mono' ? theme.monoAccent : '#64748b';
  if (theme.accentMode === 'mono') return theme.monoAccent;
  const normalized = normalizeHex(color) ?? fallback;
  if (theme.accentMode === 'soft') {
    return mixHex(normalized, theme.accentMixColor, theme.accentMixAmount);
  }
  return normalized;
}

export function normalizeHex(color: string | undefined): string | null {
  if (!color) return null;
  const trimmed = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [r, g, b] = trimmed.slice(1).split('');
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return null;
}

function mixHex(color: string, mixColor: string, amount: number): string {
  const first = hexToRgb(normalizeHex(color) ?? '#64748b');
  const second = hexToRgb(normalizeHex(mixColor) ?? '#64748b');
  const mix = clamp(amount, 0, 1);
  return rgbToHex({
    r: first.r * (1 - mix) + second.r * mix,
    g: first.g * (1 - mix) + second.g * mix,
    b: first.b * (1 - mix) + second.b * mix,
  });
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex) ?? '#64748b';
  return {
    r: parseInt(normalized.substring(1, 3), 16),
    g: parseInt(normalized.substring(3, 5), 16),
    b: parseInt(normalized.substring(5, 7), 16),
  };
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const toHex = (value: number) => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function loadGraphDesignSettings(): GraphDesignSettings {
  if (typeof window === 'undefined') return DEFAULT_GRAPH_DESIGN_SETTINGS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_GRAPH_DESIGN_SETTINGS;
    return sanitizeGraphDesignSettings(JSON.parse(stored));
  } catch {
    return DEFAULT_GRAPH_DESIGN_SETTINGS;
  }
}

export function persistGraphDesignSettings(settings: GraphDesignSettings) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export function sanitizeGraphDesignSettings(value: Partial<GraphDesignSettings>): GraphDesignSettings {
  const themeIds = new Set(GRAPH_THEMES.map((theme) => theme.id));
  const fontIds = new Set(GRAPH_FONT_OPTIONS.map((font) => font.id));

  return {
    themeId: value.themeId && themeIds.has(value.themeId) ? value.themeId : DEFAULT_GRAPH_DESIGN_SETTINGS.themeId,
    fontId: value.fontId && fontIds.has(value.fontId) ? value.fontId : DEFAULT_GRAPH_DESIGN_SETTINGS.fontId,
    conceptScale: clamp(Number(value.conceptScale ?? DEFAULT_GRAPH_DESIGN_SETTINGS.conceptScale), 0.65, 1.35),
    structureScale: clamp(Number(value.structureScale ?? DEFAULT_GRAPH_DESIGN_SETTINGS.structureScale), 0.7, 1.3),
    fontScale: clamp(Number(value.fontScale ?? DEFAULT_GRAPH_DESIGN_SETTINGS.fontScale), 0.75, 1.3),
    glowStrength: clamp(Number(value.glowStrength ?? DEFAULT_GRAPH_DESIGN_SETTINGS.glowStrength), 0, 1.5),
    edgeStrength: clamp(Number(value.edgeStrength ?? DEFAULT_GRAPH_DESIGN_SETTINGS.edgeStrength), 0.35, 1.5),
    backgroundIntensity: clamp(Number(value.backgroundIntensity ?? DEFAULT_GRAPH_DESIGN_SETTINGS.backgroundIntensity), 0, 1.4),
  };
}
