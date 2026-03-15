"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  BarChart3,
  Clock,
  Calendar,
  ChevronRight,
  Search,
  Lightbulb,
  Download,
  Lock,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import type { Study, Insight, Report } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
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

function EtudesPageSkeleton() {
  return (
    <div className="page-container space-y-6" aria-busy="true">
      <div className="space-y-2">
        <div className="skeleton h-8 w-64 rounded-lg" />
        <div className="skeleton h-4 w-80 rounded" />
      </div>
      <div className="card p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="skeleton h-10 flex-1 rounded-xl" />
          <div className="skeleton h-10 w-48 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="h-72" />
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export default function EtudesListPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
  }, [authLoading, user]);

  const fetchData = async () => {
    try {
      const [studiesData, insightsData, reportsData] = await Promise.all([
        api.get<Study[]>("/api/studies").catch(() => null),
        api.get<Insight[]>("/api/insights").catch(() => null),
        api.get<Report[]>("/api/reports").catch(() => null),
      ]);

      if (studiesData) setStudies(studiesData);
      if (insightsData) setInsights(insightsData);
      if (reportsData) setReports(reportsData);
    } catch (error) {
      // Erreur silencieuse — état loading/empty gère l'affichage
    } finally {
      setLoading(false);
    }
  };

  const filteredStudies = useMemo(() => {
    let filtered = studies;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (study) =>
          study.title.toLowerCase().includes(term) ||
          study.description.toLowerCase().includes(term) ||
          study.category.toLowerCase().includes(term)
      );
    }

    if (filterStatus !== "Tous") {
      filtered = filtered.filter((study) => study.status === filterStatus);
    }

    return filtered;
  }, [studies, searchTerm, filterStatus]);

  const getInsightForStudy = useCallback((studyId: number) => {
    return insights.find((i) => i.study_id === studyId && i.is_published);
  }, [insights]);

  const getReportForStudy = useCallback((studyId: number) => {
    return reports.find((r) => r.study_id === studyId && r.is_available);
  }, [reports]);

  const handleDownloadReport = useCallback(async (report: Report) => {
    try {
      await api.post(`/api/reports/${report.id}/download`);
      window.open(report.file_url, "_blank");
    } catch (error) {
      // Erreur tracking silencieuse — le téléchargement continue
      window.open(report.file_url, "_blank");
    }
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  }, []);

  if (authLoading || loading) return <EtudesPageSkeleton />;

  return (
    <div className="page-container space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
          Toutes les Études
        </h1>
        <p className="text-surface-500 mt-1 text-sm">
          Consultez les résultats de nos études de marché
        </p>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une étude..."
                value={searchTerm}
                onChange={handleSearchChange}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select
              value={filterStatus}
              onChange={handleFilterChange}
              options={[
                { value: "Tous", label: "Tous les statuts" },
                { value: "Ouvert", label: "Ouvert" },
                { value: "Fermé", label: "Fermé" },
                { value: "Bientôt", label: "Bientôt" },
              ]}
            />
          </div>
          <p className="mt-3 text-xs text-surface-400 tracking-wide uppercase">
            {filteredStudies.length} étude{filteredStudies.length !== 1 ? "s" : ""} trouvée{filteredStudies.length !== 1 ? "s" : ""}
          </p>
        </Card>
      </motion.div>

      {/* ── Studies Grid ── */}
      {filteredStudies.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="Aucune étude trouvée"
          description="Essayez de modifier vos filtres ou votre recherche."
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredStudies.map((study) => {
            const insight = getInsightForStudy(study.id);
            const report = getReportForStudy(study.id);

            return (
              <motion.div key={study.id} variants={itemVariants}>
                <Card
                  variant="bordered"
                  padding="none"
                  className="overflow-hidden hover:border-surface-300 hover:shadow-soft transition-all duration-200"
                >
                  <div className="p-5 lg:p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-surface-900 flex-1 tracking-tight">
                        {study.title}
                      </h3>
                      <Badge
                        variant={
                          study.status === "Ouvert"
                            ? "success"
                            : study.status === "Fermé"
                            ? "danger"
                            : "warning"
                        }
                        size="sm"
                        dot
                        className="ml-3"
                      >
                        {study.status}
                      </Badge>
                    </div>

                    <p className="text-surface-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {study.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-surface-400 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {study.duration}
                      </span>
                      {study.deadline && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Jusqu&apos;au {study.deadline}
                        </span>
                      )}
                    </div>

                    <Badge variant="primary" size="sm">{study.category}</Badge>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-surface-100 divide-y divide-surface-100">
                    <a
                      href={`/dashboard/etudes/${study.id}`}
                      className="group flex items-center justify-between px-5 lg:px-6 py-3 hover:bg-surface-50 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-surface-700 group-hover:text-primary-600 transition-colors">
                        <BarChart3 className="h-4 w-4" />
                        {study.status === "Ouvert" ? "Voir les résultats en temps réel" : "Voir les résultats finaux"}
                      </span>
                      <ChevronRight className="h-4 w-4 text-surface-300 group-hover:text-primary-500 transition-colors" />
                    </a>

                    {insight ? (
                      <a
                        href={`/dashboard/insights/${insight.id}`}
                        className="group flex items-center justify-between px-5 lg:px-6 py-3 hover:bg-surface-50 transition-colors"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-surface-700 group-hover:text-accent-600 transition-colors">
                          <Lightbulb className="h-4 w-4" />
                          Lire l&apos;insight
                        </span>
                        <ChevronRight className="h-4 w-4 text-surface-300 group-hover:text-accent-500 transition-colors" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 px-5 lg:px-6 py-3 text-sm text-surface-400">
                        <Lock className="h-4 w-4" />
                        Insight bientôt disponible
                      </div>
                    )}

                    {report ? (
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="group flex items-center justify-between w-full px-5 lg:px-6 py-3 hover:bg-surface-50 transition-colors text-left"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-surface-700 group-hover:text-success-600 transition-colors">
                          <Download className="h-4 w-4" />
                          Télécharger le rapport ({report.file_size})
                        </span>
                        <Download className="h-4 w-4 text-surface-300 group-hover:text-success-500 transition-colors" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-5 lg:px-6 py-3 text-sm text-surface-400">
                        <Lock className="h-4 w-4" />
                        Rapport bientôt disponible
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
