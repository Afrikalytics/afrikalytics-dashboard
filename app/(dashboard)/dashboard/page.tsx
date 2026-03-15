"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import type { DashboardStats, QuotaData } from "@/lib/types";
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
        const [studiesData, statsData, quotaData] = await Promise.all([
          api.get<any[]>("/api/studies/active").catch(() => null),
          api.get<DashboardStats>("/api/dashboard/stats").catch(() => null),
          api.get<QuotaData>("/api/users/quota").catch(() => null),
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
