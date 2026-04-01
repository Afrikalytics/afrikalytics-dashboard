'use client';

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
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

interface TreemapWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

interface TreemapContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  value: number;
  index: number;
  colors: string[];
}

function CustomContent({ x, y, width, height, name, value, index, colors }: TreemapContentProps) {
  const color = colors[index % colors.length];
  const showLabel = width > 40 && height > 30;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        rx={4}
        stroke="#fff"
        strokeWidth={2}
      />
      {showLabel && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 6}
            textAnchor="middle"
            fill="#fff"
            fontSize={11}
            fontWeight={600}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="rgba(255,255,255,0.8)"
            fontSize={10}
          >
            {value.toLocaleString('fr-FR')}
          </text>
        </>
      )}
    </g>
  );
}

export default function TreemapWidget({ widget, data }: TreemapWidgetProps) {
  const { config } = widget;
  const colors = config.colors?.length ? config.colors : DEFAULT_COLORS;
  const valueKey = config.valueKey || 'value';
  const labelKey = config.labelKey || 'name';

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  const treemapData = data.map((d) => ({
    name: String(d[labelKey] ?? ''),
    value: Number(d[valueKey] ?? 0),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={treemapData}
        dataKey="value"
        nameKey="name"
        content={
          <CustomContent
            x={0}
            y={0}
            width={0}
            height={0}
            name=""
            value={0}
            index={0}
            colors={colors}
          />
        }
      >
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
      </Treemap>
    </ResponsiveContainer>
  );
}
