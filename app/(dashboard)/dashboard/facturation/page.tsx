'use client';

// =============================================================================
// Datatym AI Dashboard — Page Facturation
// =============================================================================
// Displays current plan, payment history, and available plans.
// =============================================================================

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { PageHeader } from './components/PageHeader';
import { CurrentPlanCard } from './components/CurrentPlanCard';
import { PaymentHistoryCard } from './components/PaymentHistoryCard';
import { AvailablePlansSection } from './components/AvailablePlansSection';
import type { CurrentPlanResponse, PaymentHistoryResponse } from '@/lib/types';

// -----------------------------------------------------------------------------
// Allowed payment redirect hosts (PayDunya)
// -----------------------------------------------------------------------------

const ALLOWED_PAYMENT_HOSTS = ['app.paydunya.com', 'checkout.paydunya.com', 'paydunya.com'];

// =============================================================================
// Page component
// =============================================================================

export default function FacturationPage() {
  const { user } = useAuthContext();
  const [currentPlan, setCurrentPlan] = useState<CurrentPlanResponse | null>(null);
  const [history, setHistory] = useState<PaymentHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [planRes, historyRes] = await Promise.all([
          api.get<CurrentPlanResponse>('/api/payments/current-plan'),
          api.get<PaymentHistoryResponse>('/api/payments/history'),
        ]);
        setCurrentPlan(planRes);
        setHistory(historyRes);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur de chargement';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChangePlan = async (planKey: string) => {
    if (!user) return;
    if (planKey === currentPlan?.plan) return;

    setChangingPlan(planKey);
    try {
      const res = await api.post<{
        success: boolean;
        action: string;
        payment_url?: string;
        message?: string;
      }>('/api/payments/change-plan', {
        email: user.email,
        name: user.full_name,
        plan: planKey,
      });

      if (res.action === 'downgraded') {
        // Reload plan data
        const planRes = await api.get<CurrentPlanResponse>('/api/payments/current-plan');
        setCurrentPlan(planRes);
      } else if (res.payment_url) {
        // Validate payment URL against known PayDunya domains to prevent open redirect
        try {
          const paymentUrl = new URL(res.payment_url);
          if (ALLOWED_PAYMENT_HOSTS.includes(paymentUrl.hostname)) {
            window.location.href = res.payment_url;
          } else {
            setError('URL de paiement invalide. Veuillez réessayer.');
          }
        } catch {
          setError('URL de paiement invalide. Veuillez réessayer.');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du changement de plan';
      setError(message);
    } finally {
      setChangingPlan(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Loading / Error states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Card padding="lg">
          <div className="flex items-center gap-3 text-danger-600">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const activePlanKey = currentPlan?.plan || user?.plan || 'basic';

  return (
    <div className="page-container space-y-8">
      <PageHeader />
      <CurrentPlanCard currentPlan={currentPlan} userPlan={user?.plan} />
      <PaymentHistoryCard history={history} />
      <AvailablePlansSection
        currentPlanKey={activePlanKey}
        changingPlan={changingPlan}
        onChangePlan={handleChangePlan}
      />
    </div>
  );
}
