"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Save, LayoutDashboard, LayoutTemplate } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import type { ChartType, DashboardLayout, DashboardWidget } from "@/lib/types";
import { DashboardGrid, WidgetPalette } from "@/components/dashboard-builder";
import { getTemplateById, getTemplateDemoData } from "@/lib/templates";

// =============================================================================
// Demo data — used to populate widgets with sample content
// =============================================================================

const DEMO_BAR_DATA = [
  { name: "Jan", ventes: 4200, objectif: 5000 },
  { name: "Fév", ventes: 5800, objectif: 5000 },
  { name: "Mar", ventes: 4900, objectif: 5500 },
  { name: "Avr", ventes: 6100, objectif: 5500 },
  { name: "Mai", ventes: 7200, objectif: 6000 },
  { name: "Jun", ventes: 6800, objectif: 6000 },
];

const DEMO_LINE_DATA = [
  { name: "Sem 1", utilisateurs: 120, sessions: 340 },
  { name: "Sem 2", utilisateurs: 180, sessions: 520 },
  { name: "Sem 3", utilisateurs: 150, sessions: 460 },
  { name: "Sem 4", utilisateurs: 220, sessions: 680 },
  { name: "Sem 5", utilisateurs: 280, sessions: 820 },
  { name: "Sem 6", utilisateurs: 310, sessions: 950 },
];

const DEMO_AREA_DATA = [
  { name: "Lun", trafic: 2400, conversions: 400 },
  { name: "Mar", trafic: 1398, conversions: 300 },
  { name: "Mer", trafic: 9800, conversions: 1200 },
  { name: "Jeu", trafic: 3908, conversions: 600 },
  { name: "Ven", trafic: 4800, conversions: 800 },
  { name: "Sam", trafic: 3800, conversions: 500 },
  { name: "Dim", trafic: 4300, conversions: 700 },
];

const DEMO_PIE_DATA = [
  { name: "Sénégal", value: 35 },
  { name: "Côte d'Ivoire", value: 25 },
  { name: "Cameroun", value: 20 },
  { name: "Mali", value: 12 },
  { name: "Autres", value: 8 },
];

const DEMO_STAT_DATA = [
  { value: 12450, label: "Revenus mensuels", trend: 12.5 },
];

const DEMO_KPI_DATA = [
  { value: 7800, target: 10000, label: "Objectif trimestriel" },
];

const DEMO_TABLE_DATA = [
  { Pays: "Sénégal", Secteur: "Tech", Études: 12, Revenus: 45000 },
  { Pays: "Côte d'Ivoire", Secteur: "Finance", Études: 8, Revenus: 38000 },
  { Pays: "Cameroun", Secteur: "Énergie", Études: 6, Revenus: 29000 },
  { Pays: "Mali", Secteur: "Agriculture", Études: 4, Revenus: 18000 },
  { Pays: "Burkina Faso", Secteur: "Santé", Études: 3, Revenus: 15000 },
];

/** Returns demo data matching the widget type */
function getDemoDataForType(type: ChartType): Record<string, unknown>[] {
  switch (type) {
    case "bar":
      return DEMO_BAR_DATA;
    case "line":
      return DEMO_LINE_DATA;
    case "area":
      return DEMO_AREA_DATA;
    case "pie":
    case "donut":
      return DEMO_PIE_DATA;
    case "stat-card":
      return DEMO_STAT_DATA;
    case "kpi":
      return DEMO_KPI_DATA;
    case "table":
      return DEMO_TABLE_DATA;
    default:
      return [];
  }
}

/** Default config per widget type */
function getDefaultConfig(type: ChartType) {
  switch (type) {
    case "bar":
      return { xAxisKey: "name", yAxisKeys: ["ventes", "objectif"], showLegend: true, showGrid: true };
    case "line":
      return { xAxisKey: "name", yAxisKeys: ["utilisateurs", "sessions"], showLegend: true, showGrid: true };
    case "area":
      return { xAxisKey: "name", yAxisKeys: ["trafic", "conversions"], showLegend: true, showGrid: true };
    case "pie":
    case "donut":
      return { valueKey: "value", labelKey: "name", showLegend: true };
    case "stat-card":
      return { valueKey: "value", labelKey: "label", format: "currency" as const, unit: "FCFA" };
    case "kpi":
      return { valueKey: "value", format: "currency" as const, unit: "FCFA" };
    case "table":
      return { format: "number" as const };
    default:
      return {};
  }
}

/** Widget type display labels */
const TYPE_LABELS: Record<string, string> = {
  bar: "Barres",
  line: "Lignes",
  area: "Aires",
  pie: "Camembert",
  "stat-card": "Statistique",
  kpi: "KPI",
  table: "Tableau",
};

/** Default grid size per type */
function getDefaultSize(type: ChartType): { w: number; h: number } {
  switch (type) {
    case "stat-card":
    case "kpi":
      return { w: 3, h: 1 };
    case "table":
      return { w: 6, h: 2 };
    case "pie":
    case "donut":
      return { w: 4, h: 2 };
    default:
      return { w: 6, h: 2 };
  }
}

