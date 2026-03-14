"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Download,
  ShieldX,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { api } from "@/lib/api";
import type { Study } from "@/lib/types";

interface ReportAdmin {
  id: number;
  study_id: number;
  title: string;
  description: string;
  file_url: string;
  file_size: string;
  download_count: number;
  is_available: boolean;
}

export default function AdminReportsPage() {
  const { user, token, isLoading: authLoading, accessDenied, logout } = useAuth({ requireAdmin: "reports" });
  const [reports, setReports] = useState<ReportAdmin[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !token || accessDenied) return;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        // Fetch reports and studies in parallel
        const [reportsData, studiesData] = await Promise.all([
          api.get<ReportAdmin[]>("/api/reports"),
          api.get<Study[]>("/api/studies"),
        ]);
        if (controller.signal.aborted) return;
        setReports(reportsData);
        setStudies(studiesData);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Erreur:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [authLoading, token, accessDenied]);

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?")) return;

    try {
      await api.delete(`/api/reports/${id}`);
      setReports(reports.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const getClosedStudies = () => {
    return studies.filter((s) => s.status === "Fermé");
  };

  // Access Denied screen
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-6">
            Cette page est réservée aux administrateurs. Vous n&apos;avez pas les permissions nécessaires pour y accéder.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Retour au dashboard
          </a>
        </div>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div id="main-content" className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/admin/reports" user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestion des Rapports</h1>
            <p className="text-gray-600 mt-1">Uploadez des rapports PDF pour les études fermées</p>
          </div>
          <a
            href="/admin/reports/ajouter"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center"
          >
            <Plus className="h-5 w-5" />
            Nouveau Rapport
          </a>
        </div>

        {/* Info Box */}
        {getClosedStudies().length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Note :</strong> Aucune étude fermée pour le moment. Les rapports ne peuvent être ajoutés que pour des études avec le statut &quot;Fermé&quot;.
            </p>
          </div>
        )}

        {/* Reports Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Titre</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Étude</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Taille</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Téléchargements</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Statut</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun rapport pour le moment. Ajoutez votre premier rapport !
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  const study = studies.find((s) => s.id === report.study_id);
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{report.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{report.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-blue-600 font-medium">{study?.title || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{report.file_size || "N/A"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{report.download_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {report.is_available ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <Eye className="h-4 w-4" />
                            <span className="text-xs font-semibold">Disponible</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <EyeOff className="h-4 w-4" />
                            <span className="text-xs font-semibold">Non disponible</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <a
                            href={report.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Reports Cards - Mobile */}
        <div className="lg:hidden space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Aucun rapport pour le moment. Ajoutez votre premier rapport !
            </div>
          ) : (
            reports.map((report) => {
              const study = studies.find((s) => s.id === report.study_id);
              return (
                <div key={report.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{report.description}</p>
                      <p className="text-xs text-blue-600 font-medium mt-2">{study?.title || "N/A"}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{report.file_size || "N/A"}</span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {report.download_count}
                        </span>
                      </div>
                    </div>
                    {report.is_available ? (
                      <Eye className="h-5 w-5 text-green-600 ml-2" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-gray-400 ml-2" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={report.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-center text-sm"
                    >
                      Télécharger
                    </a>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
