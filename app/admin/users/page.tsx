"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Shield,
  UserCheck,
  UserX,
  ArrowLeft,
  Eye,
  EyeOff,
  FileText,
  Lightbulb,
  Download,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_ROLES } from "@/lib/constants";
import { api, ApiRequestError } from "@/lib/api";
import type { User } from "@/lib/types";

// Icon mapping for admin roles (not in shared constants since Lucide components are UI-specific)
const ROLE_ICONS: Record<string, LucideIcon> = {
  super_admin: Crown,
  admin_content: FileText,
  admin_studies: FileText,
  admin_insights: Lightbulb,
  admin_reports: Download,
};

// Skeleton component for loading states (Issue #18)
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className || ''}`} />
);

function DeleteUserModal({ userName, onClose, onConfirm }: { userName: string; onClose: () => void; onConfirm: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);

    // Focus first button in modal
    const firstFocusable = modalRef.current?.querySelector('button') as HTMLElement;
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  const handleTabTrap = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusableEls = modalRef.current?.querySelectorAll('button') as NodeListOf<HTMLElement>;
    if (!focusableEls || focusableEls.length === 0) return;
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-modal-title"
        className="bg-white rounded-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleTabTrap}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" aria-hidden="true" />
          </div>
          <h2 id="delete-user-modal-title" className="text-xl font-bold mb-2">Supprimer l&apos;utilisateur ?</h2>
          <p className="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer <strong>{userName}</strong> ?
            Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterAdmin, setFilterAdmin] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    plan: "basic",
    is_active: true,
    is_admin: false,
    admin_role: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller);
    return () => controller.abort();
  }, []);

  // Memoized filtered users (Issue #19) — replaces useEffect + setFilteredUsers
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(term) ||
          user.full_name.toLowerCase().includes(term)
      );
    }

    // Filtre plan
    if (filterPlan !== "all") {
      filtered = filtered.filter((user) => user.plan === filterPlan);
    }

    // Filtre admin
    if (filterAdmin === "admin") {
      filtered = filtered.filter((user) => user.is_admin);
    } else if (filterAdmin === "user") {
      filtered = filtered.filter((user) => !user.is_admin);
    }

    return filtered;
  }, [users, searchTerm, filterPlan, filterAdmin]);

  const fetchUsers = async (controller?: AbortController) => {
    try {
      const data = await api.get<User[]>("/api/admin/users");
      if (controller?.signal.aborted) return;
      setUsers(data);
    } catch (err: unknown) {
      if (controller?.signal.aborted) return;
      if (err instanceof ApiRequestError && err.status === 403) {
        setError("Vous n'avez pas la permission de gérer les utilisateurs");
      } else {
        setError("Erreur lors du chargement des utilisateurs");
      }
    } finally {
      if (!controller?.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/api/admin/users", {
        ...formData,
        admin_role: formData.is_admin ? formData.admin_role || "super_admin" : null
      });

      setSuccess("Utilisateur créé avec succès");
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError("");

    try {
      const updateData: Record<string, unknown> = {
        email: formData.email,
        full_name: formData.full_name,
        plan: formData.plan,
        is_active: formData.is_active,
        is_admin: formData.is_admin,
        admin_role: formData.is_admin ? formData.admin_role || "super_admin" : null
      };

      if (formData.password) {
        updateData.new_password = formData.password;
      }

      await api.put(`/api/admin/users/${selectedUser.id}`, updateData);

      setSuccess("Utilisateur modifié avec succès");
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la modification");
    }
  };

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return;

    try {
      await api.delete(`/api/admin/users/${selectedUser.id}`);

      setSuccess("Utilisateur supprimé avec succès");
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  }, [selectedUser]);

  const handleToggleActive = useCallback(async (user: User) => {
    try {
      await api.put(`/api/admin/users/${user.id}`, { is_active: !user.is_active });
      fetchUsers();
    } catch (err: unknown) {
      setError("Erreur lors de la modification du statut");
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      email: "",
      full_name: "",
      password: "",
      plan: "basic",
      is_active: true,
      is_admin: false,
      admin_role: ""
    });
    setShowPassword(false);
  }, []);

  const openEditModal = useCallback((user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      password: "",
      plan: user.plan,
      is_active: user.is_active,
      is_admin: user.is_admin,
      admin_role: user.admin_role || "super_admin"
    });
    setShowEditModal(true);
  }, []);

  const getRoleInfo = useCallback((roleCode: string | null) => {
    return ADMIN_ROLES.find((r) => r.code === roleCode) || ADMIN_ROLES[0];
  }, []);

  // Loading skeleton (Issue #18)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-7 w-64 mb-2" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
            <Skeleton className="h-10 w-44 rounded-lg" />
          </div>
          {/* Filters skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-10 flex-1 min-w-[200px]" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          {/* Roles skeleton */}
          <Skeleton className="h-16 rounded-xl mb-6" />
          {/* Table skeleton */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="main-content" className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
              <p className="text-gray-600">{users.length} utilisateurs au total</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Nouvel utilisateur
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
            {error}
            <button onClick={() => setError("")}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center justify-between">
            {success}
            <button onClick={() => setSuccess("")}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="admin">Administrateurs</option>
              <option value="user">Utilisateurs</option>
            </select>
          </div>
        </div>

        {/* Légende des rôles */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Rôles Administrateurs</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {ADMIN_ROLES.map((role) => (
              <div key={role.code} className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                  {role.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rôle Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date création
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const roleInfo = getRoleInfo(user.admin_role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.plan === "entreprise"
                              ? "bg-purple-100 text-purple-800"
                              : user.plan === "professionnel"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_admin ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <UserCheck className="w-3 h-3" /> Actif
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" /> Inactif
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucun utilisateur trouvé
            </div>
          )}
        </div>
      </div>

      {/* Modal Créer */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nouvel Utilisateur</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe (laisser vide pour générer automatiquement)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Généré automatiquement si vide"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="professionnel">Professionnel</option>
                  <option value="entreprise">Entreprise</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Actif</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_admin}
                    onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Administrateur</span>
                </label>
              </div>

              {/* Section Rôle Admin */}
              {formData.is_admin && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Rôle Administrateur
                  </label>
                  <div className="space-y-2">
                    {ADMIN_ROLES.map((role) => {
                      const RoleIcon = ROLE_ICONS[role.code] || FileText;
                      return (
                        <label
                          key={role.code}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                            formData.admin_role === role.code
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="admin_role"
                            value={role.code}
                            checked={formData.admin_role === role.code}
                            onChange={(e) => setFormData({ ...formData, admin_role: e.target.value })}
                            className="w-4 h-4 text-blue-600"
                          />
                          <RoleIcon className="w-5 h-5 text-gray-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{role.label}</p>
                            <p className="text-xs text-gray-500">{role.description}</p>
                          </div>
                          <div className="flex gap-1">
                            {role.permissions.studies && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">É</span>
                            )}
                            {role.permissions.insights && (
                              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">I</span>
                            )}
                            {role.permissions.reports && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">R</span>
                            )}
                            {role.permissions.users && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">U</span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    É = Études, I = Insights, R = Rapports, U = Utilisateurs
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Modifier l'Utilisateur</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe (laisser vide pour ne pas modifier)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Laisser vide pour conserver"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="professionnel">Professionnel</option>
                  <option value="entreprise">Entreprise</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Actif</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_admin}
                    onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Administrateur</span>
                </label>
              </div>

              {/* Section Rôle Admin */}
              {formData.is_admin && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Rôle Administrateur
                  </label>
                  <div className="space-y-2">
                    {ADMIN_ROLES.map((role) => {
                      const RoleIcon = ROLE_ICONS[role.code] || FileText;
                      return (
                        <label
                          key={role.code}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                            formData.admin_role === role.code
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="admin_role"
                            value={role.code}
                            checked={formData.admin_role === role.code}
                            onChange={(e) => setFormData({ ...formData, admin_role: e.target.value })}
                            className="w-4 h-4 text-blue-600"
                          />
                          <RoleIcon className="w-5 h-5 text-gray-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{role.label}</p>
                            <p className="text-xs text-gray-500">{role.description}</p>
                          </div>
                          <div className="flex gap-1">
                            {role.permissions.studies && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">É</span>
                            )}
                            {role.permissions.insights && (
                              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">I</span>
                            )}
                            {role.permissions.reports && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">R</span>
                            )}
                            {role.permissions.users && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">U</span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    É = Études, I = Insights, R = Rapports, U = Utilisateurs
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Supprimer */}
      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          userName={selectedUser.full_name}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
}
