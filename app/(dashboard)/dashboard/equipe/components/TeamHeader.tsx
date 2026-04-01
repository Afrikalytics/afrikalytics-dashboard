'use client';

import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import type { TeamData } from './types';

interface TeamHeaderProps {
  readonly teamData: TeamData | null;
  readonly remainingSlots: number;
  readonly onAddClick: () => void;
}

export function TeamHeader({ teamData, remainingSlots, onAddClick }: TeamHeaderProps) {
  return (
    <>
      <Breadcrumb items={[{ label: 'Mon Équipe' }]} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-surface-900 tracking-tight">
            Mon Équipe
          </h1>
          <p className="text-surface-500 text-sm mt-1">
            {teamData?.current_count || 1} / {teamData?.max_members || 5} membres
          </p>
        </div>
        {remainingSlots > 0 && (
          <Button variant="primary" icon={<UserPlus className="h-4 w-4" />} onClick={onAddClick}>
            <span className="hidden sm:inline">Ajouter un membre</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        )}
      </motion.div>
    </>
  );
}
