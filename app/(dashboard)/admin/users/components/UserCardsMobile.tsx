"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, Users } from "lucide-react";
import { ADMIN_ROLES } from "@/lib/constants";
import type { User } from "@/lib/types";
import { Avatar, Badge, Card, EmptyState } from "@/components/ui";
import { getRoleBadgeVariant, getPlanBadgeVariant } from "../utils";
import { PaginationMobile } from "./Pagination";

const listVariants = {
  visible: { transition: { staggerChildren: 0.03 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

interface UserCardsMobileProps {
  users: User[];
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserCardsMobile({
  users,
  filteredCount,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: UserCardsMobileProps) {
  const getRoleInfo = (roleCode: string | null) => {
    return ADMIN_ROLES.find((r) => r.code === roleCode) || ADMIN_ROLES[0];
  };

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="lg:hidden space-y-3"
    >
      {filteredCount === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="Aucun utilisateur trouvé"
            description="Essayez de modifier vos critères de recherche."
          />
        </Card>
      ) : (
        users.map((user) => {
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
                      onClick={() => onEdit(user)}
                      className="p-2 text-surface-400 hover:text-primary-600 hover:bg-surface-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => onDelete(user)}
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

      <PaginationMobile
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </motion.div>
  );
}
