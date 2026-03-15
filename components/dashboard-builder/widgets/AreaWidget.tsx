"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DashboardWidget } from "@/lib/types";

const DEFAULT_COLORS = [
  "#2563eb", "#a855f7", "#22c55e", "#f59e0b",
  "#ef4444", "#06b6d4", "#ec4899", "#8b5cf6",
];

interface AreaWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

export default function AreaWidget({ widget, data }: AreaWidgetProps) {
  const { config } = widget;
  const colors = config.colors?.length ? config.colors : DEFAULT_COLORS;
  const xAxisKey = config.xAxisKey || "name";
  const yAxisKeys = config.yAxisKeys?.length
    ? config.yAxisKeys
    : data.length > 0
      ? Object.keys(data[0]).filter((k) => k !== xAxisKey && typeof data[0][k] === "number")
      : [];

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        {config.showGrid !== false && (
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        )}
        <XAxis
          dataKey={xAxisKey}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#64748b" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#64748b" }}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        {config.showLegend !== false && (
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: "11px" }}
          />
        )}
        {yAxisKeys.map((key, i) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
            fillOpacity={0.1}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
