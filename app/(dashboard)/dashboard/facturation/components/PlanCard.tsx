'use client';

import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { FeatureRow } from './FeatureRow';
import type { PlanFeatures } from '@/lib/types';

interface PlanCardProps {
  planKey: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  features: PlanFeatures;
  isCurrent: boolean;
  changingPlan: string | null;
  onChangePlan: (planKey: string) => void;
}

export function PlanCard({
  planKey,
  name,
  icon,
  color,
  features,
  isCurrent,
  changingPlan,
  onChangePlan,
}: PlanCardProps) {
  return (
    <div
      className={`
        relative bg-white rounded-xl border-2 p-6 transition-all duration-200
        ${isCurrent ? 'border-primary-500 shadow-lg' : color}
        ${!isCurrent ? 'hover:shadow-md' : ''}
      `}
    >
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="primary" size="sm">
            Plan actuel
          </Badge>
        </div>
      )}

      {/* Plan header */}
      <div className="text-center mb-6 pt-2">
        <div
          className={`inline-flex p-3 rounded-xl mb-3 ${
            planKey === 'basic'
              ? 'bg-gray-100 text-gray-600'
              : planKey === 'professionnel'
                ? 'bg-primary-50 text-primary-600'
                : 'bg-purple-50 text-purple-600'
          }`}
        >
          {icon}
        </div>
        <h3 className="text-lg font-bold text-surface-900">{name}</h3>
        <p className="text-2xl font-extrabold text-surface-900 mt-2">
          {features.price_monthly === 0
            ? 'Gratuit'
            : `${features.price_monthly.toLocaleString('fr-FR')} FCFA`}
        </p>
        {features.price_monthly > 0 && <p className="text-xs text-surface-400">par mois</p>}
      </div>

      {/* Features list */}
      <div className="space-y-0 border-t border-surface-100 pt-4">
        <FeatureRow label="Etudes" value={features.max_studies} />
        <FeatureRow label="Membres d'equipe" value={features.max_team_members} />
        <FeatureRow label="Export PDF" value={features.export_pdf} />
        <FeatureRow label="Acces API" value={features.api_access} />
        <FeatureRow label="Marque personnalisee" value={features.custom_branding} />
      </div>

      {/* CTA button */}
      <div className="mt-6">
        {isCurrent ? (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-surface-100 text-surface-400 cursor-not-allowed"
          >
            Plan actuel
          </button>
        ) : (
          <button
            onClick={() => onChangePlan(planKey)}
            disabled={changingPlan !== null}
            className={`
              w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors
              ${
                planKey === 'professionnel'
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : planKey === 'entreprise'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-white border border-surface-300 text-surface-700 hover:bg-surface-50'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {changingPlan === planKey ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Traitement...
              </span>
            ) : (
              'Choisir ce plan'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
