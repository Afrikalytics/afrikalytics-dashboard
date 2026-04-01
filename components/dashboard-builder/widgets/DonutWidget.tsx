'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

interface DonutWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

export default function DonutWidget({ widget, data }: DonutWidgetProps) {
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

  const total = data.reduce((sum, d) => sum + Number(d[valueKey] ?? 0), 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabel = (props: any) => {
    const cx = Number(props.cx ?? 0);
    const cy = Number(props.cy ?? 0);
    const midAngle = Number(props.midAngle ?? 0);
    const innerRadius = Number(props.innerRadius ?? 0);
    const outerRadius = Number(props.outerRadius ?? 0);
    const index = Number(props.index ?? 0);
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const pct = total > 0 ? ((Number(data[index][valueKey]) / total) * 100).toFixed(0) : '0';
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {pct}%
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          paddingAngle={3}
          dataKey={valueKey}
          nameKey={labelKey}
          stroke="none"
          label={renderLabel}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
        {config.showLegend !== false && (
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: '11px' }}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}
