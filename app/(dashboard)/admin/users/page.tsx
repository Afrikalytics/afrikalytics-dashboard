"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Shield,
  UserCheck,
  UserX,
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
import { useAuth } from "@/lib/hooks/useAuth";
import type { User } from "@/lib/types";
import {
  Breadcrumb,
  Button,
  Badge,
  Card,
  Modal,
  Avatar,
  Alert,
  Input,
  Select,
  EmptyState,
  SkeletonTable,
} from "@/components/ui";

// Icon mapping for admin roles
const ROLE_ICONS: Record<string, LucideIcon> = {
  super_admin: Crown,
  admin_content: FileText,
  admin_studies: FileText,
  admin_insights: Lightbulb,
  admin_reports: Download,
};

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const listVariants = {
  visible: { transition: { staggerChildren: 0.03 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

// Map admin role codes to Badge variants
function getRoleBadgeVariant(code: string | null): "default" | "primary" | "success" | "warning" | "danger" | "accent" {
  switch (code) {
    case "super_admin": return "danger";
    case "admin_content": return "primary";
    case "admin_studies": return "primary";
    case "admin_insights": return "warning";
    case "admin_reports": return "success";
    default: return "default";
  }
}

// Map plan to Badge variant
function getPlanBadgeVariant(plan: string): "default" | "primary" | "accent" {
  switch (plan) {
    case "entreprise": return "accent";
    case "professionnel": return "primary";
    default: return "default";
  }
}

export default function AdminUsersPage() {
  const router = useRouter();
  useAuth({ requireAdmin: "users" });
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller);
    return () => controller.abort();
  }, []);

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(term) ||
          user.full_name.toLowerCase().includes(term)
      );
    }

    if (filterPlan !== "all") {
      filtered = filtered.filter((user) => user.plan === filterPlan);
    }

    if (filterAdmin === "admin") {
      filtered = filtered.filter((user) => user.is_admin);
    } else if (filterAdmin === "user") {
      filtered = filtered.filter((user) => !user.is_admin);
    }

    return filtered;
  }, [users, searchTerm, filterPlan, filterAdmin]);

  // Paginated users
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPlan, filterAdmin]);

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

  // Admin role selector — shared by create and edit modals
  const AdminRoleSelector = () => (
    <div className="bg-surface-50 p-4 rounded-lg border border-surface-200 mt-4">
      <p className="text-sm font-medium text-surface-700 mb-3 flex items-center gap-1.5">
        <Shield className="w-4 h-4" aria-hidden="true" />
        Rôle Administrateur
      </p>
      <div className="space-y-2">
        {ADMIN_ROLES.map((role) => {
          const RoleIcon = ROLE_ICONS[role.code] || FileText;
          return (
            <label
              key={role.code}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                formData.admin_role === role.code
                  ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
                  : "border-surface-200 hover:border-surface-300"
              }`}
            >
              <input
                type="radio"
                name="admin_role"
                value={role.code}
                checked={formData.admin_role === role.code}
                onChange={(e) => setFormData({ ...formData, admin_role: e.target.value })}
                className="w-4 h-4 text-primary-600"
              />
              <RoleIcon className="w-4 h-4 text-surface-500 shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900">{role.label}</p>
                <p className="text-xs text-surface-400">{role.description}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {role.permissions.studies && (
                  <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-2xs rounded font-semibold">É</span>
                )}
                {role.permissions.insights && (
                  <span className="px-1.5 py-0.5 bg-warning-100 text-warning-700 text-2xs rounded font-semibold">I</span>
                )}
                {role.permissions.reports && (
                  <span className="px-1.5 py-0.5 bg-success-100 text-success-700 text-2xs rounded font-semibold">R</span>
                )}
                {role.permissions.users && (
                  <span className="px-1.5 py-0.5 bg-danger-100 text-danger-700 text-2xs rounded font-semibold">U</span>
                )}
              </div>
            </label>
          );
        })}
      </div>
      <p className="text-2xs text-surface-400 mt-2 tracking-wide">
        É = Études, I = Insights, R = Rapports, U = Utilisateurs
      </p>
    </div>
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="skeleton h-8 w-64 rounded" />
          <div className="skeleton h-4 w-40 rounded" />
        </div>
        <Card padding="sm">
          <div className="flex flex-wrap gap-4">
            <div className="skeleton h-10 flex-1 min-w-[200px] rounded-lg" />
            <div className="skeleton h-10 w-40 rounded-lg" />
            <div className="skeleton h-10 w-40 rounded-lg" />
          </div>
        </Card>
        <Card padding="md">
          <SkeletonTable rows={6} cols={6} />
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Administration", href: "/admin" },
          { label: "Utilisateurs" },
        ]}
        className="mb-2"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
            Gestion des Utilisateurs
          </h1>
          <p className="text-surface-500 mt-1">
            {users.length} utilisateur{users.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
        >
          Nouvel utilisateur
        </Button>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible onDismiss={() => setSuccess("")}>
            {success}
          </Alert>
        )}
      </AnimatePresence>

      {/* Filtres */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" aria-hidden="true" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-surface-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 hover:border-surface-400 transition-all placeholder:text-surface-400"
            />
          </div>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-2 text-sm border border-surface-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 hover:border-surface-400 appearance-none cursor-pointer"
          >
            <option value="all">Tous les plans</option>
            <option value="basic">Basic</option>
            <option value="professionnel">Professionnel</option>
            <option value="entreprise">Entreprise</option>
          </select>
          <select
            value={filterAdmin}
            onChange={(e) => setFilterAdmin(e.target.value)}
            className="px-4 py-2 text-sm border border-surface-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 hover:border-surface-400 appearance-none cursor-pointer"
          >
            <option value="all">Tous les types</option>
            <option value="admin">Administrateurs</option>
            <option value="user">Utilisateurs</option>
          </select>
        </div>
      </Card>

      {/* Légende des rôles */}
      <Card padding="sm">
        <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Rôles Administrateurs</h3>
        <div className="flex flex-wrap gap-2">
          {ADMIN_ROLES.map((role) => (
            <Badge key={role.code} variant={getRoleBadgeVariant(role.code)} size="sm">
              {role.label}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Table — Desktop */}
      <div className="hidden lg:block">
        <Card padding="none" className="overflow-hidden">
          <table className="w-full" aria-label="Liste des utilisateurs">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="px-6 py-3.5 text-left text-2xs font-semibold text-surface-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3.5 text-left text-2xs font-semibold text-surface-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3.5 text-left text-2xs font-semibold text-surface-500 uppercase tracking-wider">Rôle Admin</th>
                <th className="px-6 py-3.5 text-left text-2xs font-semibold text-surface-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3.5 text-left text-2xs font-semibold text-surface-500 uppercase tracking-wider">Date création</th>
                <th className="px-6 py-3.5 text-right text-2xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <motion.tbody variants={listVariants} initial="hidden" animate="visible" className="divide-y divide-surface-100">
              {paginatedUsers.map((user) => {
                const roleInfo = getRoleInfo(user.admin_role);
                return (
                  <motion.tr key={user.id} variants={rowVariants} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.full_name} size="md" />
                        <div className="min-w-0">
                          <p className="font-medium text-surface-900 truncate">{user.full_name}</p>
                          <p className="text-sm text-surface-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getPlanBadgeVariant(user.plan)} size="sm">
                        {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_admin ? (
                        <Badge variant={getRoleBadgeVariant(user.admin_role)} size="sm">
                          {roleInfo.label}
                        </Badge>
                      ) : (
                        <span className="text-surface-300 text-sm">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className="transition-colors"
                        title={user.is_active ? "Désactiver" : "Activer"}
                      >
                        <Badge
                          variant={user.is_active ? "success" : "danger"}
                          size="sm"
                          dot
                          icon={user.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        >
                          {user.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-500 tabular-nums">
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-surface-400 hover:text-primary-600 hover:bg-surface-50 rounded-lg transition-colors"
                          title="Modifier"
                          aria-label={`Modifier ${user.full_name}`}
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          title="Supprimer"
                          aria-label={`Supprimer ${user.full_name}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>

          {filteredUsers.length === 0 && (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title="Aucun utilisateur trouvé"
              description="Essayez de modifier vos critères de recherche."
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100">
              <p className="text-sm text-surface-500">
                {(currentPage - 1) * usersPerPage + 1}–{Math.min(currentPage * usersPerPage, filteredUsers.length)} sur {filteredUsers.length}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-surface-300 rounded-lg text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      page === currentPage
                        ? "bg-primary-600 text-white"
                        : "border border-surface-300 text-surface-600 hover:bg-surface-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-surface-300 rounded-lg text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Cards — Mobile */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="lg:hidden space-y-3"
      >
        {filteredUsers.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title="Aucun utilisateur trouvé"
              description="Essayez de modifier vos critères de recherche."
            />
          </Card>
        ) : (
          paginatedUsers.map((user) => {
            const roleInfo = getRoleInfo(user.admin_role);
            return (
              <motion.div key={user.id} variants={rowVariants}>
                <Card padding="sm">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={user.full_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-surface-900 truncate">{user.full_name}</h3>
                      <p className="text-sm text-surface-400 truncate">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <Badge variant={getPlanBadgeVariant(user.plan)} size="sm">
                          {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                        </Badge>
                        {user.is_admin && (
                          <Badge variant={getRoleBadgeVariant(user.admin_role)} size="sm">
                            {roleInfo.label}
                          </Badge>
                        )}
                        <Badge variant={user.is_active ? "success" : "danger"} size="sm" dot>
                          {user.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                    <span className="text-xs text-surface-400 tabular-nums">
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-surface-400 hover:text-primary-600 hover:bg-surface-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-surface-500">
              Page {currentPage}/{totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modal Créer */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvel Utilisateur"
        description="Créez un nouveau compte utilisateur"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={(e) => handleCreateUser(e as unknown as React.FormEvent)}>
              Créer
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Nom complet"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helper="Laisser vide pour générer automatiquement"
            placeholder="Généré automatiquement si vide"
          />

          <Select
            label="Plan"
            value={formData.plan}
            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            options={[
              { value: "basic", label: "Basic" },
              { value: "professionnel", label: "Professionnel" },
              { value: "entreprise", label: "Entreprise" },
            ]}
          />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700">Actif</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_admin}
                onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700">Administrateur</span>
            </label>
          </div>

          {formData.is_admin && <AdminRoleSelector />}
        </form>
      </Modal>

      {/* Modal Modifier */}
      <Modal
        open={showEditModal && !!selectedUser}
        onClose={() => setShowEditModal(false)}
        title="Modifier l'Utilisateur"
        description={selectedUser?.full_name}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={(e) => handleUpdateUser(e as unknown as React.FormEvent)}>
              Enregistrer
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <Input
            label="Nom complet"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Nouveau mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helper="Laisser vide pour conserver le mot de passe actuel"
            placeholder="Laisser vide pour conserver"
          />

          <Select
            label="Plan"
            value={formData.plan}
            onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            options={[
              { value: "basic", label: "Basic" },
              { value: "professionnel", label: "Professionnel" },
              { value: "entreprise", label: "Entreprise" },
            ]}
          />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700">Actif</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_admin}
                onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700">Administrateur</span>
            </label>
          </div>

          {formData.is_admin && <AdminRoleSelector />}
        </form>
      </Modal>

      {/* Modal Supprimer */}
      <Modal
        open={showDeleteModal && !!selectedUser}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer l'utilisateur ?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              Supprimer
            </Button>
          </>
        }
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-danger-600" aria-hidden="true" />
          </div>
          <p className="text-surface-600">
            Êtes-vous sûr de vouloir supprimer <strong className="text-surface-900">{selectedUser?.full_name}</strong> ?
            Cette action est irréversible.
          </p>
        </div>
      </Modal>
    </motion.div>
  );
}
