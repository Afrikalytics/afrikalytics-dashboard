'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DashboardWidget } from '@/lib/types';

const DEFAULT_COLORS = [
  '#2563eb',
  '#a855f7',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#8b5cf6',
];

interface RadarWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

export default function RadarWidget({ widget, data }: RadarWidgetProps) {
  const { config } = widget;
  const colors = config.colors?.length ? config.colors : DEFAULT_COLORS;
  const labelKey = config.labelKey || config.xAxisKey || 'name';

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  // Auto-detect numeric fields for radar axes
  const numericKeys = config.yAxisKeys?.length
    ? config.yAxisKeys
    : Object.keys(data[0]).filter((k) => k !== labelKey && typeof data[0][k] === 'number');

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey={labelKey} tick={{ fontSize: 11, fill: '#64748b' }} />
        <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
        {numericKeys.map((key, i) => (
          <Radar
            key={key}
            name={key}
            dataKey={key}
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
            fillOpacity={0.3}
          />
        ))}
        {config.showLegend !== false && numericKeys.length > 1 && (
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: '11px' }}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}
