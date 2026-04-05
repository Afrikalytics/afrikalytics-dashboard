'use client';

import {
  BarChart3,
  LineChart,
  PieChart,
  Table,
  Hash,
  Activity,
  Target,
  Circle,
  Crosshair,
  Radio,
  Filter,
  Gauge,
  Grid3x3,
  TreePine,
  Map,
  Type,
} from 'lucide-react';
import type { ChartType } from '@/lib/types';

const WIDGET_TYPES: {
  type: ChartType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  { type: 'bar', label: 'Barres', icon: BarChart3, description: 'Comparaison de valeurs' },
  { type: 'line', label: 'Lignes', icon: LineChart, description: 'Tendances temporelles' },
  { type: 'area', label: 'Aires', icon: Activity, description: 'Volume dans le temps' },
  { type: 'pie', label: 'Camembert', icon: PieChart, description: 'Répartition en parts' },
  { type: 'stat-card', label: 'Statistique', icon: Hash, description: 'Chiffre clé' },
  { type: 'kpi', label: 'KPI', icon: Target, description: 'Indicateur vs objectif' },
  { type: 'table', label: 'Tableau', icon: Table, description: 'Données tabulaires' },
  { type: 'donut', label: 'Donut', icon: Circle, description: 'Répartition en anneau' },
  { type: 'scatter', label: 'Nuage', icon: Crosshair, description: 'Corrélation entre variables' },
  { type: 'radar', label: 'Radar', icon: Radio, description: 'Comparaison multicritères' },
  { type: 'funnel', label: 'Entonnoir', icon: Filter, description: 'Conversion par étapes' },
  { type: 'gauge', label: 'Jauge', icon: Gauge, description: 'Indicateur avec seuil' },
  { type: 'heatmap', label: 'Heatmap', icon: Grid3x3, description: 'Densité croisée' },
  { type: 'treemap', label: 'Treemap', icon: TreePine, description: 'Hiérarchie proportionnelle' },
  { type: 'map', label: 'Carte', icon: Map, description: 'Données géographiques' },
  { type: 'text', label: 'Texte', icon: Type, description: 'Bloc de texte libre' },
];

interface WidgetPaletteProps {
  onSelect: (type: ChartType) => void;
}

export default function WidgetPalette({ onSelect }: WidgetPaletteProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Ajouter un widget</h3>
      <div className="grid grid-cols-2 gap-2 max-h-[70vh] overflow-y-auto">
        {WIDGET_TYPES.map(({ type, label, icon: Icon, description }) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('widgetType', type);
            }}
            className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors text-left cursor-grab active:cursor-grabbing"
          >
            <Icon className="w-5 h-5 text-primary-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
