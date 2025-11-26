"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  FileText,
  TrendingUp,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  Calendar,
  ChevronRight,
  Filter,
  Search,
  Lightbulb,
  Download,
  Lock,
} from "lucide-react";

const API_URL = "https://web-production-ef657.up.railway.app";

interface Study {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  deadline: string;
  status: string;
  icon: string;
  is_active: boolean;
}

interface Insight {
  id: number;
  study_id: number;
  title: string;
  is_published: boolean;
}

interface Report {
  id: number;
  study_id: number;
  title: string;
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

export default function EtudesListPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");

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
  }, [router]);

  useEffect(() => {
    filterStudies();
  }, [studies, searchTerm, filterStatus]);

  const fetchData = async (token: string) => {
    try {
      // Fetch studies
      const studiesRes = await fetch(`${API_URL}/api/studies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (studiesRes.ok) {
        const data = await studiesRes.json();
        setStudies(data);
      }

      // Fetch insights
      const insightsRes = await fetch(`${API_URL}/api/insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data);
      }

      // Fetch reports
      const reportsRes = await fetch(`${API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudies = () => {
    let filtered = studies;

    if (searchTerm) {
      filtered = filtered.filter(
        (study) =>
          study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          study.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          study.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "Tous") {
      filtered = filtered.filter((study) => study.status === filterStatus);
    }

    setFilteredStudies(filtered);
  };

  const getInsightForStudy = (studyId: number) => {
    return insights.find((i) => i.study_id === studyId && i.is_published);
  };

  const getReportForStudy = (studyId: number) => {
    return reports.find((r) => r.study_id === studyId && r.is_available);
  };

  const handleDownloadReport = async (report: Report) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white"
          >
            <FileText className="h-5 w-5" />
            Études
          </a>
          <a
            href="/dashboard/insights"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Toutes les Études</h1>
          <p className="text-gray-600">Consultez les résultats de nos études de marché</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une étude..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="Ouvert">Ouvert</option>
                <option value="Fermé">Fermé</option>
                <option value="Bientôt">Bientôt</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-500">
            {filteredStudies.length} étude{filteredStudies.length !== 1 ? "s" : ""} trouvée
            {filteredStudies.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Studies Grid */}
        {filteredStudies.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">Aucune étude trouvée.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStudies.map((study) => {
              const insight = getInsightForStudy(study.id);
              const report = getReportForStudy(study.id);

              return (
                <div
                  key={study.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{study.title}</h3>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ml-3 ${
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

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{study.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{study.duration}</span>
                    </div>
                    {study.deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Jusqu&apos;au {study.deadline}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-blue-600 font-medium text-sm mb-4">{study.category}</div>

                  {/* Boutons */}
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {/* Bouton Résultats - Toujours visible */}
                    <a
                      href={`/dashboard/etudes/${study.id}`}
                      className="flex items-center justify-between w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        <span className="font-medium">
                          {study.status === "Ouvert" ? "Voir les résultats en temps réel" : "Voir les résultats finaux"}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5" />
                    </a>

                    {/* Bouton Insight */}
                    {insight ? (
                      <a
                        href={`/dashboard/insights/${insight.id}`}
                        className="flex items-center justify-between w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          <span className="font-medium">Lire l&apos;insight</span>
                        </div>
                        <ChevronRight className="h-5 w-5" />
                      </a>
                    ) : (
                      <div className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed">
                        <div className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          <span className="font-medium">Insight bientôt disponible</span>
                        </div>
                      </div>
                    )}

                    {/* Bouton Rapport */}
                    {report ? (
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="flex items-center justify-between w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                      >
                        <div className="flex items-center gap-2">
                          <Download className="h-5 w-5" />
                          <span className="font-medium">Télécharger le rapport ({report.file_size})</span>
                        </div>
                        <Download className="h-5 w-5" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed">
                        <div className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          <span className="font-medium">Rapport bientôt disponible</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
