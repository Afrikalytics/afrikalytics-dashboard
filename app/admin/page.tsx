"use client";

import { useEffect, useState, useCallback } from "react";
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
import { api, ApiRequestError } from "@/lib/api";
import type { Study } from "@/lib/types";

// Skeleton component for loading states (Issue #18)
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className || ''}`} />
);

export default function AdminPage() {
  const { user, token, isLoading: authLoading, accessDenied, logout } = useAuth({ requireAdmin: "studies" });
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !token || accessDenied) return;
    const controller = new AbortController();

    const fetchStudies = async () => {
      try {
        const data = await api.get<Study[]>("/api/studies");
        if (!controller.signal.aborted) {
          setStudies(data);
        }
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

    fetchStudies();
    return () => controller.abort();
  }, [authLoading, token, accessDenied]);

  // useCallback + functional state update (Issue #19)
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette étude ?")) return;

    try {
      await api.delete(`/api/studies/${id}`);
      setStudies((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, []);

  // Access Denied screen
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-10 w-10 text-red-600" aria-hidden="true" />
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

  // Loading skeleton (Issue #18)
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
          {/* Table skeleton */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/admin" user={user} onLogout={logout} />

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestion des Études</h1>
            <p className="text-gray-600 mt-1">Ajoutez, modifiez ou supprimez des études</p>
          </div>
          <a
            href="/admin/ajouter"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Nouvelle Étude
          </a>
        </div>

        {/* Studies Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full" aria-label="Liste des études">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Titre</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Catégorie</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Visible</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucune étude pour le moment. Créez votre première étude !
                  </td>
                </tr>
              ) : (
                studies.map((study) => (
                  <tr key={study.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{study.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{study.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-blue-600 font-medium">{study.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          study.status === "Ouvert"
                            ? "bg-green-100 text-green-700"
                            : study.status === "Fermé"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {study.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {study.is_active ? (
                        <Eye className="h-5 w-5 text-green-600" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/admin/modifier/${study.id}`}
                          aria-label={`Modifier ${study.title}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </a>
                        <button
                          onClick={() => handleDelete(study.id)}
                          aria-label={`Supprimer ${study.title}`}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Studies Cards - Mobile */}
        <div className="lg:hidden space-y-4">
          {studies.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Aucune étude pour le moment. Créez votre première étude !
            </div>
          ) : (
            studies.map((study) => (
              <div key={study.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{study.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{study.description}</p>
                  </div>
                  {study.is_active ? (
                    <Eye className="h-5 w-5 text-green-600 ml-2" aria-hidden="true" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400 ml-2" aria-hidden="true" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-600 font-medium">{study.category}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
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
                  <div className="flex gap-2">
                    <a
                      href={`/admin/modifier/${study.id}`}
                      aria-label={`Modifier ${study.title}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <button
                      onClick={() => handleDelete(study.id)}
                      aria-label={`Supprimer ${study.title}`}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
