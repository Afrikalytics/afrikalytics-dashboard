"use client";

import { Target } from "lucide-react";
import type { DashboardWidget } from "@/lib/types";

interface KPIWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

function formatValue(
  value: unknown,
  format?: "number" | "currency" | "percent",
  unit?: string
): string {
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return String(value ?? "—");

  switch (format) {
    case "currency":
      return num.toLocaleString("fr-FR") + " " + (unit || "FCFA");
    case "percent":
      return num.toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + "%";
    default:
      return num.toLocaleString("fr-FR") + (unit ? ` ${unit}` : "");
  }
}

export default function KPIWidget({ widget, data }: KPIWidgetProps) {
  const { config } = widget;
  const valueKey = config.valueKey || "value";
  const color = config.colors?.[0] || "#2563eb";

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  const current = data[0];
  const value = Number(current[valueKey] ?? 0);
  const target = Number(current["target"] ?? 100);
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;

  // Color based on progress
  const progressColor =
    percentage >= 80 ? "#22c55e" : percentage >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col justify-center h-full gap-2">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4" style={{ color }} />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {(current["label"] as string) || widget.title}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-extrabold text-gray-900 tabular-nums">
          {formatValue(value, config.format, config.unit)}
        </span>
        <span className="text-sm text-gray-400">
          / {formatValue(target, config.format, config.unit)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 mt-1">
        <div
          className="h-2.5 rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>

      <p className="text-xs text-gray-500">
        {percentage.toFixed(0)}% de l&apos;objectif atteint
      </p>
    </div>
  );
}
