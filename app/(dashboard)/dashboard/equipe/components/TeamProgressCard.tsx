'use client';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { TeamData } from './types';

interface TeamProgressCardProps {
  readonly teamData: TeamData | null;
  readonly remainingSlots: number;
}

export function TeamProgressCard({ teamData, remainingSlots }: TeamProgressCardProps) {
  return (
    <Card>
      <ProgressBar
        value={teamData?.current_count || 1}
        max={teamData?.max_members || 5}
        variant="accent"
        size="md"
        label="Places utilisées"
        showValue
      />
      <p className="text-xs text-surface-400 mt-2">
        {remainingSlots} place{remainingSlots > 1 ? 's' : ''} restante
        {remainingSlots > 1 ? 's' : ''}
      </p>
    </Card>
  );
}
