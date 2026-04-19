"use client";

import React, { useState, type CSSProperties } from 'react';
import {
  CircleDot,
  Grid3X3,
  Network,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Type,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  GRAPH_FONT_OPTIONS,
  GRAPH_THEMES,
  type GraphDesignSettings,
  type GraphFontId,
  type GraphTheme,
  type GraphThemeId,
  sanitizeGraphDesignSettings,
} from './design-settings';

interface DesignMenuProps {
  settings: GraphDesignSettings;
  theme: GraphTheme;
  onSettingsChange: (settings: GraphDesignSettings) => void;
  onReset: () => void;
}

interface RangeControlProps {
  id: keyof GraphDesignSettings;
  icon: LucideIcon;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  valueLabel: string;
  theme: GraphTheme;
  onChange: (value: number) => void;
}

function RangeControl({
  id,
  icon: Icon,
  label,
  min,
  max,
  step,
  value,
  valueLabel,
  theme,
  onChange,
}: RangeControlProps) {
  return (
    <label htmlFor={id} className="grid gap-1.5">
      <span className="flex items-center justify-between gap-3 text-xs font-medium" style={{ color: theme.panelText }}>
        <span className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" style={{ color: theme.panelMuted }} />
          {label}
        </span>
        <span className="tabular-nums" style={{ color: theme.panelMuted }}>
          {valueLabel}
        </span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer rounded-full bg-slate-700/40"
        style={{ accentColor: theme.rootAccent }}
      />
    </label>
  );
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function DesignMenu({ settings, theme, onSettingsChange, onReset }: DesignMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const panelStyle: CSSProperties = {
    backgroundColor: theme.panelBg,
    borderColor: theme.panelBorder,
    color: theme.panelText,
  };

  const softPanelStyle: CSSProperties = {
    backgroundColor: theme.panelSoftBg,
    borderColor: theme.panelBorder,
  };

  const update = <K extends keyof GraphDesignSettings>(key: K, value: GraphDesignSettings[K]) => {
    onSettingsChange(sanitizeGraphDesignSettings({ ...settings, [key]: value }));
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-1.5 shadow-lg"
        style={panelStyle}
        title="Open graph design controls"
      >
        <Palette className="h-3.5 w-3.5" />
        Design
        <SlidersHorizontal className="h-3.5 w-3.5" style={{ color: theme.panelMuted }} />
      </Button>

      {isOpen && (
        <div
          className="w-[min(340px,calc(100vw-2rem))] rounded-lg border p-3 shadow-2xl backdrop-blur"
          style={panelStyle}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-none" style={{ color: theme.panelText }}>
                Graph Design
              </p>
              <p className="mt-1 text-xs" style={{ color: theme.panelMuted }}>
                Theme, scale, typography, and glow.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="h-8 w-8 shrink-0"
              style={{ color: theme.panelMuted }}
              title="Reset graph design"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <span className="flex items-center gap-2 text-xs font-medium" style={{ color: theme.panelText }}>
                <Palette className="h-3.5 w-3.5" style={{ color: theme.panelMuted }} />
                Theme
              </span>
              <Select value={settings.themeId} onValueChange={(value) => update('themeId', value as GraphThemeId)}>
                <SelectTrigger
                  className="h-9 border text-sm"
                  style={{ ...softPanelStyle, color: theme.panelText }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: theme.panelBg, borderColor: theme.panelBorder, color: theme.panelText }}>
                  {GRAPH_THEMES.map((themeOption) => (
                    <SelectItem key={themeOption.id} value={themeOption.id}>
                      <span className="flex items-center gap-2">
                        <span className="flex gap-0.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: themeOption.rootAccent }} />
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: themeOption.readyColor }} />
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: themeOption.nodeSurface }} />
                        </span>
                        {themeOption.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs" style={{ color: theme.panelMuted }}>
                {theme.description}
              </p>
            </div>

            <div className="grid gap-1.5">
              <span className="flex items-center gap-2 text-xs font-medium" style={{ color: theme.panelText }}>
                <Type className="h-3.5 w-3.5" style={{ color: theme.panelMuted }} />
                Font
              </span>
              <Select value={settings.fontId} onValueChange={(value) => update('fontId', value as GraphFontId)}>
                <SelectTrigger
                  className="h-9 border text-sm"
                  style={{ ...softPanelStyle, color: theme.panelText }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: theme.panelBg, borderColor: theme.panelBorder, color: theme.panelText }}>
                  {GRAPH_FONT_OPTIONS.map((fontOption) => (
                    <SelectItem key={fontOption.id} value={fontOption.id}>
                      <span style={{ fontFamily: fontOption.family }}>{fontOption.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 rounded-lg border p-3" style={softPanelStyle}>
              <RangeControl
                id="conceptScale"
                icon={CircleDot}
                label="Concept size"
                min={0.65}
                max={1.35}
                step={0.05}
                value={settings.conceptScale}
                valueLabel={percent(settings.conceptScale)}
                theme={theme}
                onChange={(value) => update('conceptScale', value)}
              />
              <RangeControl
                id="structureScale"
                icon={Network}
                label="Subject/topic size"
                min={0.7}
                max={1.3}
                step={0.05}
                value={settings.structureScale}
                valueLabel={percent(settings.structureScale)}
                theme={theme}
                onChange={(value) => update('structureScale', value)}
              />
              <RangeControl
                id="fontScale"
                icon={Type}
                label="Label size"
                min={0.75}
                max={1.3}
                step={0.05}
                value={settings.fontScale}
                valueLabel={percent(settings.fontScale)}
                theme={theme}
                onChange={(value) => update('fontScale', value)}
              />
              <RangeControl
                id="glowStrength"
                icon={Sparkles}
                label="Glow"
                min={0}
                max={1.5}
                step={0.05}
                value={settings.glowStrength}
                valueLabel={percent(settings.glowStrength)}
                theme={theme}
                onChange={(value) => update('glowStrength', value)}
              />
              <RangeControl
                id="edgeStrength"
                icon={SlidersHorizontal}
                label="Connections"
                min={0.35}
                max={1.5}
                step={0.05}
                value={settings.edgeStrength}
                valueLabel={percent(settings.edgeStrength)}
                theme={theme}
                onChange={(value) => update('edgeStrength', value)}
              />
              <RangeControl
                id="backgroundIntensity"
                icon={Grid3X3}
                label="Background"
                min={0}
                max={1.4}
                step={0.05}
                value={settings.backgroundIntensity}
                valueLabel={percent(settings.backgroundIntensity)}
                theme={theme}
                onChange={(value) => update('backgroundIntensity', value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
