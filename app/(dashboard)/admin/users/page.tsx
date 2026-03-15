"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { api, ApiRequestError } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";
import type { User } from "@/lib/types";
import { Breadcrumb, Button, Alert } from "@/components/ui";
import {
  AdminUsersPageSkeleton,
  UserFilters,
  UserRolesLegend,
  UserTableDesktop,
  UserCardsMobile,
} from "./components";

// Code-split: modals are only shown on user click — lazy load them
const UserModals = dynamic(() => import("@/components/admin/UserModals"), {
  ssr: false,
});

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function AdminUsersPage() {
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
    } catch {
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

  const openDeleteModal = useCallback((user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  }, []);

  if (loading) return <AdminUsersPageSkeleton />;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6"
    >
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

      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterPlan={filterPlan}
        onFilterPlanChange={setFilterPlan}
        filterAdmin={filterAdmin}
        onFilterAdminChange={setFilterAdmin}
      />

      <UserRolesLegend />

      <UserTableDesktop
        users={paginatedUsers}
        filteredCount={filteredUsers.length}
        currentPage={currentPage}
        totalPages={totalPages}
        usersPerPage={usersPerPage}
        onPageChange={setCurrentPage}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onToggleActive={handleToggleActive}
      />

      <UserCardsMobile
        users={paginatedUsers}
        filteredCount={filteredUsers.length}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
      />

      {/* Code-split: modals lazy-loaded — only fetched when user clicks */}
      {(showCreateModal || showEditModal || showDeleteModal) && (
        <UserModals
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          selectedUser={selectedUser}
          formData={formData}
          setFormData={setFormData}
          handleCreateUser={handleCreateUser}
          handleUpdateUser={handleUpdateUser}
          handleDeleteUser={handleDeleteUser}
        />
      )}
    </motion.div>
  );
}
