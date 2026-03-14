"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  BarChart3,
  Clock,
  Calendar,
  ChevronRight,
  Filter,
  Search,
  Lightbulb,
  Download,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { API_URL } from "@/lib/constants";
import type { Study, Insight, Report } from "@/lib/types";

// Skeleton component for loading states
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className || ''}`} />
);

export default function EtudesListPage() {
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");

  useEffect(() => {
    if (authLoading || !token) return;
    fetchData(token);
  }, [authLoading, token]);

  const fetchData = async (authToken: string) => {
    const headers = { Authorization: `Bearer ${authToken}` };

    try {
      // Parallel fetch — all three API calls at once (Issue #17)
      const [studiesRes, insightsRes, reportsRes] = await Promise.all([
        fetch(`${API_URL}/api/studies`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/insights`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/reports`, { headers }).catch(() => null),
      ]);

      // Parse responses in parallel
      const [studiesData, insightsData, reportsData] = await Promise.all([
        studiesRes?.ok ? studiesRes.json().catch(() => null) : null,
        insightsRes?.ok ? insightsRes.json().catch(() => null) : null,
        reportsRes?.ok ? reportsRes.json().catch(() => null) : null,
      ]);

      if (studiesData) setStudies(studiesData);
      if (insightsData) setInsights(insightsData);
      if (reportsData) setReports(reportsData);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered studies (Issue #19) — replaces useEffect + setFilteredStudies
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
    const storedToken = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/api/reports/${report.id}/download`, {
        method: "POST",
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      window.open(report.file_url, "_blank");
    } catch (error) {
      console.error("Erreur:", error);
      window.open(report.file_url, "_blank");
    }
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  }, []);

  // Loading skeleton (Issue #18)
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          {/* Filter skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
          {/* Studies grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="main-content" className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/dashboard/etudes" user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Toutes les Études</h1>
          <p className="text-gray-600">Consultez les résultats de nos études de marché</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une étude..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="Ouvert">Ouvert</option>
                <option value="Fermé">Fermé</option>
                <option value="Bientôt">Bientôt</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-500">
            {filteredStudies.length} étude{filteredStudies.length !== 1 ? "s" : ""} trouvée
            {filteredStudies.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Studies Grid */}
        {filteredStudies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">Aucune étude trouvée.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStudies.map((study) => {
              const insight = getInsightForStudy(study.id);
              const report = getReportForStudy(study.id);

              return (
                <div
                  key={study.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{study.title}</h3>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ml-3 ${
                        study.status === "Ouvert"
                          ? "bg-green-100 text-green-700"
                          : study.status === "Fermé"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {study.status}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{study.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{study.duration}</span>
                    </div>
                    {study.deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Jusqu&apos;au {study.deadline}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-blue-600 font-medium text-sm mb-4">{study.category}</div>

                  {/* Boutons */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {/* Bouton Résultats - Toujours visible */}
                    <a
                      href={`/dashboard/etudes/${study.id}`}
                      className="flex items-center justify-between w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        <span className="font-medium">
                          {study.status === "Ouvert" ? "Voir les résultats en temps réel" : "Voir les résultats finaux"}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5" />
                    </a>

                    {/* Bouton Insight */}
                    {insight ? (
                      <a
                        href={`/dashboard/insights/${insight.id}`}
                        className="flex items-center justify-between w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          <span className="font-medium">Lire l&apos;insight</span>
                        </div>
                        <ChevronRight className="h-5 w-5" />
                      </a>
                    ) : (
                      <div className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed">
                        <div className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          <span className="font-medium">Insight bientôt disponible</span>
                        </div>
                      </div>
                    )}

                    {/* Bouton Rapport */}
                    {report ? (
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="flex items-center justify-between w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                      >
                        <div className="flex items-center gap-2">
                          <Download className="h-5 w-5" />
                          <span className="font-medium">Télécharger le rapport ({report.file_size})</span>
                        </div>
                        <Download className="h-5 w-5" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed">
                        <div className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          <span className="font-medium">Rapport bientôt disponible</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
