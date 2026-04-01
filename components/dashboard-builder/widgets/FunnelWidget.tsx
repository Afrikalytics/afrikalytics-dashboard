'use client';

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

interface FunnelWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

export default function FunnelWidget({ widget, data }: FunnelWidgetProps) {
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

  const firstValue = Number(data[0][valueKey] ?? 1);

  return (
    <div className="flex flex-col justify-center h-full gap-1.5 px-2">
      {data.map((item, i) => {
        const value = Number(item[valueKey] ?? 0);
        const label = String(item[labelKey] ?? '');
        const pct = firstValue > 0 ? (value / firstValue) * 100 : 0;
        const widthPct = Math.max(pct, 15); // min 15% width for readability
        const color = colors[i % colors.length];

        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className="rounded-md px-3 py-1.5 text-white text-xs font-semibold truncate transition-all"
              style={{
                width: `${widthPct}%`,
                backgroundColor: color,
                minWidth: '60px',
              }}
              title={`${label}: ${value.toLocaleString('fr-FR')}`}
            >
              {label}
            </div>
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="text-sm font-bold text-gray-800 tabular-nums">
                {value.toLocaleString('fr-FR')}
              </span>
              {i > 0 && <span className="text-xs text-gray-400">({pct.toFixed(0)}%)</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
