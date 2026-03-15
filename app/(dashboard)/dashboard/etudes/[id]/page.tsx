"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Clock,
  Calendar,
  Lock,
  Download,
  FileText,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { api } from "@/lib/api";
import type { Insight } from "@/lib/types";
import { ROUTES } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const ALLOWED_EMBED_ORIGINS = [
  "https://lookerstudio.google.com",
  "https://app.powerbi.com",
  "https://public.tableau.com",
  "https://datastudio.google.com",
];

function isValidEmbedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_EMBED_ORIGINS.some((origin) => parsed.origin === origin);
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface StudyDetail {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  deadline: string;
  status: string;
  embed_url_results: string;
  report_url_basic: string;
  report_url_premium: string;
}

// -----------------------------------------------------------------------------
// Animation variants
// -----------------------------------------------------------------------------

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

export default function StudyResultsPage() {
  const params = useParams();
  const { user } = useAuth();
  const [study, setStudy] = useState<StudyDetail | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        const data = await api.get<StudyDetail>(`/api/studies/${params.id}`);
        setStudy(data);
      } catch (error) {
        // Erreur silencieuse — état loading/empty gère l'affichage
      }
    };

    const fetchInsight = async () => {
      try {
        const data = await api.get<Insight>(`/api/insights/study/${params.id}`);
        setInsight(data);
      } catch {
        // Pas d'insight pour cette étude
      }
    };

    Promise.all([fetchStudy(), fetchInsight()]).finally(() => {
      setLoading(false);
    });
  }, [params.id]);

  const isPremium = user?.plan === "professionnel" || user?.plan === "entreprise";

  const getReportUrl = () => {
    if (!study) return null;
    if (isPremium && study.report_url_premium) {
      return study.report_url_premium;
    }
    return study.report_url_basic;
  };

  const getReportType = () => {
    if (isPremium && study?.report_url_premium) {
      return "premium";
    }
    return "basic";
  };

  const handleDownloadReport = async () => {
    if (!study) return;
    const reportUrl = getReportUrl();
    if (!reportUrl) return;

    setDownloading(true);

    try {
      await api.post(`/api/reports/study/${study.id}/type/${getReportType()}/download`);
    } catch (error) {
      // Erreur tracking silencieuse — le téléchargement continue
    }

    window.open(reportUrl, "_blank");
    setDownloading(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-surface-400" />
      </div>
    );
  }

  // Not found
  if (!study) {
    return (
      <div className="page-container">
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="Étude non trouvée"
          description="Cette étude n'existe pas ou a été supprimée."
          action={
            <Link href={ROUTES.ETUDES}>
              <Button variant="secondary">Retour aux études</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      {/* ── Breadcrumb ── */}
      <Breadcrumb
        items={[
          { label: "Études", href: ROUTES.ETUDES },
          { label: study.title },
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
            {study.title}
          </h1>
          <p className="text-surface-500 mt-2 leading-relaxed max-w-2xl">
            {study.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Badge
              variant={study.status === "Ouvert" ? "success" : "danger"}
              size="md"
              dot
            >
              {study.status}
            </Badge>
            <span className="flex items-center gap-1.5 text-sm text-surface-400">
              <Clock className="h-4 w-4" />
              {study.duration}
            </span>
            {study.deadline && (
              <span className="flex items-center gap-1.5 text-sm text-surface-400">
                <Calendar className="h-4 w-4" />
                {study.deadline}
              </span>
            )}
          </div>
        </div>

        <Badge
          variant={isPremium ? "primary" : "default"}
          size="md"
        >
          {isPremium ? "Premium" : "Basic"}
        </Badge>
      </motion.div>

      {/* ── Action Cards ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Insight */}
        <motion.div variants={fadeInUp}>
          {insight ? (
            <Link
              href={`/dashboard/insights/${insight.id}`}
              className="group block"
            >
              <Card variant="bordered" className="hover:border-surface-300 hover:shadow-soft transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent-50 shrink-0" aria-hidden="true">
                    <Lightbulb className="h-5 w-5 text-accent-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">
                      Lire l&apos;insight
                    </p>
                    <p className="text-sm text-surface-500">Analyse et recommandations</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-surface-300 group-hover:text-primary-500 transition-colors" />
                </div>
              </Card>
            </Link>
          ) : (
            <Card variant="bordered" className="opacity-60">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-surface-100 shrink-0" aria-hidden="true">
                  <Lightbulb className="h-5 w-5 text-surface-400" />
                </div>
                <div>
                  <p className="font-semibold text-surface-400">Insight bientôt disponible</p>
                  <p className="text-sm text-surface-400">En cours de rédaction</p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Report */}
        <motion.div variants={fadeInUp}>
          {getReportUrl() ? (
            <button onClick={handleDownloadReport} disabled={downloading} className="w-full text-left">
              <Card variant="bordered" className="hover:border-surface-300 hover:shadow-soft transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-success-50 shrink-0" aria-hidden="true">
                    <Download className="h-5 w-5 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-surface-900">
                      {downloading ? "Ouverture..." : `Télécharger le rapport ${isPremium ? "complet" : ""}`}
                    </p>
                    <p className="text-sm text-surface-500">
                      {isPremium ? "Version Premium" : "Version Basic"}
                    </p>
                  </div>
                  <Download className="h-4 w-4 text-surface-300" />
                </div>
              </Card>
            </button>
          ) : (
            <Card variant="bordered" className="opacity-60">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-surface-100 shrink-0" aria-hidden="true">
                  <FileText className="h-5 w-5 text-surface-400" />
                </div>
                <div>
                  <p className="font-semibold text-surface-400">Rapport bientôt disponible</p>
                  <p className="text-sm text-surface-400">En cours de préparation</p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* ── Results Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 lg:px-6 py-4 border-b border-surface-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-surface-100" aria-hidden="true">
                <BarChart3 className="h-5 w-5 text-surface-600" />
              </div>
              <h2 className="text-base font-semibold text-surface-900 tracking-tight">
                Résultats de l&apos;étude
              </h2>
            </div>
          </div>

          {isPremium ? (
            <div className="p-5 lg:p-6">
              {study.embed_url_results ? (
                isValidEmbedUrl(study.embed_url_results) ? (
                  <iframe
                    src={study.embed_url_results}
                    sandbox="allow-scripts allow-same-origin"
                    referrerPolicy="no-referrer"
                    className="w-full h-[800px] border-0 rounded-lg"
                    title="Résultats de l'étude"
                  />
                ) : (
                  <EmptyState
                    icon={<BarChart3 className="h-8 w-8" />}
                    title="URL d'intégration non autorisée"
                    description="L'origine de cette URL n'est pas dans la liste des sources approuvées."
                  />
                )
              ) : (
                <EmptyState
                  icon={<BarChart3 className="h-8 w-8" />}
                  title="Résultats en préparation"
                  description="Les résultats seront bientôt disponibles."
                />
              )}
            </div>
          ) : (
            <div className="p-8 lg:p-12 text-center">
              <div className="p-4 rounded-xl bg-surface-100 w-fit mx-auto mb-6" aria-hidden="true">
                <Lock className="h-8 w-8 text-surface-500" />
              </div>

              <h3 className="font-heading text-xl lg:text-2xl font-bold text-surface-900 mb-3 tracking-tight">
                Contenu réservé aux membres Premium
              </h3>

              <p className="text-surface-500 max-w-md mx-auto mb-8 leading-relaxed">
                Les résultats en temps réel sont disponibles pour les abonnés Professionnel et Entreprise.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/premium">
                  <Button variant="primary" size="lg">
                    Devenir Premium
                  </Button>
                </Link>
                <Link href={ROUTES.ETUDES}>
                  <Button variant="secondary" size="lg">
                    Voir d&apos;autres études
                  </Button>
                </Link>
              </div>

              <div className="mt-10 pt-8 border-t border-surface-100">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4">
                  Avec Premium, vous obtenez
                </p>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-surface-600">
                  {[
                    "Résultats en temps réel",
                    "Insights complets",
                    "Rapports détaillés",
                    "Dashboard avancé",
                  ].map((item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-success-500" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