// =============================================================================
// Page component
// =============================================================================

export default function DashboardBuilderPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");
  const [isEditing, setIsEditing] = useState(true);
  const [templateLoaded, setTemplateLoaded] = useState(false);

  const [layout, setLayout] = useState<DashboardLayout>({
    id: "draft-1",
    name: "Mon tableau de bord",
    description: "Tableau de bord personnalisé",
    widgets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: user?.id ?? 0,
    isTemplate: false,
  });

  // Load template if specified in URL query params
  useEffect(() => {
    if (templateId && !templateLoaded) {
      const template = getTemplateById(templateId);
      if (template) {
        setLayout({
          ...template,
          id: `draft-${Date.now()}`,
          userId: user?.id ?? 0,
          isTemplate: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setTemplateLoaded(true);
    }
  }, [templateId, templateLoaded, user?.id]);

  // Build widget data map from demo data — use template demo data if available
  const widgetData: Record<string, Record<string, unknown>[]> = {};
  for (const w of layout.widgets) {
    const templateData = getTemplateDemoData(w.id);
    widgetData[w.id] = templateData.length > 0 ? templateData : getDemoDataForType(w.type);
  }

  // Calculate next available position (simple row-based auto-placement)
  const getNextPosition = useCallback(
    (size: { w: number; h: number }) => {
      if (layout.widgets.length === 0) return { x: 0, y: 0, ...size };

      // Find the max y + h to place below existing widgets
      let maxBottom = 0;
      let rightmostX = 0;
      let rightmostW = 0;
      let rightmostY = 0;

      for (const w of layout.widgets) {
        const bottom = w.position.y + w.position.h;
        if (bottom > maxBottom) {
          maxBottom = bottom;
        }
        if (w.position.y + w.position.h === maxBottom) {
          if (w.position.x + w.position.w > rightmostX + rightmostW) {
            rightmostX = w.position.x;
            rightmostW = w.position.w;
            rightmostY = w.position.y;
          }
        }
      }

      // Try to place next to the last widget on the same row
      const nextX = rightmostX + rightmostW;
      if (nextX + size.w <= 12) {
        return { x: nextX, y: rightmostY, ...size };
      }

      // Otherwise start a new row
      return { x: 0, y: maxBottom, ...size };
    },
    [layout.widgets]
  );

  const handleAddWidget = useCallback(
    (type: ChartType) => {
      const size = getDefaultSize(type);
      const position = getNextPosition(size);
      const id = `widget-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const newWidget: DashboardWidget = {
        id,
        type,
        title: `${TYPE_LABELS[type] || type} — Sans titre`,
        position,
        config: getDefaultConfig(type),
        dataSource: {
          columns: [],
        },
      };

      setLayout((prev) => ({
        ...prev,
        widgets: [...prev.widgets, newWidget],
        updatedAt: new Date().toISOString(),
      }));
    },
    [getNextPosition]
  );

  const handleWidgetClick = useCallback((widget: DashboardWidget) => {
    if (!isEditing) return;
    // Future: open widget config panel
    console.log("Widget sélectionné :", widget.id, widget.title);
  }, [isEditing]);

  const handleSave = useCallback(() => {
    const json = JSON.stringify(layout, null, 2);
    console.log("Layout sauvegardé :", json);
    alert("Layout sauvegardé dans la console (voir DevTools).");
  }, [layout]);

  const handleRemoveLastWidget = useCallback(() => {
    setLayout((prev) => ({
      ...prev,
      widgets: prev.widgets.slice(0, -1),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Dashboard Builder
            </h1>
            <p className="text-sm text-gray-500">
              Créez votre tableau de bord personnalisé
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/dashboard/templates"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors"
          >
            <LayoutTemplate className="w-4 h-4" />
            Templates
          </a>

          {isEditing && layout.widgets.length > 0 && (
            <button
              type="button"
              onClick={handleRemoveLastWidget}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Supprimer dernier
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {isEditing ? (
              <>
                <Eye className="w-4 h-4" />
                Aperçu
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Éditer
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-6">
        {/* Palette — visible in editing mode only */}
        {isEditing && (
          <aside className="w-72 shrink-0">
            <div className="sticky top-6">
              <WidgetPalette onSelect={handleAddWidget} />

              {/* Stats */}
              <div className="mt-4 bg-white rounded-xl shadow-sm border p-4">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">
                    {layout.widgets.length}
                  </span>{" "}
                  widget{layout.widgets.length !== 1 ? "s" : ""} sur le tableau
                </p>
              </div>
            </div>
          </aside>
        )}

        {/* Grid */}
        <main className="flex-1 min-w-0">
          <DashboardGrid
            layout={layout}
            data={widgetData}
            isEditing={isEditing}
            onWidgetClick={handleWidgetClick}
          />
        </main>
      </div>
    </div>
  );
}
