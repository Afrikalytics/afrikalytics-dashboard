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
  Mail,
  Calendar,
  Shield,
} from "lucide-react";

interface UserData {
  id: number;
  email: string;
  full_name: string;
  plan: string;
  is_active: boolean;
  is_admin?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
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

  const getPlanDetails = (plan: string) => {
    const plans: Record<string, { label: string; price: string }> = {
      starter: { label: "Starter", price: "49,000 CFA/mois" },
      professional: { label: "Professional", price: "98,000 CFA/mois" },
      enterprise: { label: "Enterprise", price: "195,000 CFA/mois" },
    };
    return plans[plan] || plans.starter;
  };

  const planDetails = getPlanDetails(user?.plan || "starter");

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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white"
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
        <div className="max-w-3xl">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 mb-8">
              <div className="bg-blue-100 p-4 lg:p-6 rounded-full">
                <User className="h-8 w-8 lg:h-12 lg:w-12 text-blue-600" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{user?.full_name}</h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 text-sm lg:text-base break-all">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Shield className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <p className="font-medium text-green-600">
                    {user?.is_active ? "Actif" : "Inactif"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Membre depuis</p>
                  <p className="font-medium text-gray-900">Novembre 2024</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">ID Utilisateur</p>
                  <p className="font-medium text-gray-900">#{user?.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">Mon Abonnement</h3>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                <Crown className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-600">{planDetails.label}</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 lg:p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-blue-200">Plan actuel</p>
                  <p className="text-xl lg:text-2xl font-bold">{planDetails.label}</p>
                </div>
                <Crown className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-400" />
              </div>
              <p className="text-blue-100 mb-4">{planDetails.price}</p>
              <a
                href="https://afrikalytics.com/premium"
                className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition text-sm lg:text-base"
              >
                Changer de plan
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
