"use client";

import type { DashboardWidget } from "@/lib/types";

interface TableWidgetProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
}

function formatCell(
  value: unknown,
  format?: "number" | "currency" | "percent",
  unit?: string
): string {
  if (value === null || value === undefined) return "—";
  if (typeof value !== "number") return String(value);

  switch (format) {
    case "currency":
      return value.toLocaleString("fr-FR") + " " + (unit || "FCFA");
    case "percent":
      return value.toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + "%";
    default:
      return value.toLocaleString("fr-FR");
  }
}

export default function TableWidget({ widget, data }: TableWidgetProps) {
  const { config } = widget;

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  // Use configured columns or all keys from first row
  const columns =
    widget.dataSource.columns.length > 0
      ? widget.dataSource.columns
      : Object.keys(data[0]);

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col}
                className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 px-3"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="py-2 px-3 text-gray-700 tabular-nums"
                >
                  {formatCell(row[col], config.format, config.unit)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
