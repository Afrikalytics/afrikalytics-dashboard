"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Clock,
  Calendar,
  Crown,
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
  embed_url_results: string;
}

interface UserData {
  id: number;
  email: string;
  full_name: string;
  plan: string;
  is_admin?: boolean;
}

export default function EtudeResultsPage() {
  const params = useParams();
  const router = useRouter();
  const studyId = params?.id;

  const [user, setUser] = useState<UserData | null>(null);
  const [etude, setEtude] = useState<Study | null>(null);
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
      if (studyId) {
        fetchEtude(token);
      }
    } catch {
      router.push("/login");
    }
  }, [studyId, router]);

  const fetchEtude = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/studies/${studyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEtude(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
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

  if (!etude) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-4">Étude non trouvée</p>
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
              Retour au dashboard
            </a>
          </div>
        </div>
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
        <div className="mb-6">
          <a
            href="/dashboard"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour au dashboard
          </a>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {etude.title}
                </h1>
                <Crown className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-gray-600 mb-4">{etude.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{etude.duration}</span>
                </div>
                {etude.deadline && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Jusqu&apos;au {etude.deadline}</span>
                  </div>
                )}
                <div className="text-blue-600 font-medium">{etude.category}</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Crown className="h-5 w-5" />
              <span className="font-medium">Premium</span>
            </div>
          </div>
        </div>

        {/* Results iframe */}
        {etude.embed_url_results ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <iframe
              src={etude.embed_url_results}
              className="w-full h-[800px] md:h-[1000px] border-0"
              title={`Résultats ${etude.title}`}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">
              Les résultats de cette étude ne sont pas encore disponibles.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
