"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Loader2,
  X,
  User,
  Mail,
  Lock,
  Crown,
} from "lucide-react";

const API_URL = "https://web-production-ef657.up.railway.app";

interface UserData {
  id: number;
  email: string;
  full_name: string;
  plan: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    plan: "basic",
    is_active: true,
    is_admin: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.status === 403) {
        router.push("/dashboard");
        return;
      }

      if (!response.ok) throw new Error("Erreur chargement");

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setActionLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur création");
      }

      setUsers([data, ...users]);
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setError("");

    try {
      const updateData: any = {
        email: formData.email,
        full_name: formData.full_name,
        plan: formData.plan,
        is_active: formData.is_active,
        is_admin: formData.is_admin,
      };

      if (formData.password) {
        updateData.new_password = formData.password;
      }

      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur modification");
      }

      setUsers(users.map((u) => (u.id === selectedUser.id ? data : u)));
      setShowEditModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Erreur suppression");
      }

      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (user: UserData) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${user.id}/toggle-active`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Erreur");
      }

      setUsers(users.map((u) => (u.id === user.id ? { ...u, is_active: data.is_active } : u)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      full_name: "",
      password: "",
      plan: "basic",
      is_active: true,
      is_admin: false,
    });
    setSelectedUser(null);
    setError("");
  };

  const openEditModal = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      password: "",
      plan: user.plan,
      is_active: user.is_active,
      is_admin: user.is_admin,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: UserData) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || user.plan === filterPlan;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "inactive" && !user.is_active);

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "entreprise":
        return "bg-purple-100 text-purple-800";
      case "professionnel":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                <p className="text-gray-600">{users.length} utilisateurs</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les plans</option>
              <option value="basic">Basic</option>
              <option value="professionnel">Professionnel</option>
              <option value="entreprise">Entreprise</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Inscription
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanBadge(
                          user.plan
                        )}`}
                      >
                        {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? (
                          <>
                            <ToggleRight className="h-4 w-4" />
                            Actif
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4" />
                            Inactif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_admin ? (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Crown className="h-4 w-4" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-gray-500">Utilisateur</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajouter */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Ajouter un utilisateur</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimum 8 caractères"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan
                </label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="professionnel">Professionnel</option>
                  <option value="entreprise">Entreprise</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Actif</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_admin}
                    onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Administrateur</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddUser}
                disabled={actionLoading || !formData.email || !formData.full_name || !formData.password}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Modifier l&apos;utilisateur</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe (laisser vide pour ne pas changer)
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 8 caractères"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan
                </label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="professionnel">Professionnel</option>
                  <option value="entreprise">Entreprise</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Actif</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_admin}
                    onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Administrateur</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleEditUser}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Supprimer l&apos;utilisateur ?</h2>
              <p className="text-gray-600 mb-2">
                Êtes-vous sûr de vouloir supprimer <strong>{selectedUser.full_name}</strong> ?
              </p>
              <p className="text-sm text-red-600 mb-6">
                Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
