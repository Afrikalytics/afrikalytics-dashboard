'use client';

import { useState } from 'react';
import type { DashboardWidget } from '@/lib/types';

interface MapWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

// Simplified SVG paths for West African countries (viewBox 0 0 400 350)
const COUNTRIES: Record<string, { path: string; cx: number; cy: number }> = {
  Sénégal: {
    path: 'M30,120 L80,100 L100,110 L110,130 L90,150 L50,150 Z',
    cx: 70,
    cy: 125,
  },
  Mali: {
    path: 'M110,50 L200,40 L220,80 L210,140 L160,160 L110,130 L100,110 L110,80 Z',
    cx: 160,
    cy: 100,
  },
  Guinée: {
    path: 'M40,155 L90,150 L110,155 L120,175 L80,190 L50,180 Z',
    cx: 80,
    cy: 170,
  },
  'Burkina Faso': {
    path: 'M160,160 L210,140 L240,150 L250,180 L220,200 L180,195 L160,175 Z',
    cx: 200,
    cy: 170,
  },
  Niger: {
    path: 'M220,40 L320,30 L340,80 L310,130 L260,140 L240,150 L220,80 Z',
    cx: 280,
    cy: 85,
  },
  "Côte d'Ivoire": {
    path: 'M120,195 L160,175 L180,195 L190,230 L170,260 L130,260 L110,230 Z',
    cx: 150,
    cy: 225,
  },
  Togo: {
    path: 'M225,200 L240,200 L245,260 L230,260 Z',
    cx: 235,
    cy: 230,
  },
  Bénin: {
    path: 'M250,180 L275,170 L280,200 L270,260 L250,260 L245,200 Z',
    cx: 262,
    cy: 220,
  },
};

export default function MapWidget({ widget, data }: MapWidgetProps) {
  const { config } = widget;
  const [hovered, setHovered] = useState<string | null>(null);
  const valueKey = config.valueKey || 'value';
  const labelKey = config.labelKey || 'name';

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  // Build country -> value lookup
  const countryValues: Record<string, number> = {};
  for (const d of data) {
    countryValues[String(d[labelKey])] = Number(d[valueKey] ?? 0);
  }
  const maxVal = Math.max(...Object.values(countryValues), 1);
  const baseColor = config.colors?.[0] || '#2563eb';

  const hexToRgb = (hex: string) => {
    const h = hex.replace('#', '');
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16),
    };
  };
  const rgb = hexToRgb(baseColor);

  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {Object.entries(COUNTRIES).map(([name, { path }]) => {
          const val = countryValues[name] ?? 0;
          const intensity = maxVal > 0 ? val / maxVal : 0;
          const fillOpacity = val > 0 ? 0.15 + intensity * 0.85 : 0.08;

          return (
            <path
              key={name}
              d={path}
              fill={`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${fillOpacity})`}
              stroke="#94a3b8"
              strokeWidth={1}
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        {/* Country labels */}
        {Object.entries(COUNTRIES).map(([name, { cx, cy }]) => (
          <text
            key={`lbl-${name}`}
            x={cx}
            y={cy}
            textAnchor="middle"
            fontSize={8}
            fill="#475569"
            fontWeight={500}
          >
            {name.length > 8 ? name.slice(0, 7) + '.' : name}
          </text>
        ))}
      </svg>
      {/* Tooltip overlay */}
      {hovered && (
        <div className="absolute top-2 right-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-xs">
          <p className="font-semibold text-gray-800">{hovered}</p>
          <p className="text-gray-500">
            {(countryValues[hovered] ?? 0).toLocaleString('fr-FR')}
            {config.unit ? ` ${config.unit}` : ''}
          </p>
        </div>
      )}
    </div>
  );
}
