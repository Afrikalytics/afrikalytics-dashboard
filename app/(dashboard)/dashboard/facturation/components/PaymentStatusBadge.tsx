'use client';

import { Badge } from '@/components/ui/Badge';

interface PaymentStatusBadgeProps {
  status: string;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="success" size="sm" dot>
          Effectue
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="warning" size="sm" dot>
          En attente
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="danger" size="sm" dot>
          Echoue
        </Badge>
      );
    case 'refunded':
      return (
        <Badge variant="default" size="sm" dot>
          Rembourse
        </Badge>
      );
    default:
      return <Badge size="sm">{status}</Badge>;
  }
}
