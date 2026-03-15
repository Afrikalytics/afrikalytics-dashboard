"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import type { DashboardStats, QuotaData, Study } from "@/lib/types";
import dynamic from "next/dynamic";
import {
  DashboardHeader,
  UpgradeBanner,
  TeamBanner,
  DashboardPageSkeleton,
} from "./components";

// Code-split: heavy components (recharts ~200KB, framer-motion ~120KB)
// are lazy-loaded so the initial bundle stays small
const StatsCards = dynamic(
  () => import("./components/StatsCards").then((mod) => ({ default: mod.StatsCards })),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    ),
  }
);

const ActivityChartSection = dynamic(
  () => import("./components/ActivityChartSection").then((mod) => ({ default: mod.ActivityChartSection })),
  {
    ssr: false,
    loading: () => <div className="h-[340px] bg-gray-100 animate-pulse rounded-xl" />,
  }
);

const TokensQuota = dynamic(
  () => import("./components/TokensQuota").then((mod) => ({ default: mod.TokensQuota })),
  {
    ssr: false,
    loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-xl" />,
  }
);

const RecentStudies = dynamic(
  () => import("./components/RecentStudies").then((mod) => ({ default: mod.RecentStudies })),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />,
  }
);

// -----------------------------------------------------------------------------
// Mock activity data for the chart
// -----------------------------------------------------------------------------

// Static placeholder data — will be replaced by real API data (GET /api/dashboard/activity)
const PLACEHOLDER_ACTIVITY_DATA = [
  { day: "Lun", date: "", études: 3, insights: 1 },
  { day: "Mar", date: "", études: 5, insights: 2 },
  { day: "Mer", date: "", études: 4, insights: 3 },
  { day: "Jeu", date: "", études: 7, insights: 2 },
  { day: "Ven", date: "", études: 6, insights: 4 },
  { day: "Sam", date: "", études: 2, insights: 1 },
  { day: "Dim", date: "", études: 3, insights: 2 },
].map((item, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    ...item,
    date: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
  };
});

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityData] = useState(PLACEHOLDER_ACTIVITY_DATA);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchAllData = async () => {
      try {
        const [studiesData, statsData, quotaData] = await Promise.all([
          api.get<Study[]>("/api/studies/active").catch(() => null),
          api.get<DashboardStats>("/api/dashboard/stats").catch(() => null),
          api.get<QuotaData>("/api/users/quota").catch(() => null),
        ]);

        if (studiesData) setStudies(studiesData.slice(0, 3));
        if (statsData) setStats(statsData);
        if (quotaData) setQuota(quotaData);
      } catch (error) {
        // Erreur silencieuse — les états loading/empty gèrent l'affichage
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [authLoading, user]);

  if (authLoading || loading) return <DashboardPageSkeleton />;

  const isPremium = user?.plan === "professionnel" || user?.plan === "entreprise";

  return (
    <div className="page-container space-y-8">
      <DashboardHeader userName={user?.full_name} userPlan={user?.plan} />

      {!isPremium && <UpgradeBanner />}

      {user?.plan === "entreprise" && !user?.parent_user_id && <TeamBanner />}

      <StatsCards stats={stats} />

      <ActivityChartSection data={activityData} />

      {quota && <TokensQuota quota={quota} />}

      <RecentStudies studies={studies} />
    </div>
  );
}
