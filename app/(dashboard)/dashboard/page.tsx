"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  ChevronRight,
  Clock,
  Download,
  Users,
  Lightbulb,
  CheckCircle,
  Coins,
  Infinity,
  Zap,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/lib/hooks/useAuth";
import { PLAN_BADGES, TOKEN_LABELS, ROUTES } from "@/lib/constants";
import type { DashboardStats, QuotaData } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";

// -----------------------------------------------------------------------------
// Animation variants
// -----------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// -----------------------------------------------------------------------------
// Mock activity data for the chart
// -----------------------------------------------------------------------------

function getActivityData() {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const today = new Date();
  return days.map((day, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return {
      day,
      date: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      études: Math.floor(Math.random() * 8) + 2,
      insights: Math.floor(Math.random() * 5) + 1,
    };
  });
}

// -----------------------------------------------------------------------------
// Loading skeleton
// -----------------------------------------------------------------------------

function DashboardPageSkeleton() {
  return (
    <div className="page-container space-y-8" aria-busy="true">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="skeleton h-8 w-64 rounded-lg" />
          <div className="skeleton h-4 w-48 rounded" />
        </div>
        <div className="skeleton h-8 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="skeleton h-64 rounded-2xl" />
      <div className="skeleton h-52 rounded-2xl" />
      <div className="card p-6 space-y-4">
        <div className="skeleton h-5 w-40 rounded" />
        <div className="skeleton h-20 rounded-xl" />
        <div className="skeleton h-20 rounded-xl" />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Custom Recharts Tooltip
// -----------------------------------------------------------------------------

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-surface-300">
          {entry.name}: <span className="text-white font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export default function DashboardPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [studies, setStudies] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityData] = useState(getActivityData);

  useEffect(() => {
    if (authLoading || !token) return;

    const fetchAllData = async () => {
      try {
        const [studiesRes, statsRes, quotaRes] = await Promise.all([
          fetch("/api/proxy/api/studies/active").catch(() => null),
          fetch("/api/proxy/api/dashboard/stats").catch(() => null),
          fetch("/api/proxy/api/users/quota").catch(() => null),
        ]);

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

    fetchAllData();
  }, [authLoading, token]);

  if (authLoading || loading) return <DashboardPageSkeleton />;

  const planBadge = PLAN_BADGES[user?.plan || "basic"] || PLAN_BADGES.basic;
  const isPremium = user?.plan === "professionnel" || user?.plan === "entreprise";

  return (
    <div className="page-container space-y-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl font-bold text-surface-900 tracking-tight">
            Bienvenue, {user?.full_name?.split(" ")[0]}
          </h1>
          <p className="text-surface-500 mt-1 text-sm">
            Voici un aperçu de vos études et insights
          </p>
        </div>
        <Badge
          variant={user?.plan === "entreprise" ? "accent" : user?.plan === "professionnel" ? "primary" : "default"}
          size="md"
        >
          {planBadge.label}
        </Badge>
      </motion.div>

      {/* ── Upgrade Banner ── */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card
            padding="none"
            className="bg-surface-900 text-white overflow-hidden border-none"
          >
            <div className="p-5 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  Passez à Premium
                </h3>
                <p className="text-surface-400 text-sm mt-0.5">
                  Accédez aux résultats en temps réel, insights complets et rapports détaillés
                </p>
              </div>
              <a
                href={ROUTES.PREMIUM}
                className="inline-flex items-center gap-2 bg-white text-surface-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-surface-100 transition-all text-sm whitespace-nowrap"
              >
                Voir les offres
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Team Banner ── */}
      {user?.plan === "entreprise" && !user?.parent_user_id && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card
            padding="none"
            className="border-l-4 border-l-accent-600 overflow-hidden"
          >
            <div className="p-5 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-accent-50 shrink-0" aria-hidden="true">
                  <Users className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900">Mon Équipe Entreprise</h3>
                  <p className="text-surface-500 text-sm mt-0.5">
                    Gérez les membres de votre équipe (jusqu&apos;à 5 utilisateurs)
                  </p>
                </div>
              </div>
              <a
                href={ROUTES.EQUIPE}
                className="inline-flex items-center gap-2 text-accent-700 font-semibold text-sm hover:text-accent-800 transition-colors whitespace-nowrap"
              >
                Gérer mon équipe
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Stats Cards ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        {[
          {
            label: "Études accessibles",
            value: stats?.studies_accessible || 0,
            icon: <FileText className="h-5 w-5" />,
            iconBg: "bg-surface-100 text-surface-600",
          },
          {
            label: "Études ouvertes",
            value: stats?.studies_open || 0,
            icon: <CheckCircle className="h-5 w-5" />,
            iconBg: "bg-surface-100 text-surface-600",
          },
          {
            label: "Insights disponibles",
            value: stats?.insights_available || 0,
            icon: <Lightbulb className="h-5 w-5" />,
            iconBg: "bg-surface-100 text-surface-600",
          },
          {
            label: "Rapports disponibles",
            value: stats?.reports_available || 0,
            icon: <Download className="h-5 w-5" />,
            iconBg: "bg-surface-100 text-surface-600",
          },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <div className="bg-white rounded-xl border border-surface-200 p-4 lg:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-2xl lg:text-3xl font-extrabold text-surface-900 mt-1 tracking-tight tabular-nums">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.iconBg}`} aria-hidden="true">
                  {stat.icon}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Activity Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card padding="none">
          <div className="px-5 lg:px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface-100" aria-hidden="true">
                <TrendingUp className="h-5 w-5 text-surface-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-surface-900 tracking-tight">
                  Activité des 7 derniers jours
                </h2>
                <p className="text-xs text-surface-500">Études et insights consultés</p>
              </div>
            </div>
          </div>
          <div className="p-5 lg:p-6">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientEtudes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientInsights" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="études"
                  name="Études"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#gradientEtudes)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="insights"
                  name="Insights"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#gradientInsights)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* ── Tokens / Quota ── */}
      {quota && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 lg:px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface-100" aria-hidden="true">
                  <Coins className="h-5 w-5 text-surface-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-surface-900 tracking-tight">
                    Mes Tokens
                  </h2>
                  <p className="text-xs text-surface-500">Utilisation du mois en cours</p>
                </div>
              </div>
              {quota.days_remaining !== null && (
                <Badge variant="outline">
                  {quota.days_remaining}j restants
                </Badge>
              )}
            </div>

            <div className="p-5 lg:p-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {quota.tokens.map((tokenItem) => {
                  const meta = TOKEN_LABELS[tokenItem.name] || { label: tokenItem.name, icon: "zap" };

                  return (
                    <motion.div
                      key={tokenItem.name}
                      variants={itemVariants}
                      className="border border-surface-200 rounded-xl p-4 hover:border-surface-300 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-surface-700">{meta.label}</span>
                        {tokenItem.unlimited ? (
                          <Badge variant="success" size="sm" icon={<Infinity className="h-3 w-3" />}>
                            Illimité
                          </Badge>
                        ) : (
                          <span className="text-xs text-surface-500 tabular-nums">
                            {tokenItem.used}/{tokenItem.limit}
                          </span>
                        )}
                      </div>

                      {tokenItem.unlimited ? (
                        <ProgressBar value={100} variant="success" size="sm" />
                      ) : (
                        <>
                          <ProgressBar
                            value={tokenItem.used}
                            max={tokenItem.limit}
                            autoColor
                            size="sm"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-surface-500">
                              {tokenItem.remaining} restant{(tokenItem.remaining ?? 0) > 1 ? "s" : ""}
                            </span>
                            {tokenItem.percentage >= 90 && (
                              <Badge variant="danger" size="sm" icon={<Zap className="h-3 w-3" />}>
                                Presque épuisé
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {quota.plan === "basic" && (
                <div className="mt-4 flex items-center justify-between bg-surface-50 rounded-xl p-4 border border-surface-200">
                  <p className="text-sm text-surface-600">
                    Passez à Premium pour débloquer des tokens illimités
                  </p>
                  <a
                    href={ROUTES.PREMIUM}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap ml-4"
                  >
                    Voir les offres
                  </a>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Recent Studies ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card padding="none">
          <div className="px-5 lg:px-6 py-4 border-b border-surface-100">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-surface-900 tracking-tight">
                Dernières Études
              </h2>
              <a
                href={ROUTES.ETUDES}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                Voir tout
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {studies.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="Aucune étude disponible"
              description="Les études apparaîtront ici dès qu'elles seront publiées."
            />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-surface-100"
            >
              {studies.map((study) => (
                <motion.a
                  key={study.id}
                  variants={itemVariants}
                  href={`/dashboard/etudes/${study.id}`}
                  className="group flex items-start justify-between gap-4 p-5 lg:p-6 hover:bg-surface-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors tracking-tight">
                        {study.title}
                      </h3>
                      <Badge
                        variant={study.status === "Ouvert" ? "success" : "danger"}
                        size="sm"
                        dot
                      >
                        {study.status}
                      </Badge>
                    </div>
                    <p className="text-surface-500 text-sm mb-3 line-clamp-2">
                      {study.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {study.duration || "15-20 min"}
                      </span>
                      <Badge variant="primary" size="sm">{study.category}</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-surface-300 group-hover:text-primary-500 transition-colors shrink-0 hidden sm:block mt-1" />
                </motion.a>
              ))}
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
