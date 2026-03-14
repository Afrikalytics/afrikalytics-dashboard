"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Calendar,
  Lock,
  Crown,
  Download,
  FileText,
  Lightbulb
} from "lucide-react";
import type { User, Insight } from "@/lib/types";

const ALLOWED_EMBED_ORIGINS = [
  'https://lookerstudio.google.com',
  'https://app.powerbi.com',
  'https://public.tableau.com',
  'https://datastudio.google.com',
];

function isValidEmbedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_EMBED_ORIGINS.some(origin => parsed.origin === origin);
  } catch {
    return false;
  }
}

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

export default function StudyResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [study, setStudy] = useState<StudyDetail | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Récupérer l'utilisateur depuis la session httpOnly
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        if (session.authenticated && session.user) {
          setUser(session.user);
        }
      } catch {}
    };
    fetchUser();

    // Récupérer l'étude via proxy
    const fetchStudy = async () => {
      try {
        const response = await fetch(`/api/proxy/api/studies/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setStudy(data);
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    // Récupérer l'insight via proxy
    const fetchInsight = async () => {
      try {
        const response = await fetch(`/api/proxy/api/insights/study/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setInsight(data);
        }
      } catch (error) {
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
      // Tracker le téléchargement via proxy
      await fetch(`/api/proxy/api/reports/study/${study.id}/type/${getReportType()}/download`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Erreur tracking:", error);
    }

    // Ouvrir le PDF
    window.open(reportUrl, "_blank");
    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Étude non trouvée</h1>
          <Link href="/dashboard/etudes" className="text-blue-600 hover:text-blue-700">
            ← Retour aux études
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="main-content" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/dashboard/etudes" 
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux études
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">{study.title}</h1>
              </div>
              <p className="text-gray-600 max-w-2xl">{study.description}</p>
              
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {study.duration}
                </span>
                {study.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {study.deadline}
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  study.status === "Ouvert" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {study.status}
                </span>
              </div>
            </div>

            {/* Badge Plan */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPremium 
                ? "bg-yellow-100 text-yellow-800" 
                : "bg-gray-100 text-gray-600"
            }`}>
              {isPremium ? "👑 Premium" : "Basic"}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Actions Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Insight Button */}
          {insight ? (
            <Link
              href={`/dashboard/insights/${insight.id}`}
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="bg-purple-100 p-3 rounded-lg">
                <Lightbulb className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Lire l&apos;insight</p>
                <p className="text-sm text-gray-500">Analyse et recommandations</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Lightbulb className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-400">Insight bientôt disponible</p>
                <p className="text-sm text-gray-400">En cours de rédaction</p>
              </div>
            </div>
          )}

          {/* Report Button */}
          {getReportUrl() ? (
            <button
              onClick={handleDownloadReport}
              disabled={downloading}
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition text-left"
            >
              <div className="bg-green-100 p-3 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {downloading ? "Ouverture..." : `Télécharger le rapport ${isPremium ? "complet" : ""}`}
                </p>
                <p className="text-sm text-gray-500">
                  {isPremium ? "Version Premium" : "Version Basic"}
                </p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="bg-gray-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-400">Rapport bientôt disponible</p>
                <p className="text-sm text-gray-400">En cours de préparation</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Résultats de l&apos;étude
            </h2>
          </div>

          {isPremium ? (
            /* Premium: Show iframe */
            <div className="p-6">
              {study.embed_url_results ? (
                isValidEmbedUrl(study.embed_url_results) ? (
                  <iframe
                    src={study.embed_url_results}
                    sandbox="allow-scripts allow-popups"
                    className="w-full h-[800px] border-0 rounded-lg"
                    title="Résultats de l'étude"
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-red-400" />
                    </div>
                    <p className="text-red-600 font-medium">URL d&apos;intégration non autorisée</p>
                    <p className="text-gray-500 text-sm mt-1">L&apos;origine de cette URL n&apos;est pas dans la liste des sources approuvées.</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Résultats en cours de préparation</p>
                </div>
              )}
            </div>
          ) : (
            /* Basic: Show upgrade message */
            <div className="p-12 text-center">
              <div className="bg-yellow-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Lock className="h-10 w-10 text-yellow-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Contenu réservé aux membres Premium
              </h3>
              
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Les résultats en temps réel sont disponibles pour les abonnés Professionnel et Entreprise. Passez à Premium pour débloquer l&apos;accès complet.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/premium"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  <Crown className="h-5 w-5" />
                  Devenir Premium
                </Link>
                
                <Link
                  href="/dashboard/etudes"
                  className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Voir d&apos;autres études
                </Link>
              </div>

              {/* What's included */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-4">
                  Avec Premium, vous obtenez :
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    ✅ Résultats en temps réel
                  </span>
                  <span className="flex items-center gap-1">
                    ✅ Insights complets
                  </span>
                  <span className="flex items-center gap-1">
                    ✅ Rapports détaillés
                  </span>
                  <span className="flex items-center gap-1">
                    ✅ Dashboard avancé
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
