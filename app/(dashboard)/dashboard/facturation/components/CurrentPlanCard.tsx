'use client';

import { Crown } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FeatureRow } from './FeatureRow';
import type { CurrentPlanResponse } from '@/lib/types';

interface CurrentPlanCardProps {
  currentPlan: CurrentPlanResponse | null;
  userPlan: string | undefined;
}

export function CurrentPlanCard({ currentPlan, userPlan }: CurrentPlanCardProps) {
  return (
    <Card>
      <CardHeader
        title="Plan actuel"
        subtitle="Details de votre abonnement en cours"
        icon={<Crown className="w-5 h-5" />}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-surface-500">Plan</p>
          <p className="text-lg font-bold text-surface-900 capitalize mt-1">
            {currentPlan?.plan || userPlan || 'basic'}
          </p>
        </div>
        <div>
          <p className="text-sm text-surface-500">Statut</p>
          <div className="mt-1">
            {currentPlan?.is_active ? (
              <Badge variant="success" dot>
                Actif
              </Badge>
            ) : (
              <Badge variant="danger" dot>
                Inactif
              </Badge>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm text-surface-500">Expiration</p>
          <p className="text-sm font-medium text-surface-700 mt-1">
            {currentPlan?.expires_at
              ? new Date(currentPlan.expires_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : "Aucune date d'expiration"}
          </p>
        </div>
      </div>

      {/* Plan features summary */}
      {currentPlan?.features && (
        <div className="mt-6 pt-6 border-t border-surface-100">
          <p className="text-sm font-semibold text-surface-700 mb-3">Fonctionnalites incluses</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <FeatureRow label="Etudes" value={currentPlan.features.max_studies} />
            <FeatureRow label="Membres d'equipe" value={currentPlan.features.max_team_members} />
            <FeatureRow label="Export PDF" value={currentPlan.features.export_pdf} />
            <FeatureRow label="Acces API" value={currentPlan.features.api_access} />
            <FeatureRow label="Marque personnalisee" value={currentPlan.features.custom_branding} />
          </div>
        </div>
      )}
    </Card>
  );
}
