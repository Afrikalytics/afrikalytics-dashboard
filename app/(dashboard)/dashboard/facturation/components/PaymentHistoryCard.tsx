'use client';

import { CreditCard, Clock } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import type { PaymentHistoryResponse, PaymentHistoryItem } from '@/lib/types';

interface PaymentHistoryCardProps {
  history: PaymentHistoryResponse | null;
}

export function PaymentHistoryCard({ history }: PaymentHistoryCardProps) {
  return (
    <Card>
      <CardHeader
        title="Historique des paiements"
        subtitle={`${history?.total || 0} paiement(s) au total`}
        icon={<Clock className="w-5 h-5" />}
      />
      {history && history.payments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left py-3 px-2 font-semibold text-surface-500 uppercase tracking-wider text-xs">
                  Date
                </th>
                <th className="text-left py-3 px-2 font-semibold text-surface-500 uppercase tracking-wider text-xs">
                  Plan
                </th>
                <th className="text-right py-3 px-2 font-semibold text-surface-500 uppercase tracking-wider text-xs">
                  Montant
                </th>
                <th className="text-center py-3 px-2 font-semibold text-surface-500 uppercase tracking-wider text-xs">
                  Statut
                </th>
                <th className="text-left py-3 px-2 font-semibold text-surface-500 uppercase tracking-wider text-xs">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody>
              {history.payments.map((payment: PaymentHistoryItem) => (
                <tr
                  key={payment.id}
                  className="border-b border-surface-50 hover:bg-surface-50 transition-colors"
                >
                  <td className="py-3 px-2 text-surface-700">
                    {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-2 text-surface-900 font-medium capitalize">
                    {payment.plan}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-surface-900 tabular-nums">
                    {payment.amount.toLocaleString('fr-FR')} {payment.currency}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <PaymentStatusBadge status={payment.status} />
                  </td>
                  <td className="py-3 px-2 text-surface-500 font-mono text-xs">
                    {payment.reference ? payment.reference.substring(0, 12) + '...' : '\u2014'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-surface-400">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Aucun paiement enregistre</p>
        </div>
      )}
    </Card>
  );
}
