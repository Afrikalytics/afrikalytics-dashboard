'use client';

import { CreditCard } from 'lucide-react';

export function PageHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
        <CreditCard className="w-6 h-6" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-surface-900">Facturation</h1>
        <p className="text-sm text-surface-500">
          Gerez votre abonnement et consultez votre historique de paiements
        </p>
      </div>
    </div>
  );
}
