'use client';

import { Plus } from 'lucide-react';
import { Breadcrumb, Button } from '@/components/ui';

interface AdminUsersHeaderProps {
  totalUsers: number;
  onCreateUser: () => void;
}

export function AdminUsersHeader({ totalUsers, onCreateUser }: AdminUsersHeaderProps) {
  return (
    <>
      <Breadcrumb
        items={[{ label: 'Administration', href: '/admin' }, { label: 'Utilisateurs' }]}
        className="mb-2"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
            Gestion des Utilisateurs
          </h1>
          <p className="text-surface-500 mt-1">
            {totalUsers} utilisateur{totalUsers !== 1 ? 's' : ''} au total
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={onCreateUser}>
          Nouvel utilisateur
        </Button>
      </div>
    </>
  );
}
