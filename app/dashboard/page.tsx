"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  LogOut,
  User,
  Crown,
  ChevronRight,
  Clock,
  Download,
} from "lucide-react";

interface UserData {
  id: number;
  email: string;
  full_name: string;
  plan: string;
  is_active: boolean;
}

const studies = [
  {
    id: 1,
    title: "Salary Survey 2024 - Secteur Tech",
    description: "Analyse complète des rémunérations dans la tech en Afrique francophone",
    category: "RH & Talents",
    status: "Disponible",
    participants: "1,247",
    date: "Janvier 2024",
  },
  {
    id: 2,
    title: "AI Readiness Index Afrique 2024",
    description: "État de la maturité IA des entreprises africaines",
    category: "Digital & IA",
    status: "Disponible",
    participants: "2,847",
    date: "Février 2024",
  },
  {
    id: 3,
    title: "Tendances RH Post-COVID",
    description: "Impact durable sur le marché du travail africain",
    category: "RH & Talents",
    status: "En cours",
    participants: "892",
    date: "Mars 2024",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch {
      router.push("/login");
    }

    setLoading(false);
  }, [router]);

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
      starter: { bg: "bg-gray-100", text: "text-gray-700", label: "Starter" },
      professional: { bg: "bg-blue-100", text: "text-blue-700", label: "Professional" },
      enterprise: { bg: "bg-purple-100", text: "text-purple-700", label: "Enterprise" },
    };
    return badges[plan] || badges.starter;
  };

  const planBadge = getPlanBadge(user?.plan || "starter");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <span className="font-bold text-lg">Afrikalytics</span>
          </div>
        </div>

        {/* Navigation */}
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
        </nav>

        {/* User Info */}
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
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-green-500 text-sm font-medium">+2 ce mois</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-gray-600 text-sm">Études accessibles</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">48</p>
            <p className="text-gray-600 text-sm">Insights générés</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">7</p>
            <p className="text-gray-600 text-sm">Rapports téléchargés</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="text-gray-600 text-sm">Études en cours</p>
          </div>
        </div>

        {/* Recent Studies */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Dernières Études</h2>
              <a href="/dashboard/etudes" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                Voir tout <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {studies.map((study) => (
              <div
                key={study.id}
                className="p-6 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{study.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          study.status === "Disponible"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {study.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{study.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {study.participants} participants
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {study.date}
                      </span>
                      <span className="text-blue-600 font-medium">{study.category}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
