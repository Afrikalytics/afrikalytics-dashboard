"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Lightbulb,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import type { Insight, Study } from "@/lib/types";
import {
  Breadcrumb,
  Button,
  Badge,
  Card,
  Alert,
  EmptyState,
  SkeletonTable,
} from "@/components/ui";
import { AccessDeniedScreen } from "@/components/AccessDeniedScreen";
import { pageVariants, listVariants, rowVariants } from "../_constants";

export default function AdminInsightsPage() {
  const { user, isLoading: authLoading, accessDenied } = useAuth({ requireAdmin: "insights" });
  const [insights, setInsights] = useState<Insight[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user || accessDenied) return;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [insightsData, studiesData] = await Promise.all([
          api.get<Insight[]>("/api/insights"),
          api.get<Study[]>("/api/studies"),
        ]);
        if (controller.signal.aborted) return;
        setInsights(insightsData);
        setStudies(studiesData);
      } catch (error) {
        if (!controller.signal.aborted) {
          // Erreur silencieuse — état loading gère l'affichage
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [authLoading, user, accessDenied]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet insight ?")) return;

    try {
      await api.delete(`/api/insights/${id}`);
      setInsights((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      // Erreur silencieuse
    }
  }, []);

  const getClosedStudies = () => {
    return studies.filter((s) => s.status === "Fermé");
  };

  if (accessDenied) return <AccessDeniedScreen />;

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="skeleton h-8 w-64 rounded" />
          <div className="skeleton h-4 w-80 rounded" />
        </div>
        <Card padding="md">
          <SkeletonTable rows={4} cols={5} />
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Administration", href: "/admin" },
          { label: "Insights" },
        ]}
        className="mb-2"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
            Gestion des Insights
          </h1>
          <p className="text-surface-500 mt-1">Rédigez des analyses pour les études fermées</p>
        </div>
        <Link href="/admin/insights/creer">
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
          >
            Nouvel Insight
          </Button>
        </Link>
      </div>

      {/* Info Box */}
      {getClosedStudies().length === 0 && (
        <Alert variant="warning" title="Information">
          Aucune étude fermée pour le moment. Les insights ne peuvent être créés que pour des études avec le statut &quot;Fermé&quot;.
        </Alert>
      )}

      {/* Insights Table — Desktop */}
      <div className="hidden lg:block">
        <Card padding="none" className="overflow-hidden">
          <table className="w-full" aria-label="Liste des insights">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Titre</th>
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Étude</th>
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Auteur</th>
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Statut</th>
                <th className="text-right px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <motion.tbody variants={listVariants} initial="hidden" animate="visible" className="divide-y divide-surface-100">
              {insights.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<Lightbulb className="h-8 w-8" />}
                      title="Aucun insight"
                      description="Créez votre premier insight pour une étude fermée."
                      action={
                        <Link href="/admin/insights/creer">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Plus className="h-4 w-4" />}
                          >
                            Créer un insight
                          </Button>
                        </Link>
                      }
                    />
                  </td>
                </tr>
              ) : (
                insights.map((insight) => {
                  const study = studies.find((s) => s.id === insight.study_id);
                  return (
                    <motion.tr key={insight.id} variants={rowVariants} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-surface-900">{insight.title}</p>
                        <p className="text-sm text-surface-400 truncate max-w-xs mt-0.5">{insight.summary}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="primary" size="sm">{study?.title || "N/A"}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-500">{insight.author}</td>
                      <td className="px-6 py-4">
                        {insight.is_published ? (
                          <Badge variant="success" size="sm" dot icon={<Eye className="h-3 w-3" />}>
                            Publié
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm" dot icon={<EyeOff className="h-3 w-3" />}>
                            Brouillon
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <a
                            href={`/admin/insights/modifier/${insight.id}`}
                            className="p-2 text-surface-400 hover:text-primary-600 hover:bg-surface-50 rounded-lg transition-colors"
                            aria-label={`Modifier ${insight.title}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </a>
                          <button
                            onClick={() => handleDelete(insight.id)}
                            className="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                            aria-label={`Supprimer ${insight.title}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </motion.tbody>
          </table>
        </Card>
      </div>

      {/* Insights Cards — Mobile */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="lg:hidden space-y-3"
      >
        {insights.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Lightbulb className="h-8 w-8" />}
              title="Aucun insight"
              description="Créez votre premier insight pour une étude fermée."
            />
          </Card>
        ) : (
          insights.map((insight) => {
            const study = studies.find((s) => s.id === insight.study_id);
            return (
              <motion.div key={insight.id} variants={rowVariants}>
                <Card padding="sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-surface-900 truncate">{insight.title}</h3>
                      <p className="text-sm text-surface-400 line-clamp-2 mt-1">{insight.summary}</p>
                      <Badge variant="primary" size="sm" className="mt-2">{study?.title || "N/A"}</Badge>
                    </div>
                    {insight.is_published ? (
                      <Badge variant="success" size="sm" dot className="ml-3 shrink-0">Publié</Badge>
                    ) : (
                      <Badge variant="default" size="sm" dot className="ml-3 shrink-0">Brouillon</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                    <span className="text-xs text-surface-400">{insight.author}</span>
                    <div className="flex gap-1">
                      <a
                        href={`/admin/insights/modifier/${insight.id}`}
                        className="p-2 text-surface-400 hover:text-primary-600 hover:bg-surface-50 rounded-lg transition-colors"
                        aria-label={`Modifier ${insight.title}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </a>
                      <button
                        onClick={() => handleDelete(insight.id)}
                        className="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        aria-label={`Supprimer ${insight.title}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
