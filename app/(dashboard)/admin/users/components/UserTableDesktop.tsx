"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, UserCheck, UserX, Users } from "lucide-react";
import { ADMIN_ROLES } from "@/lib/constants";
import type { User } from "@/lib/types";
import { Avatar, Badge, Card, EmptyState } from "@/components/ui";
import { getRoleBadgeVariant, getPlanBadgeVariant } from "../utils";
import { PaginationDesktop } from "./Pagination";

const listVariants = {
  visible: { transition: { staggerChildren: 0.03 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

interface UserTableDesktopProps {
  users: User[];
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  usersPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleActive: (user: User) => void;
}

export function UserTableDesktop({
  users,
  filteredCount,
  currentPage,
  totalPages,
  usersPerPage,
  onPageChange,
  onEdit,
  onDelete,
  onToggleActive,
}: UserTableDesktopProps) {
  const getRoleInfo = (roleCode: string | null) => {
    return ADMIN_ROLES.find((r) => r.code === roleCode) || ADMIN_ROLES[0];
  };

  return (
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
            {users.map((user) => {
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
                      onClick={() => onToggleActive(user)}
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
                        onClick={() => onEdit(user)}
                        className="p-2 text-surface-400 hover:text-primary-600 hover:bg-surface-50 rounded-lg transition-colors"
                        title="Modifier"
                        aria-label={`Modifier ${user.full_name}`}
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => onDelete(user)}
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

        {filteredCount === 0 && (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="Aucun utilisateur trouvé"
            description="Essayez de modifier vos critères de recherche."
          />
        )}

        <PaginationDesktop
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCount}
          itemsPerPage={usersPerPage}
          onPageChange={onPageChange}
        />
      </Card>
    </div>
  );
}
