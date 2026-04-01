'use client';

import { Star, Crown, Building2 } from 'lucide-react';
import { PlanCard } from './PlanCard';
import type { PlanFeatures } from '@/lib/types';

// -----------------------------------------------------------------------------
// Plan features config (mirrors backend PLAN_FEATURES)
// -----------------------------------------------------------------------------

const PLANS: {
  key: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  features: PlanFeatures;
}[] = [
  {
    key: 'basic',
    name: 'Basic',
    icon: <Star className="w-6 h-6" />,
    color: 'border-gray-200',
    features: {
      max_studies: 3,
      max_team_members: 1,
      export_pdf: false,
      api_access: false,
      custom_branding: false,
      price_monthly: 0,
      price_label: 'Gratuit',
    },
  },
  {
    key: 'professionnel',
    name: 'Professionnel',
    icon: <Crown className="w-6 h-6" />,
    color: 'border-primary-400 ring-2 ring-primary-100',
    features: {
      max_studies: 20,
      max_team_members: 5,
      export_pdf: true,
      api_access: true,
      custom_branding: false,
      price_monthly: 15000,
      price_label: '15 000 FCFA/mois',
    },
  },
  {
    key: 'entreprise',
    name: 'Entreprise',
    icon: <Building2 className="w-6 h-6" />,
    color: 'border-purple-400 ring-2 ring-purple-100',
    features: {
      max_studies: -1,
      max_team_members: -1,
      export_pdf: true,
      api_access: true,
      custom_branding: true,
      price_monthly: 50000,
      price_label: '50 000 FCFA/mois',
    },
  },
];

interface AvailablePlansSectionProps {
  currentPlanKey: string;
  changingPlan: string | null;
  onChangePlan: (planKey: string) => void;
}

export function AvailablePlansSection({
  currentPlanKey,
  changingPlan,
  onChangePlan,
}: AvailablePlansSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-surface-900 mb-4">Plans disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = plan.key === currentPlanKey;
          return (
            <PlanCard
              key={plan.key}
              planKey={plan.key}
              name={plan.name}
              icon={plan.icon}
              color={plan.color}
              features={plan.features}
              isCurrent={isCurrent}
              changingPlan={changingPlan}
              onChangePlan={onChangePlan}
            />
          );
        })}
      </div>
    </div>
  );
}
