'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
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

interface ScatterWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

export default function ScatterWidget({ widget, data }: ScatterWidgetProps) {
  const { config } = widget;
  const colors = config.colors?.length ? config.colors : DEFAULT_COLORS;
  const xAxisKey = config.xAxisKey || 'x';
  const yAxisKey = (config.yAxisKeys?.length ? config.yAxisKeys[0] : null) || 'y';

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  const hasZ = data.some((d) => typeof d['z'] === 'number');

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        {config.showGrid !== false && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
        <XAxis
          dataKey={xAxisKey}
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          name={xAxisKey}
        />
        <YAxis
          dataKey={yAxisKey}
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          name={yAxisKey}
        />
        {hasZ && <ZAxis dataKey="z" range={[40, 400]} name="z" />}
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          cursor={{ strokeDasharray: '3 3' }}
        />
        <Scatter data={data} fill={colors[0]} fillOpacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
