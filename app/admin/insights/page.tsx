"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ShieldX,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Sidebar } from "@/components/Sidebar";
import { api } from "@/lib/api";
import type { Insight, Study } from "@/lib/types";

export default function AdminInsightsPage() {
  const { user, token, isLoading: authLoading, accessDenied, logout } = useAuth({ requireAdmin: "insights" });
  const [insights, setInsights] = useState<Insight[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !token || accessDenied) return;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        // Fetch insights and studies in parallel
        const [insightsData, studiesData] = await Promise.all([
          api.get<Insight[]>("/api/insights"),
          api.get<Study[]>("/api/studies"),
        ]);
        if (controller.signal.aborted) return;
        setInsights(insightsData);
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
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet insight ?")) return;

    try {
      await api.delete(`/api/insights/${id}`);
      setInsights(insights.filter((i) => i.id !== id));
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
      <Sidebar currentPath="/admin/insights" user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestion des Insights</h1>
            <p className="text-gray-600 mt-1">Rédigez des analyses pour les études fermées</p>
          </div>
          <a
            href="/admin/insights/creer"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center"
          >
            <Plus className="h-5 w-5" />
            Nouvel Insight
          </a>
        </div>

        {/* Info Box */}
        {getClosedStudies().length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Note :</strong> Aucune étude fermée pour le moment. Les insights ne peuvent être créés que pour des études avec le statut &quot;Fermé&quot;.
            </p>
          </div>
        )}

        {/* Insights Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Titre</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Étude</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Auteur</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Statut</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {insights.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucun insight pour le moment. Créez votre premier insight !
                  </td>
                </tr>
              ) : (
                insights.map((insight) => {
                  const study = studies.find((s) => s.id === insight.study_id);
                  return (
                    <tr key={insight.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{insight.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{insight.summary}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-blue-600 font-medium">{study?.title || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{insight.author}</td>
                      <td className="px-6 py-4">
                        {insight.is_published ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <Eye className="h-4 w-4" />
                            <span className="text-xs font-semibold">Publié</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <EyeOff className="h-4 w-4" />
                            <span className="text-xs font-semibold">Brouillon</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`/admin/insights/modifier/${insight.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Pencil className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(insight.id)}
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

        {/* Insights Cards - Mobile */}
        <div className="lg:hidden space-y-4">
          {insights.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Aucun insight pour le moment. Créez votre premier insight !
            </div>
          ) : (
            insights.map((insight) => {
              const study = studies.find((s) => s.id === insight.study_id);
              return (
                <div key={insight.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{insight.summary}</p>
                      <p className="text-xs text-blue-600 font-medium mt-2">{study?.title || "N/A"}</p>
                    </div>
                    {insight.is_published ? (
                      <Eye className="h-5 w-5 text-green-600 ml-2" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-gray-400 ml-2" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{insight.author}</span>
                    <div className="flex gap-2">
                      <a
                        href={`/admin/insights/modifier/${insight.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Pencil className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(insight.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
