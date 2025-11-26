"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  BarChart3,
  FileText,
  TrendingUp,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Lightbulb,
  Crown,
  Calendar,
  UserCircle,
  Download,
  Lock,
} from "lucide-react";

const API_URL = "https://web-production-ef657.up.railway.app";

interface Insight {
  id: number;
  study_id: number;
  title: string;
  summary: string;
  key_findings: string;
  recommendations: string;
  author: string;
  is_published: boolean;
  created_at: string;
}

interface Study {
  id: number;
  title: string;
  category: string;
}

interface Report {
  id: number;
  study_id: number;
  file_url: string;
  file_size: string;
  is_available: boolean;
}

interface UserData {
  id: number;
  email: string;
  full_name: string;
  plan: string;
  is_admin?: boolean;
}

export default function InsightDetailPage() {
  const router = useRouter();
  const params = useParams();
  const insightId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [study, setStudy] = useState<Study | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
      fetchData(token);
    } catch {
      router.push("/login");
    }
  }, [router, insightId]);

  const fetchData = async (token: string) => {
    try {
      // Fetch insight
      const insightRes = await fetch(`${API_URL}/api/insights/${insightId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (insightRes.ok) {
        const insightData = await insightRes.json();
        setInsight(insightData);

        // Fetch study
        const studyRes = await fetch(`${API_URL}/api/studies/${insightData.study_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (studyRes.ok) {
          const studyData = await studyRes.json();
          setStudy(studyData);
        }

        // Fetch report
        try {
          const reportRes = await fetch(`${API_URL}/api/reports/study/${insightData.study_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (reportRes.ok) {
            const reportData = await reportRes.json();
            setReport(reportData);
          }
        } catch {
          // Pas de rapport
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!report) return;

    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/api/reports/${report.id}/download`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      window.open(report.file_url, "_blank");
    } catch (error) {
      console.error("Erreur:", error);
      window.open(report.file_url, "_blank");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Insight non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed h-full bg-gray-900 text-white z-40 transition-transform duration-300
          w-64
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <span className="font-bold text-lg">Afrikalytics</span>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <BarChart3 className="h-5 w-5" />
            Dashboard
          </a>
          <a
            href="/dashboard/etudes"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <FileText className="h-5 w-5" />
            Études
          </a>
          <a
            href="/dashboard/insights"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white"
          >
            <TrendingUp className="h-5 w-5" />
            Insights
          </a>
          <a
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <User className="h-5 w-5" />
            Profil
          </a>

          {user?.is_admin && (
            <>
              <div className="border-t border-gray-800 my-4"></div>
              <a
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
              >
                <Settings className="h-5 w-5" />
                Admin
              </a>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-700 p-2 rounded-full">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.full_name}</p>
              <p className="text-gray-400 text-sm truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition w-full px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        {/* Back Button */}
        <a
          href="/dashboard/etudes"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour aux études
        </a>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-6 lg:p-8 mb-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <span className="text-purple-200 text-sm font-medium">INSIGHT</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">{insight.title}</h1>
              {study && (
                <p className="text-purple-200">
                  Étude : <span className="text-white font-medium">{study.title}</span>
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-purple-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(insight.created_at)}</span>
                </div>
                {insight.author && (
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    <span>{insight.author}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg">
              <Crown className="h-5 w-5" />
              <span className="font-semibold">Premium</span>
            </div>
          </div>
        </div>

        {/* Download Report Button */}
        <div className="mb-6">
          {report ? (
            <button
              onClick={handleDownloadReport}
              className="flex items-center justify-between w-full md:w-auto px-6 py-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition border border-green-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Télécharger le rapport complet</p>
                  <p className="text-sm text-green-500">PDF • {report.file_size}</p>
                </div>
              </div>
              <Download className="h-5 w-5 ml-4" />
            </button>
          ) : (
            <div className="flex items-center justify-between w-full md:w-auto px-6 py-4 bg-gray-100 text-gray-400 rounded-xl border border-gray-200 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Lock className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Rapport bientôt disponible</p>
                  <p className="text-sm">En cours de préparation</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
              Résumé Exécutif
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{insight.summary}</p>
          </div>

          {/* Key Findings */}
          {insight.key_findings && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                Découvertes Clés
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{insight.key_findings}</p>
            </div>
          )}

          {/* Recommendations */}
          {insight.recommendations && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                Recommandations
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{insight.recommendations}</p>
            </div>
          )}
        </div>

        {/* View Results CTA */}
        {study && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Voir les résultats détaillés</h3>
                <p className="text-sm text-gray-600">Consultez les graphiques et données de l&apos;étude</p>
              </div>
              <a
                href={`/dashboard/etudes/${study.id}`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <BarChart3 className="h-5 w-5" />
                Voir les résultats
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
