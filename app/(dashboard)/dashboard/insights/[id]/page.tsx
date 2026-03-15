"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Lightbulb,
  User as UserIcon,
  Calendar,
  Lock,
  CheckCircle,
  AlertCircle,
  Download,
  BarChart3,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface InsightDetail {
  id: number;
  study_id: number;
  title: string;
  summary: string;
  key_findings: string;
  recommendations: string;
  author: string;
  created_at: string;
}

interface StudyDetail {
  id: number;
  title: string;
  report_url_basic: string;
  report_url_premium: string;
}

// -----------------------------------------------------------------------------
// Animation variants
// -----------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export default function InsightDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [insight, setInsight] = useState<InsightDetail | null>(null);
  const [study, setStudy] = useState<StudyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const data = await api.get<InsightDetail>(`/api/insights/${params.id}`);
        setInsight(data);

        try {
          const studyData = await api.get<StudyDetail>(`/api/studies/${data.study_id}`);
          setStudy(studyData);
        } catch {}
      } catch (error) {
        // Erreur silencieuse — état loading/empty gère l'affichage
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [params.id]);

  const isPremium = user?.plan === "professionnel" || user?.plan === "entreprise";

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getReportUrl = () => {
    if (!study) return null;
    if (isPremium && study.report_url_premium) {
      return study.report_url_premium;
    }
    return study.report_url_basic;
  };

  // Loading
  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-surface-400" />
      </div>
    );
  }

  // Not found
  if (!insight) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<Lightbulb className="h-8 w-8" />}
          title="Insight non trouvé"
          description="Cet insight n'existe pas ou a été supprimé."
          action={
            <Link href={ROUTES.INSIGHTS}>
              <Button variant="secondary">Retour aux insights</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl mx-auto space-y-6">
      {/* ── Breadcrumb ── */}
      <Breadcrumb
        items={[
          { label: "Insights", href: ROUTES.INSIGHTS },
          { label: insight.title },
        ]}
      />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"
      >
        <div className="flex-1">
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
            {insight.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-surface-400">
            {insight.author && (
              <span className="flex items-center gap-1.5">
                <UserIcon className="h-4 w-4" />
                {insight.author}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(insight.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <Badge
          variant={isPremium ? "primary" : "default"}
          size="md"
        >
          {isPremium ? "Premium" : "Basic"}
        </Badge>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {study && (
          <motion.div variants={itemVariants}>
            <Link
              href={`/dashboard/etudes/${study.id}`}
              className="group block"
            >
              <Card variant="bordered" className="hover:border-surface-300 hover:shadow-soft transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary-50 shrink-0" aria-hidden="true">
                    <BarChart3 className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">
                      Voir les résultats
                    </p>
                    <p className="text-sm text-surface-500 truncate">{study.title}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-surface-300 group-hover:text-primary-500 transition-colors" />
                </div>
              </Card>
            </Link>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          {getReportUrl() ? (
            <a
              href={getReportUrl()!}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <Card variant="bordered" className="hover:border-surface-300 hover:shadow-soft transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-success-50 shrink-0" aria-hidden="true">
                    <Download className="h-5 w-5 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-surface-900 group-hover:text-success-600 transition-colors">
                      Télécharger le rapport
                    </p>
                    <p className="text-sm text-surface-500">
                      {isPremium ? "Version complète" : "Version Basic"}
                    </p>
                  </div>
                  <Download className="h-4 w-4 text-surface-300" />
                </div>
              </Card>
            </a>
          ) : (
            <Card variant="bordered" className="opacity-60">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-surface-100 shrink-0" aria-hidden="true">
                  <Download className="h-5 w-5 text-surface-400" />
                </div>
                <div>
                  <p className="font-semibold text-surface-400">Rapport bientôt disponible</p>
                  <p className="text-sm text-surface-400">En préparation</p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* ── Content Sections ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Résumé exécutif */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent-50" aria-hidden="true">
                <Lightbulb className="h-5 w-5 text-accent-600" />
              </div>
              <h2 className="text-base font-semibold text-surface-900 tracking-tight">
                Résumé exécutif
              </h2>
            </div>
            <p className="text-surface-700 leading-relaxed">
              {isPremium ? insight.summary : truncateText(insight.summary || "", 200)}
            </p>

            {!isPremium && insight.summary && insight.summary.length > 200 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-surface-500 bg-surface-50 rounded-lg p-3 border border-surface-200">
                <Lock className="h-4 w-4 shrink-0" />
                Contenu tronqué — Passez à Premium pour voir l&apos;intégralité
              </div>
            )}
          </Card>
        </motion.div>

        {/* Découvertes clés */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-success-50" aria-hidden="true">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
              <h2 className="text-base font-semibold text-surface-900 tracking-tight">
                Découvertes clés
              </h2>
            </div>

            {isPremium ? (
              <div className="text-surface-700 leading-relaxed whitespace-pre-line">
                {insight.key_findings || "Aucune découverte clé disponible."}
              </div>
            ) : (
              <div>
                <p className="text-surface-700 leading-relaxed">
                  {truncateText(insight.key_findings || "", 150)}
                </p>

                <div className="mt-6 p-6 bg-surface-50 rounded-xl border border-surface-200 text-center">
                  <div className="p-3 rounded-lg bg-surface-100 w-fit mx-auto mb-3" aria-hidden="true">
                    <Lock className="h-6 w-6 text-surface-500" />
                  </div>
                  <p className="font-semibold text-surface-900 mb-2">
                    Contenu réservé aux membres Premium
                  </p>
                  <p className="text-sm text-surface-500 mb-4">
                    Accédez à toutes les découvertes clés avec un abonnement Premium
                  </p>
                  <Link href="/premium">
                    <Button variant="primary" size="sm">
                      Devenir Premium
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Recommandations */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary-50" aria-hidden="true">
                <AlertCircle className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-base font-semibold text-surface-900 tracking-tight">
                Recommandations
              </h2>
            </div>

            {isPremium ? (
              <div className="text-surface-700 leading-relaxed whitespace-pre-line">
                {insight.recommendations || "Aucune recommandation disponible."}
              </div>
            ) : (
              <div>
                <p className="text-surface-700 leading-relaxed">
                  {truncateText(insight.recommendations || "", 100)}
                </p>

                <div className="mt-6 p-6 bg-surface-50 rounded-xl border border-surface-200 text-center">
                  <div className="p-3 rounded-lg bg-surface-100 w-fit mx-auto mb-3" aria-hidden="true">
                    <Lock className="h-6 w-6 text-surface-500" />
                  </div>
                  <p className="font-semibold text-surface-900 mb-2">
                    Recommandations complètes réservées aux Premium
                  </p>
                  <p className="text-sm text-surface-500 mb-4">
                    Obtenez toutes les recommandations stratégiques
                  </p>
                  <Link href="/premium">
                    <Button variant="primary" size="sm">
                      Devenir Premium
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* CTA Final pour Basic */}
        {!isPremium && (
          <motion.div variants={itemVariants}>
            <Card
              padding="lg"
              className="bg-surface-900 text-white border-none text-center"
            >
              <h3 className="font-heading text-xl lg:text-2xl font-bold mb-3 tracking-tight">
                Débloquez l&apos;accès complet
              </h3>
              <p className="text-surface-400 mb-6 max-w-md mx-auto">
                Passez à Premium pour accéder à tous les insights, résultats en temps réel et rapports détaillés.
              </p>
              <Link href="/premium">
                <Button
                  variant="secondary"
                  size="lg"
                  iconRight={<ArrowRight className="h-4 w-4" />}
                  className="bg-white text-surface-900 hover:bg-surface-100"
                >
                  Voir les offres Premium
                </Button>
              </Link>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
