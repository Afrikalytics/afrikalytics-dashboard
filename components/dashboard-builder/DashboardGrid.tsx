"use client";

import type { DashboardLayout, DashboardWidget } from "@/lib/types";
import WidgetRenderer from "./WidgetRenderer";

interface DashboardGridProps {
  layout: DashboardLayout;
  data: Record<string, Record<string, unknown>[]>; // widgetId -> data
  isEditing?: boolean;
  onWidgetClick?: (widget: DashboardWidget) => void;
}

export default function DashboardGrid({
  layout,
  data,
  isEditing,
  onWidgetClick,
}: DashboardGridProps) {
  if (!layout.widgets.length) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm">
        Aucun widget. Utilisez la palette pour en ajouter.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 auto-rows-[200px]">
      {layout.widgets.map((widget) => (
        <div
          key={widget.id}
          style={{
            gridColumn: `${widget.position.x + 1} / span ${widget.position.w}`,
            gridRow: `${widget.position.y + 1} / span ${widget.position.h}`,
          }}
          onClick={() => onWidgetClick?.(widget)}
        >
          <WidgetRenderer
            widget={widget}
            data={data[widget.id] || []}
            isEditing={isEditing}
          />
        </div>
      ))}
    </div>
  );
}
