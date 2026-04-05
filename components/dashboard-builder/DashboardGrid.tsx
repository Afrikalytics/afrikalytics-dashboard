"use client";

import React, { useMemo, useCallback } from "react";
import {
  ResponsiveGridLayout,
  useContainerWidth,
  verticalCompactor,
  type LayoutItem,
  type Layout,
} from "react-grid-layout";
import type { DashboardLayout, DashboardWidget, ChartType } from "@/lib/types";
import WidgetRenderer from "./WidgetRenderer";
import WidgetWrapper from "./WidgetWrapper";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

/** Minimum widget sizes per type */
const MIN_SIZES: Partial<Record<ChartType, { minW: number; minH: number }>> = {
  "stat-card": { minW: 2, minH: 1 },
  kpi: { minW: 2, minH: 1 },
  gauge: { minW: 2, minH: 1 },
  text: { minW: 2, minH: 1 },
  table: { minW: 3, minH: 2 },
  map: { minW: 4, minH: 2 },
  heatmap: { minW: 4, minH: 2 },
};

const DEFAULT_MIN = { minW: 2, minH: 1 };

interface DashboardGridProps {
  layout: DashboardLayout;
  data: Record<string, Record<string, unknown>[]>;
  isEditing?: boolean;
  onLayoutChange: (widgets: DashboardWidget[]) => void;
  onDeleteWidget: (id: string) => void;
  onDuplicateWidget: (id: string) => void;
  onDropWidget?: (type: ChartType, x: number, y: number) => void;
}

export default function DashboardGrid({
  layout,
  data,
  isEditing = false,
  onLayoutChange,
  onDeleteWidget,
  onDuplicateWidget,
  onDropWidget,
}: DashboardGridProps) {
  const { width, containerRef: rawRef, mounted } = useContainerWidth({ initialWidth: 1200 });
  // Cast needed: react-grid-layout v2 returns RefObject<HTMLDivElement | null>
  // but React 18 @types/react expects RefObject<HTMLDivElement>
  const containerRef = rawRef as React.RefObject<HTMLDivElement>;

  // Convert widgets to react-grid-layout format
  const gridLayout = useMemo<Layout>(
    () =>
      layout.widgets.map((w): LayoutItem => {
        const mins = MIN_SIZES[w.type] ?? DEFAULT_MIN;
        return {
          i: w.id,
          x: w.position.x,
          y: w.position.y,
          w: w.position.w,
          h: w.position.h,
          minW: mins.minW,
          minH: mins.minH,
          static: !isEditing,
        };
      }),
    [layout.widgets, isEditing],
  );

  // Sync RGL layout changes back to widget positions
  const handleLayoutChange = useCallback(
    (newLayout: Layout, _allLayouts: Partial<Record<string, Layout>>) => {
      const positionMap = new Map(
        newLayout.map((item) => [
          item.i,
          { x: item.x, y: item.y, w: item.w, h: item.h },
        ]),
      );

      const updated = layout.widgets.map((widget) => {
        const pos = positionMap.get(widget.id);
        if (!pos) return widget;
        if (
          pos.x === widget.position.x &&
          pos.y === widget.position.y &&
          pos.w === widget.position.w &&
          pos.h === widget.position.h
        ) {
          return widget;
        }
        return { ...widget, position: pos };
      });

      const hasChanges = updated.some((w, i) => w !== layout.widgets[i]);
      if (hasChanges) {
        onLayoutChange(updated);
      }
    },
    [layout.widgets, onLayoutChange],
  );

  // Handle drop from palette
  const handleDrop = useCallback(
    (_newLayout: Layout, item: LayoutItem | undefined, e: Event) => {
      const dragEvent = e as DragEvent;
      const widgetType = dragEvent.dataTransfer?.getData("widgetType") as ChartType | undefined;
      if (widgetType && onDropWidget && item) {
        onDropWidget(widgetType, item.x, item.y);
      }
    },
    [onDropWidget],
  );

  if (!layout.widgets.length && !isEditing) {
    return (
      <div ref={containerRef}>
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm">
          Aucun widget. Utilisez la palette pour en ajouter.
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {mounted && (
        <ResponsiveGridLayout
          className="dashboard-grid"
          width={width}
          layouts={{ lg: gridLayout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={180}
          compactor={verticalCompactor}
          dragConfig={{
            enabled: isEditing,
            handle: ".widget-drag-handle",
          }}
          resizeConfig={{
            enabled: isEditing,
            handles: ["se", "e", "s"],
          }}
          dropConfig={{
            enabled: isEditing,
          }}
          onLayoutChange={handleLayoutChange}
          onDrop={handleDrop}
          droppingItem={{ i: "__dropping-elem__", w: 4, h: 2, x: 0, y: 0 }}
          margin={[16, 16] as const}
        >
          {layout.widgets.map((widget) => (
            <div key={widget.id}>
              <WidgetWrapper
                id={widget.id}
                title={widget.title}
                isEditing={isEditing}
                onDelete={onDeleteWidget}
                onDuplicate={onDuplicateWidget}
              >
                <WidgetRenderer
                  widget={widget}
                  data={data[widget.id] || []}
                  isEditing={isEditing}
                />
              </WidgetWrapper>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
