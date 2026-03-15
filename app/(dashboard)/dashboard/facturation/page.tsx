"use client";

// =============================================================================
// Afrikalytics Dashboard — Page Facturation
// =============================================================================
// Displays current plan, payment history, and available plans.
// =============================================================================

import { useState, useEffect } from "react";
import {
  CreditCard,
  Check,
  X,
  Clock,
  Crown,
  Star,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type {
  CurrentPlanResponse,
  PaymentHistoryResponse,
  PaymentHistoryItem,
  PlanFeatures,
} from "@/lib/types";

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
    key: "basic",
    name: "Basic",
    icon: <Star className="w-6 h-6" />,
    color: "border-gray-200",
    features: {
      max_studies: 3,
      max_team_members: 1,
      export_pdf: false,
      api_access: false,
      custom_branding: false,
      price_monthly: 0,
      price_label: "Gratuit",
    },
  },
  {
    key: "professionnel",
    name: "Professionnel",
    icon: <Crown className="w-6 h-6" />,
    color: "border-primary-400 ring-2 ring-primary-100",
    features: {
      max_studies: 20,
      max_team_members: 5,
      export_pdf: true,
      api_access: true,
      custom_branding: false,
      price_monthly: 15000,
      price_label: "15 000 FCFA/mois",
    },
  },
  {
    key: "entreprise",
    name: "Entreprise",
    icon: <Building2 className="w-6 h-6" />,
    color: "border-purple-400 ring-2 ring-purple-100",
    features: {
      max_studies: -1,
      max_team_members: -1,
      export_pdf: true,
      api_access: true,
      custom_branding: true,
      price_monthly: 50000,
      price_label: "50 000 FCFA/mois",
    },
  },
];

// -----------------------------------------------------------------------------
// Status badge helper
// -----------------------------------------------------------------------------

function PaymentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="success" size="sm" dot>
          Effectue
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="warning" size="sm" dot>
          En attente
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="danger" size="sm" dot>
          Echoue
        </Badge>
      );
    case "refunded":
      return (
        <Badge variant="default" size="sm" dot>
          Rembourse
        </Badge>
      );
    default:
      return <Badge size="sm">{status}</Badge>;
  }
}

// -----------------------------------------------------------------------------
// Feature row helper
// -----------------------------------------------------------------------------

