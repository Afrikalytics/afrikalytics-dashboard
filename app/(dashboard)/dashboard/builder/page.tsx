'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Download,
  Eye,
  EyeOff,
  Save,
  LayoutDashboard,
  LayoutTemplate,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import type { ChartType, DashboardLayout, DashboardWidget } from '@/lib/types';
import { DashboardGrid, WidgetPalette } from '@/components/dashboard-builder';
import { getTemplateById, getTemplateDemoData } from '@/lib/templates';
import { api } from '@/lib/api';

// =============================================================================
// Demo data — used to populate widgets with sample content
// =============================================================================

const DEMO_BAR_DATA = [
  { name: 'Jan', ventes: 4200, objectif: 5000 },
  { name: 'Fév', ventes: 5800, objectif: 5000 },
  { name: 'Mar', ventes: 4900, objectif: 5500 },
  { name: 'Avr', ventes: 6100, objectif: 5500 },
  { name: 'Mai', ventes: 7200, objectif: 6000 },
  { name: 'Jun', ventes: 6800, objectif: 6000 },
];

const DEMO_LINE_DATA = [
  { name: 'Sem 1', utilisateurs: 120, sessions: 340 },
  { name: 'Sem 2', utilisateurs: 180, sessions: 520 },
  { name: 'Sem 3', utilisateurs: 150, sessions: 460 },
  { name: 'Sem 4', utilisateurs: 220, sessions: 680 },
  { name: 'Sem 5', utilisateurs: 280, sessions: 820 },
  { name: 'Sem 6', utilisateurs: 310, sessions: 950 },
];

const DEMO_AREA_DATA = [
  { name: 'Lun', trafic: 2400, conversions: 400 },
  { name: 'Mar', trafic: 1398, conversions: 300 },
  { name: 'Mer', trafic: 9800, conversions: 1200 },
  { name: 'Jeu', trafic: 3908, conversions: 600 },
  { name: 'Ven', trafic: 4800, conversions: 800 },
  { name: 'Sam', trafic: 3800, conversions: 500 },
  { name: 'Dim', trafic: 4300, conversions: 700 },
];

const DEMO_PIE_DATA = [
  { name: 'Sénégal', value: 35 },
  { name: "Côte d'Ivoire", value: 25 },
  { name: 'Cameroun', value: 20 },
  { name: 'Mali', value: 12 },
  { name: 'Autres', value: 8 },
];

const DEMO_STAT_DATA = [{ value: 12450, label: 'Revenus mensuels', trend: 12.5 }];

const DEMO_KPI_DATA = [{ value: 7800, target: 10000, label: 'Objectif trimestriel' }];

const DEMO_TABLE_DATA = [
  { Pays: 'Sénégal', Secteur: 'Tech', Études: 12, Revenus: 45000 },
  { Pays: "Côte d'Ivoire", Secteur: 'Finance', Études: 8, Revenus: 38000 },
  { Pays: 'Cameroun', Secteur: 'Énergie', Études: 6, Revenus: 29000 },
  { Pays: 'Mali', Secteur: 'Agriculture', Études: 4, Revenus: 18000 },
  { Pays: 'Burkina Faso', Secteur: 'Santé', Études: 3, Revenus: 15000 },
];

const DEMO_SCATTER_DATA = [
  { x: 10, y: 30, z: 200 },
  { x: 30, y: 80, z: 260 },
  { x: 45, y: 50, z: 400 },
  { x: 60, y: 90, z: 280 },
  { x: 70, y: 60, z: 500 },
  { x: 85, y: 120, z: 320 },
  { x: 95, y: 40, z: 150 },
];

const DEMO_RADAR_DATA = [
  { name: 'Qualité', score: 85, moyenne: 65 },
  { name: 'Prix', score: 70, moyenne: 75 },
  { name: 'Livraison', score: 90, moyenne: 60 },
  { name: 'Service', score: 65, moyenne: 70 },
  { name: 'Innovation', score: 80, moyenne: 55 },
  { name: 'Fiabilité', score: 75, moyenne: 68 },
];

const DEMO_FUNNEL_DATA = [
  { name: 'Visiteurs', value: 12000 },
  { name: 'Inscrits', value: 5400 },
  { name: 'Essai gratuit', value: 2800 },
  { name: 'Abonnés', value: 1200 },
  { name: 'Premium', value: 450 },
];

