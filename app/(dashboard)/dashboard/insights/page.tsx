"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Lightbulb,
  ChevronRight,
  Calendar,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Insight, Study } from "@/lib/types";

// Skeleton component for loading states
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className || ''}`} />
);

export default function InsightsListPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !token) return;
    fetchData();
  }, [authLoading, token]);

  const fetchData = async () => {
    try {
      // Parallel fetch through proxy — auth injected server-side
      const [insightsRes, studiesRes] = await Promise.all([
        fetch("/api/proxy/api/insights").catch(() => null),
        fetch("/api/proxy/api/studies").catch(() => null),
      ]);

      // Parse responses in parallel
      const [insightsData, studiesData] = await Promise.all([
        insightsRes?.ok ? insightsRes.json().catch(() => null) : null,
        studiesRes?.ok ? studiesRes.json().catch(() => null) : null,
      ]);

      if (insightsData) setInsights(insightsData);
      if (studiesData) setStudies(studiesData);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memoized study lookup map for O(1) access (Issue #19)
  const studyMap = useMemo(() => {
    const map = new Map<number, Study>();
    studies.forEach((s) => map.set(s.id, s));
    return map;
  }, [studies]);

  const getStudyForInsight = useCallback((studyId: number) => {
    return studyMap.get(studyId);
  }, [studyMap]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  // Loading skeleton (Issue #18) — auth loading is handled by the layout
  if (authLoading || loading) {
    return (
      <>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-40" />
          </div>
          <Skeleton className="h-5 w-72" />
        </div>
        {/* Insights grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Lightbulb className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Insights</h1>
          </div>
          <p className="text-gray-600">Analyses et recommandations de nos experts</p>
        </div>

        {/* Insights Grid */}
        {insights.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun insight disponible pour le moment.</p>
            <p className="text-gray-400 text-sm mt-2">Les insights seront disponibles après la clôture des études.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight) => {
              const study = getStudyForInsight(insight.study_id);
              return (
                <a
                  key={insight.id}
                  href={`/dashboard/insights/${insight.id}`}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition">
                      <Lightbulb className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition">
                        {insight.title}
                      </h3>
                      {study && (
                        <p className="text-sm text-blue-600 font-medium mt-1">{study.title}</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition" />
                  </div>

                  {/* Summary */}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{insight.summary}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(insight.created_at || "")}</span>
                    </div>
                    {insight.author && (
                      <div className="flex items-center gap-1">
                        <UserCircle className="h-4 w-4" />
                        <span>{insight.author}</span>
                      </div>
                    )}
                    {study && (
                      <span className="bg-gray-100 px-2 py-1 rounded">{study.category}</span>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
    </>
  );
}
