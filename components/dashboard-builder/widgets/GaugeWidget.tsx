'use client';

import type { DashboardWidget } from '@/lib/types';

interface GaugeWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

export default function GaugeWidget({ widget, data }: GaugeWidgetProps) {
  const { config } = widget;
  const valueKey = config.valueKey || 'value';

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  const current = data[0];
  const value = Number(current[valueKey] ?? 0);
  const max = Number(current['target'] ?? 100);
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const label = String(current['label'] ?? widget.title);

  // Arc color by threshold
  const arcColor = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  // SVG semi-circle gauge
  const cx = 100;
  const cy = 90;
  const r = 70;
  const startAngle = Math.PI;
  const endAngle = 0;
  const sweepAngle = startAngle - (startAngle - endAngle) * (pct / 100);

  const arcStartX = cx + r * Math.cos(startAngle);
  const arcStartY = cy - r * Math.sin(startAngle);
  const arcEndX = cx + r * Math.cos(sweepAngle);
  const arcEndY = cy - r * Math.sin(sweepAngle);
  const largeArc = pct > 50 ? 1 : 0;

  const bgEndX = cx + r * Math.cos(endAngle);
  const bgEndY = cy - r * Math.sin(endAngle);

  const formatValue = (v: number): string => {
    if (config.format === 'currency') {
      return v.toLocaleString('fr-FR') + ' ' + (config.unit || 'FCFA');
    }
    if (config.format === 'percent') {
      return v.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + '%';
    }
    return v.toLocaleString('fr-FR') + (config.unit ? ` ${config.unit}` : '');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <svg viewBox="0 0 200 110" className="w-full max-w-[200px]">
        {/* Background arc */}
        <path
          d={`M ${arcStartX} ${arcStartY} A ${r} ${r} 0 1 1 ${bgEndX} ${bgEndY}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {pct > 0 && (
          <path
            d={`M ${arcStartX} ${arcStartY} A ${r} ${r} 0 ${largeArc} 1 ${arcEndX} ${arcEndY}`}
            fill="none"
            stroke={arcColor}
            strokeWidth={14}
            strokeLinecap="round"
          />
        )}
        {/* Center value */}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={18} fontWeight={700} fill="#1e293b">
          {formatValue(value)}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={10} fill="#94a3b8">
          / {formatValue(max)}
        </text>
      </svg>
      <p className="text-xs font-medium text-gray-500 mt-1 text-center">{label}</p>
    </div>
  );
}