const DEMO_GAUGE_DATA = [{ value: 7200, target: 10000, label: 'Revenu mensuel' }];

const DEMO_HEATMAP_DATA = [
  { jour: 'Lun', heure: 'Matin', valeur: 45 },
  { jour: 'Lun', heure: 'Après-midi', valeur: 80 },
  { jour: 'Lun', heure: 'Soir', valeur: 30 },
  { jour: 'Mar', heure: 'Matin', valeur: 60 },
  { jour: 'Mar', heure: 'Après-midi', valeur: 95 },
  { jour: 'Mar', heure: 'Soir', valeur: 50 },
  { jour: 'Mer', heure: 'Matin', valeur: 35 },
  { jour: 'Mer', heure: 'Après-midi', valeur: 70 },
  { jour: 'Mer', heure: 'Soir', valeur: 65 },
  { jour: 'Jeu', heure: 'Matin', valeur: 55 },
  { jour: 'Jeu', heure: 'Après-midi', valeur: 85 },
  { jour: 'Jeu', heure: 'Soir', valeur: 40 },
  { jour: 'Ven', heure: 'Matin', valeur: 75 },
  { jour: 'Ven', heure: 'Après-midi', valeur: 90 },
  { jour: 'Ven', heure: 'Soir', valeur: 25 },
];

const DEMO_TREEMAP_DATA = [
  { name: 'Tech', value: 4500 },
  { name: 'Finance', value: 3800 },
  { name: 'Énergie', value: 2900 },
  { name: 'Agriculture', value: 1800 },
  { name: 'Santé', value: 1500 },
  { name: 'Éducation', value: 1200 },
  { name: 'Transport', value: 900 },
];

const DEMO_MAP_DATA = [
  { name: 'Sénégal', value: 4500 },
  { name: "Côte d'Ivoire", value: 3800 },
  { name: 'Mali', value: 2200 },
  { name: 'Burkina Faso', value: 1800 },
  { name: 'Guinée', value: 1400 },
  { name: 'Niger', value: 1100 },
  { name: 'Bénin', value: 950 },
  { name: 'Togo', value: 700 },
];

const DEMO_TEXT_DATA = [{ content: '' }];

/** Returns demo data matching the widget type */
function getDemoDataForType(type: ChartType): Record<string, unknown>[] {
  switch (type) {
    case 'bar':
      return DEMO_BAR_DATA;
    case 'line':
      return DEMO_LINE_DATA;
    case 'area':
      return DEMO_AREA_DATA;
    case 'pie':
    case 'donut':
      return DEMO_PIE_DATA;
    case 'stat-card':
      return DEMO_STAT_DATA;
    case 'kpi':
      return DEMO_KPI_DATA;
    case 'table':
      return DEMO_TABLE_DATA;
    case 'scatter':
      return DEMO_SCATTER_DATA;
    case 'radar':
      return DEMO_RADAR_DATA;
    case 'funnel':
      return DEMO_FUNNEL_DATA;
    case 'gauge':
      return DEMO_GAUGE_DATA;
    case 'heatmap':
      return DEMO_HEATMAP_DATA;
    case 'treemap':
      return DEMO_TREEMAP_DATA;
    case 'map':
      return DEMO_MAP_DATA;
    case 'text':
      return DEMO_TEXT_DATA;
    default:
      return [];
  }
}

/** Default config per widget type */
function getDefaultConfig(type: ChartType) {
  switch (type) {
    case 'bar':
      return {
        xAxisKey: 'name',
        yAxisKeys: ['ventes', 'objectif'],
        showLegend: true,
        showGrid: true,
      };
    case 'line':
      return {
        xAxisKey: 'name',
        yAxisKeys: ['utilisateurs', 'sessions'],
        showLegend: true,
        showGrid: true,
      };
    case 'area':
      return {
        xAxisKey: 'name',
        yAxisKeys: ['trafic', 'conversions'],
        showLegend: true,
        showGrid: true,
      };
    case 'pie':
    case 'donut':
      return { valueKey: 'value', labelKey: 'name', showLegend: true };
    case 'stat-card':
      return { valueKey: 'value', labelKey: 'label', format: 'currency' as const, unit: 'FCFA' };
    case 'kpi':
      return { valueKey: 'value', format: 'currency' as const, unit: 'FCFA' };
    case 'table':
      return { format: 'number' as const };
    case 'scatter':
      return { xAxisKey: 'x', yAxisKeys: ['y'], showGrid: true };
    case 'radar':
      return { labelKey: 'name', yAxisKeys: ['score', 'moyenne'], showLegend: true };
    case 'funnel':
      return { valueKey: 'value', labelKey: 'name' };
    case 'gauge':
      return { valueKey: 'value', format: 'currency' as const, unit: 'FCFA' };
    case 'heatmap':
      return { valueKey: 'valeur' };
    case 'treemap':
      return { valueKey: 'value', labelKey: 'name' };
    case 'map':
      return { valueKey: 'value', labelKey: 'name' };
    case 'text':
      return { content: '', fontSize: 'md' as const, align: 'left' as const };
    default:
      return {};
  }
}

