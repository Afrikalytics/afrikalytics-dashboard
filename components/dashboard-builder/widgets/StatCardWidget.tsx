"use client";

import { TrendingUp, TrendingDown, Hash } from "lucide-react";
import type { DashboardWidget } from "@/lib/types";

interface StatCardWidgetProps {
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

export default function StatCardWidget({ widget, data }: StatCardWidgetProps) {
  const { config } = widget;
  const valueKey = config.valueKey || "value";
  const labelKey = config.labelKey || "label";
  const color = config.colors?.[0] || "#2563eb";

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  const current = data[0];
  const mainValue = current[valueKey];
  const label = (current[labelKey] as string) || widget.title;
  const trend = current["trend"] as number | undefined;

  return (
    <div className="flex flex-col justify-center h-full gap-1">
      <div className="flex items-center gap-2">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: color + "15", color }}
        >
          <Hash className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p className="text-2xl lg:text-3xl font-extrabold text-gray-900 tabular-nums mt-1">
        {formatValue(mainValue, config.format, config.unit)}
      </p>
      {trend !== undefined && (
        <div
          className={`flex items-center gap-1 text-xs font-semibold ${
            trend >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>
            {trend >= 0 ? "+" : ""}
            {trend}%
          </span>
        </div>
      )}
    </div>
  );
}