function FeatureRow({
  label,
  value,
}: {
  label: string;
  value: boolean | number;
}) {
  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-surface-600">{label}</span>
        {value ? (
          <Check className="w-4 h-4 text-success-600" />
        ) : (
          <X className="w-4 h-4 text-surface-300" />
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-surface-600">{label}</span>
      <span className="text-sm font-semibold text-surface-900">
        {value === -1 ? "Illimite" : value}
      </span>
    </div>
  );
}

// =============================================================================
// Page component
// =============================================================================

export default function FacturationPage() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<CurrentPlanResponse | null>(
    null
  );
  const [history, setHistory] = useState<PaymentHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [planRes, historyRes] = await Promise.all([
          api.get<CurrentPlanResponse>("/api/payments/current-plan"),
          api.get<PaymentHistoryResponse>("/api/payments/history"),
        ]);
        setCurrentPlan(planRes);
        setHistory(historyRes);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Erreur de chargement";
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
      }>("/api/payments/change-plan", {
        email: user.email,
        name: user.full_name,
        plan: planKey,
      });

      if (res.action === "downgraded") {
        // Reload plan data
        const planRes = await api.get<CurrentPlanResponse>(
          "/api/payments/current-plan"
        );
        setCurrentPlan(planRes);
      } else if (res.payment_url) {
        // Validate payment URL against known PayDunya domains to prevent open redirect
        const ALLOWED_PAYMENT_HOSTS = [
          "app.paydunya.com",
          "checkout.paydunya.com",
          "paydunya.com",
        ];
        try {
          const paymentUrl = new URL(res.payment_url);
          if (ALLOWED_PAYMENT_HOSTS.includes(paymentUrl.hostname)) {
            window.location.href = res.payment_url;
          } else {
            setError("URL de paiement invalide. Veuillez réessayer.");
          }
        } catch {
          setError("URL de paiement invalide. Veuillez réessayer.");
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du changement de plan";
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

  return (
    <div className="page-container space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-surface-900">Facturation</h1>
          <p className="text-sm text-surface-500">
            Gerez votre abonnement et consultez votre historique de paiements
          </p>
        </div>
      </div>

      {/* Section 1: Current Plan */}
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
              {currentPlan?.plan || user?.plan || "basic"}
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
                ? new Date(currentPlan.expires_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Aucune date d'expiration"}
            </p>
          </div>
        </div>

        {/* Plan features summary */}
        {currentPlan?.features && (
          <div className="mt-6 pt-6 border-t border-surface-100">
            <p className="text-sm font-semibold text-surface-700 mb-3">
              Fonctionnalites incluses
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <FeatureRow
                label="Etudes"
                value={currentPlan.features.max_studies}
              />
              <FeatureRow
                label="Membres d'equipe"
                value={currentPlan.features.max_team_members}
              />
              <FeatureRow
                label="Export PDF"
                value={currentPlan.features.export_pdf}
              />
              <FeatureRow
                label="Acces API"
                value={currentPlan.features.api_access}
              />
              <FeatureRow
                label="Marque personnalisee"
                value={currentPlan.features.custom_branding}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Section 2: Payment History */}
      <Card>
        <CardHeader
          title="Historique des paiements"
          subtitle={`${history?.total || 0} paiement(s) au total`}
          icon={<Clock className="w-5 h-5" />}
        />
        {history && history.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left py-3 px-2 font-semibold text-surface-500 uppercase tracking-wider text-xs">
                    Date
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-surface-500 uppercase tracking-wider text-xs">
                    Plan
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-surface-500 uppercase tracking-wider text-xs">
                    Montant
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-surface-500 uppercase tracking-wider text-xs">
                    Statut
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-surface-500 uppercase tracking-wider text-xs">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.payments.map((payment: PaymentHistoryItem) => (
                  <tr
                    key={payment.id}
                    className="border-b border-surface-50 hover:bg-surface-50 transition-colors"
                  >
                    <td className="py-3 px-2 text-surface-700">
                      {new Date(payment.created_at).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="py-3 px-2 text-surface-900 font-medium capitalize">
                      {payment.plan}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-surface-900 tabular-nums">
                      {payment.amount.toLocaleString("fr-FR")} {payment.currency}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <PaymentStatusBadge status={payment.status} />
                    </td>
                    <td className="py-3 px-2 text-surface-500 font-mono text-xs">
                      {payment.reference
                        ? payment.reference.substring(0, 12) + "..."
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-surface-400">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Aucun paiement enregistre</p>
          </div>
        )}
      </Card>

      {/* Section 3: Available Plans */}
      <div>
        <h2 className="text-lg font-bold text-surface-900 mb-4">
          Plans disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = plan.key === (currentPlan?.plan || user?.plan);
            return (
              <div
                key={plan.key}
                className={`
                  relative bg-white rounded-xl border-2 p-6 transition-all duration-200
                  ${isCurrent ? "border-primary-500 shadow-lg" : plan.color}
                  ${!isCurrent ? "hover:shadow-md" : ""}
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
                      plan.key === "basic"
                        ? "bg-gray-100 text-gray-600"
                        : plan.key === "professionnel"
                          ? "bg-primary-50 text-primary-600"
                          : "bg-purple-50 text-purple-600"
                    }`}
                  >
                    {plan.icon}
                  </div>
                  <h3 className="text-lg font-bold text-surface-900">
                    {plan.name}
                  </h3>
                  <p className="text-2xl font-extrabold text-surface-900 mt-2">
                    {plan.features.price_monthly === 0
                      ? "Gratuit"
                      : `${plan.features.price_monthly.toLocaleString("fr-FR")} FCFA`}
                  </p>
                  {plan.features.price_monthly > 0 && (
                    <p className="text-xs text-surface-400">par mois</p>
                  )}
                </div>

                {/* Features list */}
                <div className="space-y-0 border-t border-surface-100 pt-4">
                  <FeatureRow
                    label="Etudes"
                    value={plan.features.max_studies}
                  />
                  <FeatureRow
                    label="Membres d'equipe"
                    value={plan.features.max_team_members}
                  />
                  <FeatureRow
                    label="Export PDF"
                    value={plan.features.export_pdf}
                  />
                  <FeatureRow
                    label="Acces API"
                    value={plan.features.api_access}
                  />
                  <FeatureRow
                    label="Marque personnalisee"
                    value={plan.features.custom_branding}
                  />
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
                      onClick={() => handleChangePlan(plan.key)}
                      disabled={changingPlan !== null}
                      className={`
                        w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors
                        ${
                          plan.key === "professionnel"
                            ? "bg-primary-600 text-white hover:bg-primary-700"
                            : plan.key === "entreprise"
                              ? "bg-purple-600 text-white hover:bg-purple-700"
                              : "bg-white border border-surface-300 text-surface-700 hover:bg-surface-50"
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {changingPlan === plan.key ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Traitement...
                        </span>
                      ) : (
                        "Choisir ce plan"
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
