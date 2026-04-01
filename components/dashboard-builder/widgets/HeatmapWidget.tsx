'use client';

import type { DashboardWidget } from '@/lib/types';

interface HeatmapWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

export default function HeatmapWidget({ widget, data }: HeatmapWidgetProps) {
  const { config } = widget;

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  const keys = Object.keys(data[0]);
  const rowKey = keys[0] || 'row';
  const colKey = keys[1] || 'col';
  const valueKey = config.valueKey || keys[2] || 'value';

  const rows = [...new Set(data.map((d) => String(d[rowKey])))];
  const cols = [...new Set(data.map((d) => String(d[colKey])))];

  const values = data.map((d) => Number(d[valueKey] ?? 0));
  const maxVal = Math.max(...values, 1);

  // Build lookup: row-col -> value
  const lookup: Record<string, number> = {};
  for (const d of data) {
    lookup[`${d[rowKey]}-${d[colKey]}`] = Number(d[valueKey] ?? 0);
  }

  const baseColor = config.colors?.[0] || '#2563eb';

  // Convert hex to RGB for interpolation
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
    <div className="h-full overflow-auto">
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `auto repeat(${cols.length}, 1fr)`,
        }}
      >
        {/* Header row */}
        <div />
        {cols.map((col) => (
          <div
            key={col}
            className="text-[10px] text-gray-500 text-center truncate px-0.5 font-medium"
          >
            {col}
          </div>
        ))}

        {/* Data rows */}
        {rows.map((row) => (
          <>
            <div
              key={`label-${row}`}
              className="text-[10px] text-gray-500 truncate pr-1 flex items-center font-medium"
            >
              {row}
            </div>
            {cols.map((col) => {
              const val = lookup[`${row}-${col}`] ?? 0;
              const intensity = maxVal > 0 ? val / maxVal : 0;
              return (
                <div
                  key={`${row}-${col}`}
                  className="aspect-square rounded-sm flex items-center justify-center text-[9px] font-semibold"
                  style={{
                    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.1 + intensity * 0.9})`,
                    color: intensity > 0.5 ? '#fff' : '#64748b',
                  }}
                  title={`${row} / ${col}: ${val.toLocaleString('fr-FR')}`}
                >
                  {val > 0 ? val : ''}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
