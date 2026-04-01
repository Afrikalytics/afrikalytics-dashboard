'use client';

import { Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { TeamData } from './types';

interface OwnerCardProps {
  readonly teamData: TeamData | null;
}

export function OwnerCard({ teamData }: OwnerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card variant="bordered">
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 bg-accent-50 rounded-full flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <Crown className="h-5 w-5 text-accent-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-surface-900">{teamData?.owner.full_name}</p>
              <Badge variant="accent" size="sm">
                Propriétaire
              </Badge>
            </div>
            <p className="text-sm text-surface-500 truncate">{teamData?.owner.email}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
