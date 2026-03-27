"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";

// -----------------------------------------------------------------------------
// Custom Recharts Tooltip
// -----------------------------------------------------------------------------

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, i: number) => (
        <p key={i} className="text-surface-300">
          {entry.name}: <span className="text-white font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// ActivityChart — extracted for code splitting (recharts is heavy)
// -----------------------------------------------------------------------------

interface ActivityChartProps {
  data: Array<{ day: string; date: string; études: number; insights: number }>;
}

export default function ActivityChart({ data }: ActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradientEtudes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradientInsights" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="études"
          name="Études"
          stroke="#2563eb"
          strokeWidth={2}
          fill="url(#gradientEtudes)"
          dot={false}
          activeDot={{ r: 4, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="insights"
          name="Insights"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#gradientInsights)"
          dot={false}
          activeDot={{ r: 4, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
