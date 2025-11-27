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
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ShieldX,
  Download,
  Lightbulb,
} from "lucide-react";

interface Study {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  is_active: boolean;
}

interface UserData {
  id: number;
  email: string;
  full_name: string;
  plan: string;
  is_admin?: boolean;
}

const API_URL = "https://web-production-ef657.up.railway.app";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Vérifier si l'utilisateur est admin
      if (!parsedUser.is_admin) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      fetchStudies(token);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const fetchStudies = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/studies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStudies(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette étude ?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/studies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setStudies(studies.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Écran Accès Refusé
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-6">
            Cette page est réservée aux administrateurs. Vous n&apos;avez pas les permissions nécessaires pour y accéder.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Retour au dashboard
          </a>
        </div>
      </div>
    );
  }

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

          <div className="border-t border-gray-800 my-4"></div>
          <a
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white"
          >
            <Settings className="h-5 w-5" />
            Admin Études
          </a>
          <a
            href="/admin/insights"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <Lightbulb className="h-5 w-5" />
            Admin Insights
          </a>
          <a
            href="/admin/reports"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <Download className="h-5 w-5" />
            Admin Rapports
          </a>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestion des Études</h1>
            <p className="text-gray-600 mt-1">Ajoutez, modifiez ou supprimez des études</p>
          </div>
          <a
            href="/admin/ajouter"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center"
          >
            <Plus className="h-5 w-5" />
            Nouvelle Étude
          </a>
        </div>

        {/* Studies Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Titre</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Catégorie</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Statut</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Visible</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucune étude pour le moment. Créez votre première étude !
                  </td>
                </tr>
              ) : (
                studies.map((study) => (
                  <tr key={study.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{study.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{study.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-blue-600 font-medium">{study.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          study.status === "Ouvert"
                            ? "bg-green-100 text-green-700"
                            : study.status === "Fermé"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {study.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {study.is_active ? (
                        <Eye className="h-5 w-5 text-green-600" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/admin/modifier/${study.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(study.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Studies Cards - Mobile */}
        <div className="lg:hidden space-y-4">
          {studies.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Aucune étude pour le moment. Créez votre première étude !
            </div>
          ) : (
            studies.map((study) => (
              <div key={study.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{study.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{study.description}</p>
                  </div>
                  {study.is_active ? (
                    <Eye className="h-5 w-5 text-green-600 ml-2" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400 ml-2" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-600 font-medium">{study.category}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
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
                  <div className="flex gap-2">
                    <a
                      href={`/admin/modifier/${study.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Pencil className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(study.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
