'use client';

import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Landmark,
  HeartPulse,
  Wifi,
  Sprout,
  GraduationCap,
  Zap,
  Truck,
  Building2,
  Heart,
  LayoutDashboard,
  ArrowRight,
  LayoutTemplate,
} from 'lucide-react';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { TEMPLATE_INFOS } from '@/lib/templates';
import type { LucideIcon } from 'lucide-react';

// =============================================================================
// Icon mapping
// =============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart,
  Landmark,
  HeartPulse,
  Wifi,
  Sprout,
  GraduationCap,
  Zap,
  Truck,
  Building2,
  Heart,
  LayoutDashboard,
};

// =============================================================================
// Page component
// =============================================================================

export default function DashboardTemplatesPage() {
  const { isLoading } = useAuthContext();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
          <LayoutTemplate className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Templates sectoriels</h1>
          <p className="text-sm text-gray-500">
            Choisissez un template adapte a votre secteur pour demarrer rapidement
          </p>
        </div>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATE_INFOS.map((info) => {
          const Icon = ICON_MAP[info.icon] ?? LayoutDashboard;

          return (
            <div
              key={info.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-200 transition-all duration-200 overflow-hidden group"
            >
              <div className="p-6">
                {/* Icon + title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${info.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                      {info.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{info.description}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    {info.widgetCount} widgets
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/builder?template=${info.id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    Utiliser ce template
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
