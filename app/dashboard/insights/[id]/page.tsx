"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Lightbulb,
  User as UserIcon,
  Calendar,
  Lock,
  Crown,
  CheckCircle,
  AlertCircle,
  Download,
  BarChart3
} from "lucide-react";
import { API_URL } from "@/lib/constants";
import type { User } from "@/lib/types";

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

export default function InsightDetailPage() {
  const params = useParams();
  const [insight, setInsight] = useState<InsightDetail | null>(null);
  const [study, setStudy] = useState<StudyDetail | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

    // Récupérer l'insight via proxy
    const fetchInsight = async () => {
      try {
        const response = await fetch(`/api/proxy/api/insights/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setInsight(data);

          // Récupérer l'étude associée
          const studyResponse = await fetch(`/api/proxy/api/studies/${data.study_id}`);
          if (studyResponse.ok) {
            const studyData = await studyResponse.json();
            setStudy(studyData);
          }
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [params.id]);

  const isPremium = user?.plan === "professionnel" || user?.plan === "entreprise";

  // Fonction pour tronquer le texte
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Insight non trouvé</h1>
          <Link href="/dashboard/insights" className="text-blue-600 hover:text-blue-700">
            ← Retour aux insights
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="main-content" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/dashboard/insights" 
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux insights
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-purple-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{insight.title}</h1>
              </div>
              
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                {insight.author && (
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    {insight.author}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(insight.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Voir résultats */}
          {study && (
            <Link
              href={`/dashboard/etudes/${study.id}`}
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition"
            >
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Voir les résultats</p>
                <p className="text-sm text-gray-500">{study.title}</p>
              </div>
            </Link>
          )}

          {/* Télécharger rapport */}
          {getReportUrl() ? (
            <a
              href={getReportUrl()!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition"
            >
              <div className="bg-green-100 p-3 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Télécharger le rapport</p>
                <p className="text-sm text-gray-500">
                  {isPremium ? "Version complète" : "Version Basic"}
                </p>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Download className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-400">Rapport bientôt disponible</p>
                <p className="text-sm text-gray-400">En préparation</p>
              </div>
            </div>
          )}
        </div>

        {/* Résumé - Toujours visible */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            Résumé exécutif
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {isPremium ? insight.summary : truncateText(insight.summary || "", 200)}
          </p>
          
          {!isPremium && insight.summary && insight.summary.length > 200 && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Contenu tronqué - Passez à Premium pour voir l&apos;intégralité
              </p>
            </div>
          )}
        </div>

        {/* Découvertes clés */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Découvertes clés
          </h2>
          
          {isPremium ? (
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {insight.key_findings || "Aucune découverte clé disponible."}
            </div>
          ) : (
            <div className="relative">
              <p className="text-gray-700 leading-relaxed">
                {truncateText(insight.key_findings || "", 150)}
              </p>
              
              {/* Overlay Premium */}
              <div className="mt-6 p-6 bg-gradient-to-t from-yellow-50 to-transparent rounded-lg border border-yellow-200 text-center">
                <Lock className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 mb-2">
                  Contenu réservé aux membres Premium
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Accédez à toutes les découvertes clés avec un abonnement Premium
                </p>
                <Link
                  href="/premium"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  <Crown className="h-4 w-4" />
                  Devenir Premium
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recommandations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Recommandations
          </h2>
          
          {isPremium ? (
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {insight.recommendations || "Aucune recommandation disponible."}
            </div>
          ) : (
            <div className="relative">
              <p className="text-gray-700 leading-relaxed">
                {truncateText(insight.recommendations || "", 100)}
              </p>
              
              {/* Overlay Premium */}
              <div className="mt-6 p-6 bg-gradient-to-t from-yellow-50 to-transparent rounded-lg border border-yellow-200 text-center">
                <Lock className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 mb-2">
                  Recommandations complètes réservées aux Premium
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Obtenez toutes les recommandations stratégiques
                </p>
                <Link
                  href="/premium"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  <Crown className="h-4 w-4" />
                  Devenir Premium
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* CTA Final pour Basic */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
            <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-2xl font-bold mb-3">
              Débloquez l&apos;accès complet
            </h3>
            <p className="text-blue-100 mb-6 max-w-md mx-auto">
              Passez à Premium pour accéder à tous les insights, résultats en temps réel et rapports détaillés.
            </p>
            <Link
              href="/premium"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Voir les offres Premium
              <ArrowLeft className="h-5 w-5 rotate-180" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
