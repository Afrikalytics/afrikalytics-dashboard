"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  FileText,
  TrendingUp,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  Crown,
  ChevronRight,
  ChevronDown,
  Clock,
  Download,
  Users,
  Lightbulb,
  CheckCircle,
} from "lucide-react";

interface UserData {
  id: number;
  email: string;
  full_name: string;
  plan: string;
  is_active: boolean;
  is_admin?: boolean;
}

interface DashboardStats {
  studies_accessible: number;
  studies_total: number;
  studies_open: number;
  reports_available: number;
  insights_available: number;
  subscription_days_remaining: number | null;
  plan: string;
  is_premium: boolean;
}

const API_URL = "https://web-production-ef657.up.railway.app";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [studies, setStudies] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
      fetchStudies(token);
      fetchStats(token);
    } catch {
      router.push("/login");
    }

    setLoading(false);
  }, [router]);

  const fetchStudies = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/studies/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStudies(data.slice(0, 3)); // 3 dernières études
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erreur stats:", error);
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

  const getPlanBadge = (plan: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      basic: { bg: "bg-gray-100", text: "text-gray-700", label: "Basic" },
      professionnel: { bg: "bg-blue-100", text: "text-blue-700", label: "Professionnel" },
      entreprise: { bg: "bg-purple-100", text: "text-purple-700", label: "Entreprise" },
    };
    return badges[plan] || badges.basic;
  };

  const planBadge = getPlanBadge(user?.plan || "basic");
  const isPremium = user?.plan === "professionnel" || user?.plan === "entreprise";

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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white"
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

          {/* Admin Menu avec sous-menu déroulant */}
          {user?.is_admin && (
            <>
              <div className="border-t border-gray-800 my-4"></div>
              
              {/* Bouton Admin */}
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span>Administration</span>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    adminMenuOpen ? "rotate-180" : ""
                  }`} 
                />
              </button>

              {/* Sous-menu Admin */}
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  adminMenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-4 space-y-1 mt-1">
                  <a
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    Études
                  </a>
                  <a
                    href="/admin/insights"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Insights
                  </a>
                  <a
                    href="/admin/reports"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Rapports
                  </a>
                  <a
                    href="/admin/users"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm"
                  >
                    <Users className="h-4 w-4" />
                    Utilisateurs
                  </a>
                </div>
              </div>
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
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Bienvenue, {user?.full_name?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Voici un aperçu de vos études et insights
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${planBadge.bg}`}>
            <Crown className={`h-4 w-4 ${planBadge.text}`} />
            <span className={`font-medium ${planBadge.text}`}>{planBadge.label}</span>
          </div>
        </div>

        {/* Upgrade Banner for Basic users */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 lg:p-6 mb-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-300" />
                  Passez à Premium
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  Accédez aux résultats en temps réel, insights complets et rapports détaillés
                </p>
              </div>
              <a
                href="https://afrikalytics.com/premium"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition text-sm whitespace-nowrap"
              >
                Voir les offres
              </a>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-2 lg:p-3 rounded-lg">
                <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats?.studies_accessible || 0}</p>
            <p className="text-gray-600 text-xs lg:text-sm">Études accessibles</p>
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-2 lg:p-3 rounded-lg">
                <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats?.studies_open || 0}</p>
            <p className="text-gray-600 text-xs lg:text-sm">Études ouvertes</p>
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-2 lg:p-3 rounded-lg">
                <Lightbulb className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats?.insights_available || 0}</p>
            <p className="text-gray-600 text-xs lg:text-sm">Insights disponibles</p>
          </div>

          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-2 lg:p-3 rounded-lg">
                <Download className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats?.reports_available || 0}</p>
            <p className="text-gray-600 text-xs lg:text-sm">Rapports disponibles</p>
          </div>
        </div>

        {/* Recent Studies */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 lg:p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">Dernières Études</h2>
              <a href="/dashboard/etudes" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                Voir tout <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {studies.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Aucune étude disponible pour le moment.
              </div>
            ) : (
              studies.map((study) => (
                <a
                  key={study.id}
                  href={`/dashboard/etudes/${study.id}`}
                  className="block p-4 lg:p-6 hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{study.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            study.status === "Ouvert"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {study.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{study.description}</p>
                      <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {study.duration || "15-20 min"}
                        </span>
                        <span className="text-blue-600 font-medium">{study.category}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 hidden sm:block" />
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
