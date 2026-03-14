"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Crown,
  ChevronRight,
  Clock,
  Download,
  Users,
  Lightbulb,
  CheckCircle,
  Coins,
  Infinity,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { API_URL, PLAN_BADGES, TOKEN_LABELS, ROUTES } from "@/lib/constants";
import type { DashboardStats, QuotaData } from "@/lib/types";

// Skeleton component for loading states
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className || ''}`} />
);

export default function DashboardPage() {
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const [studies, setStudies] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !token) return;
    fetchAllData(token);
  }, [authLoading, token]);

  const fetchAllData = async (authToken: string) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    try {
      // Parallel fetch — all three API calls at once (Issue #17)
      const [studiesRes, statsRes, quotaRes] = await Promise.all([
        fetch(`${API_URL}/api/studies/active`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/dashboard/stats`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/users/quota`, { headers }).catch(() => null),
      ]);

      // Parse responses in parallel
      const [studiesData, statsData, quotaData] = await Promise.all([
        studiesRes?.ok ? studiesRes.json().catch(() => null) : null,
        statsRes?.ok ? statsRes.json().catch(() => null) : null,
        quotaRes?.ok ? quotaRes.json().catch(() => null) : null,
      ]);

      if (studiesData) setStudies(studiesData.slice(0, 3));
      if (statsData) setStats(statsData);
      if (quotaData) setQuota(quotaData);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = useCallback((percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-orange-500";
    return "bg-blue-600";
  }, []);

  // Loading skeleton (Issue #18)
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
          {/* Stats cards skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          {/* Tokens skeleton */}
          <Skeleton className="h-48 rounded-xl mb-8" />
          {/* Studies skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const planBadge = PLAN_BADGES[user?.plan || "basic"] || PLAN_BADGES.basic;
  const isPremium = user?.plan === "professionnel" || user?.plan === "entreprise";

  return (
    <div id="main-content" className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/dashboard" user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Bienvenue, {user?.full_name?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Voici un aperçu de vos études et insights
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${planBadge.bg}`}>
            <Crown className={`h-4 w-4 ${planBadge.text}`} />
            <span className={`font-medium ${planBadge.text}`}>{planBadge.label}</span>
          </div>
        </div>

        {/* Upgrade Banner for Basic users */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 lg:p-6 mb-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-300" />
                  Passez à Premium
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  Accédez aux résultats en temps réel, insights complets et rapports détaillés
                </p>
              </div>
              <a
                href={ROUTES.PREMIUM}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition text-sm whitespace-nowrap"
              >
                Voir les offres
              </a>
            </div>
          </div>
        )}

        {/* Carte Mon Équipe - uniquement pour propriétaire Entreprise (pas les membres invités) */}
        {user?.plan === "entreprise" && !user?.parent_user_id && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 lg:p-6 mb-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mon Équipe Entreprise
                </h3>
                <p className="text-purple-100 text-sm mt-1">
                  Gérez les membres de votre équipe (jusqu&apos;à 5 utilisateurs)
                </p>
              </div>
              <a
                href={ROUTES.EQUIPE}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition text-sm whitespace-nowrap"
              >
                Gérer mon équipe
              </a>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-2 lg:p-3 rounded-lg">
                <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats?.studies_accessible || 0}</p>
            <p className="text-gray-600 text-xs lg:text-sm">Études accessibles</p>
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-2 lg:p-3 rounded-lg">
                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats?.studies_open || 0}</p>
            <p className="text-gray-600 text-xs lg:text-sm">Études ouvertes</p>
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-2 lg:p-3 rounded-lg">
                <Lightbulb className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats?.insights_available || 0}</p>
            <p className="text-gray-600 text-xs lg:text-sm">Insights disponibles</p>
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-2 lg:p-3 rounded-lg">
                <Download className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats?.reports_available || 0}</p>
            <p className="text-gray-600 text-xs lg:text-sm">Rapports disponibles</p>
          </div>
        </div>

        {/* Tokens / Quota Card */}
        {quota && (
          <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Coins className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Mes Tokens</h2>
                  <p className="text-xs text-gray-500">
                    Utilisation du mois en cours
                  </p>
                </div>
              </div>
              {quota.days_remaining !== null && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {quota.days_remaining}j
                  </p>
                  <p className="text-xs text-gray-500">restants</p>
                </div>
              )}
            </div>

            <div className="p-4 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quota.tokens.map((tokenItem) => {
                  const meta = TOKEN_LABELS[tokenItem.name] || {
                    label: tokenItem.name,
                    icon: "zap",
                  };

                  return (
                    <div
                      key={tokenItem.name}
                      className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          {meta.label}
                        </span>
                        {tokenItem.unlimited ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <Infinity className="h-3 w-3" />
                            Illimite
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {tokenItem.used}/{tokenItem.limit}
                          </span>
                        )}
                      </div>

                      {tokenItem.unlimited ? (
                        <div className="w-full bg-green-100 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full w-full" />
                        </div>
                      ) : (
                        <>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className={`${getProgressColor(tokenItem.percentage)} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${Math.min(tokenItem.percentage, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {tokenItem.remaining} restant{(tokenItem.remaining ?? 0) > 1 ? "s" : ""}
                            </span>
                            {tokenItem.percentage >= 90 && (
                              <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                Presque epuise
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Upgrade CTA for basic users */}
              {quota.plan === "basic" && (
                <div className="mt-4 flex items-center justify-between bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    Passez a Premium pour debloquer des tokens illimites
                  </p>
                  <a
                    href={ROUTES.PREMIUM}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap ml-4"
                  >
                    Voir les offres
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Studies */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 lg:p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">Dernières Études</h2>
              <a href={ROUTES.ETUDES} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                Voir tout <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {studies.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Aucune étude disponible pour le moment.
              </div>
            ) : (
              studies.map((study) => (
                <a
                  key={study.id}
                  href={`/dashboard/etudes/${study.id}`}
                  className="block p-4 lg:p-6 hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{study.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            study.status === "Ouvert"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {study.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{study.description}</p>
                      <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {study.duration || "15-20 min"}
                        </span>
                        <span className="text-blue-600 font-medium">{study.category}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 hidden sm:block" />
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