/** Widget type display labels */
const TYPE_LABELS: Record<string, string> = {
  bar: 'Barres',
  line: 'Lignes',
  area: 'Aires',
  pie: 'Camembert',
  donut: 'Donut',
  'stat-card': 'Statistique',
  kpi: 'KPI',
  table: 'Tableau',
  scatter: 'Nuage',
  radar: 'Radar',
  funnel: 'Entonnoir',
  gauge: 'Jauge',
  heatmap: 'Heatmap',
  treemap: 'Treemap',
  map: 'Carte',
  text: 'Texte',
};

/** Default grid size per type */
function getDefaultSize(type: ChartType): { w: number; h: number } {
  switch (type) {
    case 'stat-card':
    case 'kpi':
    case 'gauge':
      return { w: 3, h: 2 };
    case 'text':
      return { w: 4, h: 1 };
    case 'table':
    case 'heatmap':
      return { w: 6, h: 2 };
    case 'pie':
    case 'donut':
    case 'radar':
    case 'treemap':
      return { w: 4, h: 2 };
    case 'funnel':
      return { w: 5, h: 2 };
    case 'map':
      return { w: 6, h: 3 };
    default:
      return { w: 6, h: 2 };
  }
}

// =============================================================================
// Save status
// =============================================================================

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// =============================================================================
// Save status indicator (extracted to module scope to avoid remount on parent render)
// =============================================================================

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Sauvegarde…
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Sauvegardé
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-red-500">
        <AlertCircle className="w-3.5 h-3.5" />
        Erreur de sauvegarde
      </span>
    );
  }
  return null;
}

// =============================================================================
// Page component
// =============================================================================

