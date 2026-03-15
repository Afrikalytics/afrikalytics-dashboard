"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { api, ApiRequestError } from "@/lib/api";
import type { Study } from "@/lib/types";
import {
  Breadcrumb,
  Button,
  Badge,
  Card,
  EmptyState,
  SkeletonTable,
} from "@/components/ui";
import { AccessDeniedScreen } from "@/components/AccessDeniedScreen";
import { pageVariants, listVariants, rowVariants } from "./_constants";

export default function AdminPage() {
  const { user, isLoading: authLoading, accessDenied } = useAuth({ requireAdmin: "studies" });
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (authLoading || !user || accessDenied) return;
    const controller = new AbortController();

    const fetchStudies = async () => {
      try {
        const data = await api.get<Study[]>("/api/studies");
        if (!controller.signal.aborted) {
          setStudies(data);
        }
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

    fetchStudies();
    return () => controller.abort();
  }, [authLoading, user, accessDenied]);

  // useCallback + functional state update (Issue #19)
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette étude ?")) return;

    try {
      await api.delete(`/api/studies/${id}`);
      setStudies((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      // Erreur silencieuse
    }
  }, []);

  const filteredStudies = useMemo(() => studies.filter((study) => {
    const matchesSearch =
      !searchTerm ||
      study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || study.status === filterStatus;
    return matchesSearch && matchesStatus;
  }), [studies, searchTerm, filterStatus]);

  if (accessDenied) return <AccessDeniedScreen />;

  // Loading skeleton
  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="skeleton h-8 w-64 rounded" />
            <div className="skeleton h-4 w-80 rounded" />
          </div>
          <div className="skeleton h-10 w-40 rounded-lg" />
        </div>
        <Card padding="md">
          <SkeletonTable rows={5} cols={5} />
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
          { label: "Études" },
        ]}
        className="mb-2"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
            Gestion des Études
          </h1>
          <p className="text-surface-500 mt-1">
            {studies.length} étude{studies.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Link href="/admin/ajouter">
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
          >
            Nouvelle Étude
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card padding="sm" className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Rechercher une étude..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-surface-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 hover:border-surface-400 transition-all placeholder:text-surface-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 text-sm border border-surface-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 hover:border-surface-400 appearance-none cursor-pointer w-full sm:w-auto"
        >
          <option value="all">Tous les statuts</option>
          <option value="Ouvert">Ouvert</option>
          <option value="Fermé">Fermé</option>
          <option value="Bientôt">Bientôt</option>
        </select>
      </Card>

      {/* Studies Table — Desktop */}
      <div className="hidden lg:block">
        <Card padding="none" className="overflow-hidden">
          <table className="w-full" aria-label="Liste des études">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Titre</th>
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Catégorie</th>
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Visible</th>
                <th className="text-right px-6 py-3.5 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <motion.tbody variants={listVariants} initial="hidden" animate="visible" className="divide-y divide-surface-100">
              {filteredStudies.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<BookOpen className="h-8 w-8" />}
                      title="Aucune étude trouvée"
                      description={searchTerm ? "Essayez de modifier vos critères de recherche." : "Créez votre première étude pour commencer."}
                      action={
                        !searchTerm ? (
                          <Link href="/admin/ajouter">
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<Plus className="h-4 w-4" />}
                            >
                              Créer une étude
                            </Button>
                          </Link>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredStudies.map((study) => (
                  <motion.tr key={study.id} variants={rowVariants} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-surface-900">{study.title}</p>
                      <p className="text-sm text-surface-400 truncate max-w-xs mt-0.5">{study.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary" size="sm">{study.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          study.status === "Ouvert" ? "success" :
                          study.status === "Fermé" ? "danger" : "warning"
                        }
                        size="sm"
                        dot
                      >
                        {study.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {study.is_active ? (
                        <Eye className="h-4 w-4 text-success-500" aria-label="Visible" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-surface-300" aria-label="Masqué" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <a
                          href={`/admin/modifier/${study.id}`}
                          aria-label={`Modifier ${study.title}`}
                          className="p-2 text-surface-400 hover:text-primary-600 hover:bg-surface-50 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </a>
                        <button
                          onClick={() => handleDelete(study.id)}
                          aria-label={`Supprimer ${study.title}`}
                          className="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </motion.tbody>
          </table>
        </Card>
      </div>

      {/* Studies Cards — Mobile */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="lg:hidden space-y-3"
      >
        {filteredStudies.length === 0 ? (
          <Card>
            <EmptyState
              icon={<BookOpen className="h-8 w-8" />}
              title="Aucune étude trouvée"
              description={searchTerm ? "Essayez de modifier vos critères de recherche." : "Créez votre première étude pour commencer."}
            />
          </Card>
        ) : (
          filteredStudies.map((study) => (
            <motion.div key={study.id} variants={rowVariants}>
              <Card padding="sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-surface-900 truncate">{study.title}</h3>
                    <p className="text-sm text-surface-400 line-clamp-2 mt-1">{study.description}</p>
                  </div>
                  {study.is_active ? (
                    <Eye className="h-4 w-4 text-success-500 ml-3 shrink-0" aria-hidden="true" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-surface-300 ml-3 shrink-0" aria-hidden="true" />
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{study.category}</Badge>
                    <Badge
                      variant={
                        study.status === "Ouvert" ? "success" :
                        study.status === "Fermé" ? "danger" : "warning"
                      }
                      size="sm"
                      dot
                    >
                      {study.status}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <a
                      href={`/admin/modifier/${study.id}`}
                      aria-label={`Modifier ${study.title}`}
                      className="p-2 text-surface-400 hover:text-primary-600 hover:bg-surface-50 rounded-lg transition-colors"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <button
                      onClick={() => handleDelete(study.id)}
                      aria-label={`Supprimer ${study.title}`}
                      className="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
