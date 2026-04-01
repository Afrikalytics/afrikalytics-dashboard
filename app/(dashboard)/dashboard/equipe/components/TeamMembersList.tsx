'use client';

import { Users, User, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { containerVariants, itemVariants } from './constants';
import type { TeamMember } from './types';

interface TeamMembersListProps {
  readonly members: TeamMember[];
  readonly onDelete: (member: TeamMember) => void;
  readonly onAddFirst: () => void;
}

export function TeamMembersList({ members, onDelete, onAddFirst }: TeamMembersListProps) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="Aucun membre dans votre équipe"
        action={
          <Button variant="ghost" onClick={onAddFirst}>
            Ajouter votre premier membre
          </Button>
        }
      />
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {members.map((member) => (
        <motion.div key={member.id} variants={itemVariants}>
          <Card variant="bordered">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-11 h-11 bg-primary-50 rounded-full flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-surface-900">{member.full_name}</p>
                    <Badge variant={member.is_active ? 'success' : 'danger'} size="sm" dot>
                      {member.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <p className="text-sm text-surface-500 truncate">{member.email}</p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    Ajouté le {new Date(member.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDelete(member)}
                className="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all shrink-0"
                title="Retirer de l'équipe"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