export default function DashboardBuilderPage() {
  const { user } = useAuthContext();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const [isEditing, setIsEditing] = useState(true);
  const [templateLoaded, setTemplateLoaded] = useState(false);

  // Backend layout ID (null = not yet persisted)
  const [backendId, setBackendId] = useState<number | null>(null);
  const backendIdRef = useRef<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const statusTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [layout, setLayout] = useState<DashboardLayout>({
    id: 'draft-1',
    name: 'Mon tableau de bord',
    description: 'Tableau de bord personnalisé',
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

  // Build widget data map from demo data (memoized to avoid child re-renders)
  const widgetData = useMemo(() => {
    const map: Record<string, Record<string, unknown>[]> = {};
    for (const w of layout.widgets) {
      const templateData = getTemplateDemoData(w.id);
      map[w.id] = templateData.length > 0 ? templateData : getDemoDataForType(w.type);
    }
    return map;
  }, [layout.widgets]);

  // --------------------------------------------------
  // Persistence helpers
  // --------------------------------------------------

  const persistLayout = useCallback(
    async (currentLayout: DashboardLayout) => {
      if (!user) return;
      setSaveStatus('saving');
      try {
        const payload = {
          name: currentLayout.name,
          description: currentLayout.description,
          layout: {
            widgets: currentLayout.widgets,
          },
        };

        if (backendIdRef.current) {
          await api.updateLayout(backendIdRef.current, payload);
        } else {
          const created = await api.createLayout(payload);
          backendIdRef.current = created.id;
          setBackendId(created.id);
        }
        setSaveStatus('saved');
        if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        statusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
      } catch {
        setSaveStatus('error');
        if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        statusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 5000);
      }
    },
    [user],
  );

  // Auto-save debounced (2s after last change)
  const scheduleAutoSave = useCallback(
    (updatedLayout: DashboardLayout) => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        persistLayout(updatedLayout);
      }, 2000);
    },
    [persistLayout],
  );

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'saving') {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveStatus]);

  // --------------------------------------------------
  // Widget operations
  // --------------------------------------------------

  const createWidget = useCallback(
    (type: ChartType, x?: number, y?: number): DashboardWidget => {
      const size = getDefaultSize(type);
      const id = `widget-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      // Compute bottom of existing widgets for auto-placement
      const bottomY = y ?? layout.widgets.reduce(
        (max, w) => Math.max(max, w.position.y + w.position.h),
        0,
      );

      return {
        id,
        type,
        title: `${TYPE_LABELS[type] || type} — Sans titre`,
        position: {
          x: x ?? 0,
          y: bottomY,
          ...size,
        },
        config: getDefaultConfig(type),
        dataSource: { columns: [] },
      };
    },
    [layout.widgets],
  );

  const handleAddWidget = useCallback(
    (type: ChartType) => {
      const newWidget = createWidget(type);
      const updatedLayout: DashboardLayout = {
        ...layout,
        widgets: [...layout.widgets, newWidget],
        updatedAt: new Date().toISOString(),
      };
      setLayout(updatedLayout);
      scheduleAutoSave(updatedLayout);
    },
    [layout, createWidget, scheduleAutoSave],
  );

  const handleDropWidget = useCallback(
    (type: ChartType, x: number, y: number) => {
      const newWidget = createWidget(type, x, y);
      const updatedLayout: DashboardLayout = {
        ...layout,
        widgets: [...layout.widgets, newWidget],
        updatedAt: new Date().toISOString(),
      };
      setLayout(updatedLayout);
      scheduleAutoSave(updatedLayout);
    },
    [layout, createWidget, scheduleAutoSave],
  );

  const handleLayoutChange = useCallback(
    (updatedWidgets: DashboardWidget[]) => {
      const updatedLayout: DashboardLayout = {
        ...layout,
        widgets: updatedWidgets,
        updatedAt: new Date().toISOString(),
      };
      setLayout(updatedLayout);
      scheduleAutoSave(updatedLayout);
    },
    [layout, scheduleAutoSave],
  );

  const handleDeleteWidget = useCallback(
    (id: string) => {
      const updatedLayout: DashboardLayout = {
        ...layout,
        widgets: layout.widgets.filter((w) => w.id !== id),
        updatedAt: new Date().toISOString(),
      };
      setLayout(updatedLayout);
      scheduleAutoSave(updatedLayout);
    },
    [layout, scheduleAutoSave],
  );

  const handleDuplicateWidget = useCallback(
    (id: string) => {
      const original = layout.widgets.find((w) => w.id === id);
      if (!original) return;

      const duplicated: DashboardWidget = {
        ...original,
        id: `widget-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `${original.title} (copie)`,
        position: {
          ...original.position,
          y: original.position.y + original.position.h,
        },
      };

      const updatedLayout: DashboardLayout = {
        ...layout,
        widgets: [...layout.widgets, duplicated],
        updatedAt: new Date().toISOString(),
      };
      setLayout(updatedLayout);
      scheduleAutoSave(updatedLayout);
    },
    [layout, scheduleAutoSave],
  );

  const handleManualSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    persistLayout(layout);
  }, [layout, persistLayout]);

  const handleExportJson = useCallback(() => {
    const json = JSON.stringify(layout, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${layout.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [layout]);

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard Builder</h1>
            <p className="text-sm text-gray-500">
              {isEditing
                ? 'Glissez-déposez pour réorganiser vos widgets'
                : 'Aperçu de votre tableau de bord'}
            </p>
          </div>
          <SaveIndicator status={saveStatus} />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter JSON
          </button>

          <a
            href="/dashboard/templates"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors"
          >
            <LayoutTemplate className="w-4 h-4" />
            Templates
          </a>

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
            onClick={handleManualSave}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
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
                  <span className="font-semibold text-gray-700">{layout.widgets.length}</span>{' '}
                  widget{layout.widgets.length !== 1 ? 's' : ''} sur le tableau
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Glissez depuis la palette ou cliquez pour ajouter
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
            onLayoutChange={handleLayoutChange}
            onDeleteWidget={handleDeleteWidget}
            onDuplicateWidget={handleDuplicateWidget}
            onDropWidget={handleDropWidget}
          />
        </main>
      </div>
    </div>
  );
}
