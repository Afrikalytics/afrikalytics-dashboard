'use client';

import dynamic from 'next/dynamic';
import type { DashboardWidget } from '@/lib/types';

// Skeleton shown while a widget chunk loads
const WidgetSkeleton = () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />;

// Lazy-loaded widget components — each chart lib chunk loads on demand
const ChartWidgets: Record<
  string,
  React.ComponentType<{ widget: DashboardWidget; data: Record<string, unknown>[] }>
> = {
  bar: dynamic(() => import('./widgets/BarWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  line: dynamic(() => import('./widgets/LineWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  area: dynamic(() => import('./widgets/AreaWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  pie: dynamic(() => import('./widgets/PieWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  'stat-card': dynamic(() => import('./widgets/StatCardWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  kpi: dynamic(() => import('./widgets/KPIWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  table: dynamic(() => import('./widgets/TableWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  donut: dynamic(() => import('./widgets/DonutWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  scatter: dynamic(() => import('./widgets/ScatterWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  radar: dynamic(() => import('./widgets/RadarWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  funnel: dynamic(() => import('./widgets/FunnelWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  gauge: dynamic(() => import('./widgets/GaugeWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  heatmap: dynamic(() => import('./widgets/HeatmapWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  treemap: dynamic(() => import('./widgets/TreemapWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  map: dynamic(() => import('./widgets/MapWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
  text: dynamic(() => import('./widgets/TextWidget'), {
    ssr: false,
    loading: WidgetSkeleton,
  }) as unknown as React.ComponentType<{
    widget: DashboardWidget;
    data: Record<string, unknown>[];
  }>,
};

interface WidgetRendererProps {
  widget: DashboardWidget;
  data: Record<string, unknown>[];
  isEditing?: boolean;
}

export default function WidgetRenderer({ widget, data, isEditing }: WidgetRendererProps) {
  const WidgetComponent = ChartWidgets[widget.type];

  if (!WidgetComponent) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-center h-full text-sm text-gray-400">
        Type non supporté : {widget.type}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {widget.description && (
        <p className="text-xs text-gray-400 mb-1 shrink-0 px-0">{widget.description}</p>
      )}
      <div className="flex-1 min-h-0">
        <WidgetComponent widget={widget} data={data} />
      </div>
    </div>
  );
}
