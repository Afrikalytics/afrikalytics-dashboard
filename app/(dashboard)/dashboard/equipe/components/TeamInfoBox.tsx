'use client';

import { Card } from '@/components/ui/Card';

export function TeamInfoBox() {
  return (
    <Card variant="bordered" className="border-l-4 border-l-primary-500">
      <h3 className="font-semibold text-surface-900 mb-2 text-sm">Comment ça marche ?</h3>
      <ul className="text-sm text-surface-500 space-y-1.5">
        <li>Chaque membre reçoit un email avec ses identifiants</li>
        <li>Tous les membres ont accès au plan Entreprise</li>
        <li>Vous pouvez ajouter jusqu&apos;à 4 membres (5 utilisateurs au total)</li>
        <li>Retirer un membre libère une place dans votre équipe</li>
      </ul>
    </Card>
  );
}
