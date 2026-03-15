"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Lightbulb,
  ChevronRight,
  Calendar,
  UserCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import type { Insight, Study } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
// Loading skeleton
// -----------------------------------------------------------------------------

function InsightsPageSkeleton() {
  return (
    <div className="page-container space-y-6" aria-busy="true">
      <div className="space-y-2">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="skeleton h-4 w-72 rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="h-56" />
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

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
      const [insightsData, studiesData] = await Promise.all([
        api.get<Insight[]>("/api/insights").catch(() => null),
        api.get<Study[]>("/api/studies").catch(() => null),
      ]);

      if (insightsData) setInsights(insightsData);
      if (studiesData) setStudies(studiesData);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

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

  if (authLoading || loading) return <InsightsPageSkeleton />;

  return (
    <div className="page-container space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
          Insights
        </h1>
        <p className="text-surface-500 mt-1 text-sm">
          Analyses et recommandations de nos experts
        </p>
      </motion.div>

      {/* ── Insights Grid ── */}
      {insights.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="h-8 w-8" />}
          title="Aucun insight disponible"
          description="Les insights seront disponibles après la clôture des études."
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {insights.map((insight) => {
            const study = getStudyForInsight(insight.study_id);
            return (
              <motion.a
                key={insight.id}
                variants={itemVariants}
                href={`/dashboard/insights/${insight.id}`}
                className="group block"
              >
                <Card
                  variant="bordered"
                  padding="none"
                  className="overflow-hidden hover:border-surface-300 hover:shadow-soft transition-all duration-200 h-full"
                >
                  <div className="p-5 lg:p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-surface-900 group-hover:text-primary-600 transition-colors tracking-tight">
                          {insight.title}
                        </h3>
                        {study && (
                          <p className="text-sm text-primary-600 font-medium mt-1 truncate">
                            {study.title}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-surface-300 group-hover:text-primary-500 transition-colors shrink-0 mt-1" />
                    </div>

                    {/* Summary */}
                    <p className="text-surface-500 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {insight.summary}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400 pt-4 border-t border-surface-100">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(insight.created_at || "")}
                      </span>
                      {insight.author && (
                        <span className="flex items-center gap-1.5">
                          <UserCircle className="h-3.5 w-3.5" />
                          {insight.author}
                        </span>
                      )}
                      {study && (
                        <Badge variant="default" size="sm">{study.category}</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.a>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
