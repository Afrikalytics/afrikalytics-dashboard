"use client";

import dynamic from "next/dynamic";
import type { DashboardWidget } from "@/lib/types";

// Skeleton shown while a widget chunk loads
const WidgetSkeleton = () => (
  <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />
);

// Lazy-loaded widget components — each chart lib chunk loads on demand
const ChartWidgets: Record<
  string,
  React.ComponentType<{ widget: DashboardWidget; data: Record<string, unknown>[] }>
> = {
  bar: dynamic(() => import("./widgets/BarWidget"), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{ widget: DashboardWidget; data: Record<string, unknown>[] }>,
  line: dynamic(() => import("./widgets/LineWidget"), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{ widget: DashboardWidget; data: Record<string, unknown>[] }>,
  area: dynamic(() => import("./widgets/AreaWidget"), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{ widget: DashboardWidget; data: Record<string, unknown>[] }>,
  pie: dynamic(() => import("./widgets/PieWidget"), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{ widget: DashboardWidget; data: Record<string, unknown>[] }>,
  "stat-card": dynamic(() => import("./widgets/StatCardWidget"), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{ widget: DashboardWidget; data: Record<string, unknown>[] }>,
  kpi: dynamic(() => import("./widgets/KPIWidget"), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{ widget: DashboardWidget; data: Record<string, unknown>[] }>,
  table: dynamic(() => import("./widgets/TableWidget"), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{ widget: DashboardWidget; data: Record<string, unknown>[] }>,
};

interface WidgetRendererProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
  isEditing?: boolean;
}

export default function WidgetRenderer({
  widget,
  data,
  isEditing,
}: WidgetRendererProps) {
  const WidgetComponent = ChartWidgets[widget.type];

  if (!WidgetComponent) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-center h-full text-sm text-gray-400">
        Type non supporté : {widget.type}
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border p-4 h-full flex flex-col ${
        isEditing ? "ring-2 ring-primary-500 cursor-pointer" : ""
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-2 shrink-0">
        {widget.title}
      </h3>
      {widget.description && (
        <p className="text-xs text-gray-400 mb-2 shrink-0">{widget.description}</p>
      )}
      <div className="flex-1 min-h-0">
        <WidgetComponent widget={widget} data={data} />
      </div>
    </div>
  );
}
