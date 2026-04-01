'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAdminUsers } from './hooks/useAdminUsers';
import {
  AdminUsersPageSkeleton,
  AdminUsersHeader,
  AlertMessages,
  UserFilters,
  UserRolesLegend,
  UserTableDesktop,
  UserCardsMobile,
} from './components';

// Code-split: modals are only shown on user click — lazy load them
const UserModals = dynamic(() => import('@/components/admin/UserModals'), {
  ssr: false,
});

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function AdminUsersPage() {
  useAuth({ requireAdmin: 'users' });

  const {
    users,
    loading,
    paginatedUsers,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    filterPlan,
    setFilterPlan,
    filterAdmin,
    setFilterAdmin,
    error,
    setError,
    success,
    setSuccess,
    currentPage,
    setCurrentPage,
    totalPages,
    usersPerPage,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDeleteModal,
    setShowDeleteModal,
    selectedUser,
    formData,
    setFormData,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleActive,
  } = useAdminUsers();

  if (loading) return <AdminUsersPageSkeleton />;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6"
    >
      <AdminUsersHeader totalUsers={users.length} onCreateUser={openCreateModal} />

      <AlertMessages
        error={error}
        success={success}
        onDismissError={() => setError('')}
        onDismissSuccess={() => setSuccess('')}
      />

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
