"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DashboardWidget } from "@/lib/types";

const DEFAULT_COLORS = [
  "#2563eb", "#a855f7", "#22c55e", "#f59e0b",
  "#ef4444", "#06b6d4", "#ec4899", "#8b5cf6",
];

interface PieWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

export default function PieWidget({ widget, data }: PieWidgetProps) {
  const { config } = widget;
  const colors = config.colors?.length ? config.colors : DEFAULT_COLORS;
  const valueKey = config.valueKey || "value";
  const labelKey = config.labelKey || "name";

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="70%"
          paddingAngle={2}
          dataKey={valueKey}
          nameKey={labelKey}
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
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
      </PieChart>
    </ResponsiveContainer>
  );
}
