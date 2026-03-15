"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader } from "./Card";

// =============================================================================
// Chart — Design System (Corporate Premium)
// =============================================================================
// Wrappers Recharts avec le thème Afrikalytics corporate
// Exports : AreaChartCard, BarChartCard, PieChartCard
// Couleurs : primary-600, accent-500, success-500, warning-500
// Style : grille subtile, légende en bas, tooltip arrondi
// =============================================================================

const THEME_COLORS = [
  "#2563eb", // primary-600
  "#a855f7", // accent-500
  "#22c55e", // success-500
  "#f59e0b", // warning-500
  "#ef4444", // danger-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
  "#8b5cf6", // violet-500
];

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

// Custom tooltip style
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-medium border border-surface-100 px-4 py-3">
      {label && (
        <p className="text-xs font-medium text-surface-500 mb-1.5">{label}</p>
      )}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-surface-600">{entry.name}:</span>
          <span className="font-semibold text-surface-900 tabular-nums">
            {typeof entry.value === "number"
              ? entry.value.toLocaleString("fr-FR")
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// AreaChartCard
// =============================================================================

interface AreaChartCardProps extends ChartCardProps {
  data: Record<string, unknown>[];
  dataKeys: string[];
  xAxisKey: string;
  height?: number;
  stacked?: boolean;
  colors?: string[];
}

export function AreaChartCard({
  title,
  subtitle,
  icon,
  action,
  data,
  dataKeys,
  xAxisKey,
  height = 320,
  stacked = false,
  colors = THEME_COLORS,
  className = "",
}: AreaChartCardProps) {
  return (
    <Card variant="default" padding="md" className={className}>
      <CardHeader title={title} subtitle={subtitle} icon={icon} action={action} />
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
          />
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId={stacked ? "stack" : undefined}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.1}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

// =============================================================================
// BarChartCard
// =============================================================================

interface BarChartCardProps extends ChartCardProps {
  data: Record<string, unknown>[];
  dataKeys: string[];
  xAxisKey: string;
  height?: number;
  stacked?: boolean;
  colors?: string[];
}

export function BarChartCard({
  title,
  subtitle,
  icon,
  action,
  data,
  dataKeys,
  xAxisKey,
  height = 320,
  stacked = false,
  colors = THEME_COLORS,
  className = "",
}: BarChartCardProps) {
  return (
    <Card variant="default" padding="md" className={className}>
      <CardHeader title={title} subtitle={subtitle} icon={icon} action={action} />
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
          />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={stacked ? "stack" : undefined}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// =============================================================================
// PieChartCard
// =============================================================================

interface PieChartCardProps extends ChartCardProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
}

export function PieChartCard({
  title,
  subtitle,
  icon,
  action,
  data,
  height = 320,
  innerRadius = 60,
  outerRadius = 100,
  colors = THEME_COLORS,
  className = "",
}: PieChartCardProps) {
  return (
    <Card variant="default" padding="md" className={className}>
      <CardHeader title={title} subtitle={subtitle} icon={icon} action={action} />
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
