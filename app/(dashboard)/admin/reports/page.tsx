"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Trash2, Eye, EyeOff, Download, FileText } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import type { Study } from "@/lib/types";
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
  const {
    user,
    isLoading: authLoading,
    accessDenied,
  } = useAuth({ requireAdmin: "reports" });
  const [reports, setReports] = useState<ReportAdmin[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user || accessDenied) return;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [reportsData, studiesData] = await Promise.all([
          api.get<ReportAdmin[]>("/api/reports"),
          api.get<Study[]>("/api/studies"),
        ]);
        if (controller.signal.aborted) return;
        setReports(reportsData);
        setStudies(studiesData);
      } catch {
        if (!controller.signal.aborted) {
          setError("Une erreur est survenue. Veuillez réessayer.");
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
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?")) return;

    let snapshot: ReportAdmin[] = [];
    setReports((prev) => {
      snapshot = prev;
      return prev.filter((r) => r.id !== id);
    });

    try {
      await api.delete(`/api/reports/${id}`);
    } catch {
      setReports(snapshot);
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  }, []);

  const safeFileUrl = (url: string) =>
    url.startsWith("https://") || url.startsWith("http://") ? url : "#";

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
          <SkeletonTable rows={4} cols={6} />
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
          { label: "Rapports" },
        ]}
        className="mb-2"
      />

      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
            Gestion des Rapports
          </h1>
          <p className="text-surface-500 mt-1">
            Uploadez des rapports PDF pour les études fermées
          </p>
        </div>
        <Link href="/admin/reports/ajouter">
          <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
            Nouveau Rapport
          </Button>
        </Link>
      </div>

      {/* Info Box */}
      {getClosedStudies().length === 0 && (
        <Alert variant="warning" title="Information">
          Aucune étude fermée pour le moment. Les rapports ne peuvent être
          ajoutés que pour des études avec le statut &quot;Fermé&quot;.
        </Alert>
      )}

      {/* Reports Table — Desktop */}
      <div className="hidden lg:block">
        <Card padding="none" className="overflow-hidden">
          <table className="w-full" aria-label="Liste des rapports">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">
                  Étude
                </th>
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">
                  Taille
                </th>
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">
                  Téléchargements
                </th>
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-right px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <motion.tbody
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-surface-100"
            >
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<FileText className="h-8 w-8" />}
                      title="Aucun rapport"
                      description="Ajoutez votre premier rapport pour une étude fermée."
                      action={
                        <Link href="/admin/reports/ajouter">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Plus className="h-4 w-4" />}
                          >
                            Ajouter un rapport
                          </Button>
                        </Link>
                      }
                    />
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  const study = studies.find((s) => s.id === report.study_id);
                  return (
                    <motion.tr
                      key={report.id}
                      variants={rowVariants}
                      className="hover:bg-surface-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-surface-900">
                          {report.title}
                        </p>
                        <p className="text-sm text-surface-400 truncate max-w-xs mt-0.5">
                          {report.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="primary" size="sm">
                          {study?.title || "N/A"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-500">
                        {report.file_size || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-surface-500">
                          <Download
                            className="h-3.5 w-3.5 text-surface-400"
                            aria-hidden="true"
                          />
                          <span className="tabular-nums">
                            {report.download_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {report.is_available ? (
                          <Badge
                            variant="success"
                            size="sm"
                            dot
                            icon={<Eye className="h-3 w-3" />}
                          >
                            Disponible
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            size="sm"
                            dot
                            icon={<EyeOff className="h-3 w-3" />}
                          >
                            Indisponible
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <a
                            href={safeFileUrl(report.file_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-surface-400 hover:text-primary-600 hover:bg-surface-50 rounded-lg transition-colors"
                            aria-label={`Télécharger ${report.title}`}
                          >
                            <Download className="h-4 w-4" aria-hidden="true" />
                          </a>
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                            aria-label={`Supprimer ${report.title}`}
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

      {/* Reports Cards — Mobile */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="lg:hidden space-y-3"
      >
        {reports.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="Aucun rapport"
              description="Ajoutez votre premier rapport pour une étude fermée."
            />
          </Card>
        ) : (
          reports.map((report) => {
            const study = studies.find((s) => s.id === report.study_id);
            return (
              <motion.div key={report.id} variants={rowVariants}>
                <Card padding="sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-surface-900 truncate">
                        {report.title}
                      </h3>
                      <p className="text-sm text-surface-400 line-clamp-2 mt-1">
                        {report.description}
                      </p>
                      <Badge variant="primary" size="sm" className="mt-2">
                        {study?.title || "N/A"}
                      </Badge>
                      <div className="flex items-center gap-4 mt-2 text-xs text-surface-400">
                        <span>{report.file_size || "N/A"}</span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" aria-hidden="true" />
                          {report.download_count}
                        </span>
                      </div>
                    </div>
                    {report.is_available ? (
                      <Badge
                        variant="success"
                        size="sm"
                        dot
                        className="ml-3 shrink-0"
                      >
                        Dispo.
                      </Badge>
                    ) : (
                      <Badge
                        variant="default"
                        size="sm"
                        dot
                        className="ml-3 shrink-0"
                      >
                        Indispo.
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-surface-100">
                    <a
                      href={safeFileUrl(report.file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Télécharger
                    </a>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      aria-label={`Supprimer ${report.title}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
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
