'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { api, ApiRequestError } from '@/lib/api';
import type { User } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserFormData {
  email: string;
  full_name: string;
  password: string;
  plan: string;
  is_active: boolean;
  is_admin: boolean;
  admin_role: string;
}

const INITIAL_FORM: UserFormData = {
  email: '',
  full_name: '',
  password: '',
  plan: 'basic',
  is_active: true,
  is_admin: false,
  admin_role: '',
};

const USERS_PER_PAGE = 10;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAdminUsers() {
  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterAdmin, setFilterAdmin] = useState('all');

  // Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form
  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // -------------------------------------------------------------------------
  // Fetch
  // -------------------------------------------------------------------------

  const fetchUsers = useCallback(async (controller?: AbortController) => {
    try {
      const data = await api.get<User[]>('/api/admin/users');
      if (controller?.signal.aborted) return;
      setUsers(data);
    } catch (err: unknown) {
      if (controller?.signal.aborted) return;
      if (err instanceof ApiRequestError && err.status === 403) {
        setError("Vous n'avez pas la permission de gérer les utilisateurs");
      } else {
        setError('Erreur lors du chargement des utilisateurs');
      }
    } finally {
      if (!controller?.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller);
    return () => controller.abort();
  }, [fetchUsers]);

  // -------------------------------------------------------------------------
  // Filtering & Pagination
  // -------------------------------------------------------------------------

  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(term) || user.full_name.toLowerCase().includes(term),
      );
    }

    if (filterPlan !== 'all') {
      filtered = filtered.filter((user) => user.plan === filterPlan);
    }

    if (filterAdmin === 'admin') {
      filtered = filtered.filter((user) => user.is_admin);
    } else if (filterAdmin === 'user') {
      filtered = filtered.filter((user) => !user.is_admin);
    }

    return filtered;
  }, [users, searchTerm, filterPlan, filterAdmin]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE,
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPlan, filterAdmin]);

  // -------------------------------------------------------------------------
  // Form helpers
  // -------------------------------------------------------------------------

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
  }, []);

  const openCreateModal = useCallback(() => {
    setFormData(INITIAL_FORM);
    setShowCreateModal(true);
  }, []);

  const openEditModal = useCallback((user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      password: '',
      plan: user.plan,
      is_active: user.is_active,
      is_admin: user.is_admin,
      admin_role: user.admin_role || 'super_admin',
    });
    setShowEditModal(true);
  }, []);

  const openDeleteModal = useCallback((user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  }, []);

  // -------------------------------------------------------------------------
  // CRUD handlers
  // -------------------------------------------------------------------------

  const handleCreateUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      try {
        await api.post('/api/admin/users', {
          ...formData,
          admin_role: formData.is_admin ? formData.admin_role || 'super_admin' : null,
        });

        setSuccess('Utilisateur créé avec succès');
        setShowCreateModal(false);
        setFormData(INITIAL_FORM);
        fetchUsers();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la création');
      }
    },
    [formData, fetchUsers],
  );

  const handleUpdateUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUser) return;
      setError('');

      try {
        const updateData: Record<string, unknown> = {
          email: formData.email,
          full_name: formData.full_name,
          plan: formData.plan,
          is_active: formData.is_active,
          is_admin: formData.is_admin,
          admin_role: formData.is_admin ? formData.admin_role || 'super_admin' : null,
        };

        if (formData.password) {
          updateData.new_password = formData.password;
        }

        await api.put(`/api/admin/users/${selectedUser.id}`, updateData);

        setSuccess('Utilisateur modifié avec succès');
        setShowEditModal(false);
        setFormData(INITIAL_FORM);
        fetchUsers();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
      }
    },
    [formData, selectedUser, fetchUsers],
  );

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return;

    try {
      await api.delete(`/api/admin/users/${selectedUser.id}`);

      setSuccess('Utilisateur supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  }, [selectedUser, fetchUsers]);

  const handleToggleActive = useCallback(
    async (user: User) => {
      try {
        await api.put(`/api/admin/users/${user.id}`, { is_active: !user.is_active });
        fetchUsers();
      } catch {
        setError('Erreur lors de la modification du statut');
      }
    },
    [fetchUsers],
  );

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------

  return {
    // Data
    users,
    loading,
    paginatedUsers,
    filteredUsers,

    // Filters
    searchTerm,
    setSearchTerm,
    filterPlan,
    setFilterPlan,
    filterAdmin,
    setFilterAdmin,

    // Feedback
    error,
    setError,
    success,
    setSuccess,

    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    usersPerPage: USERS_PER_PAGE,

    // Modals
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDeleteModal,
    setShowDeleteModal,
    selectedUser,

    // Form
    formData,
    setFormData,

    // Actions
    openCreateModal,
    openEditModal,
    openDeleteModal,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleActive,
  } as const;
}
