'use client';

import { Check, X } from 'lucide-react';

interface FeatureRowProps {
  label: string;
  value: boolean | number;
}

export function FeatureRow({ label, value }: FeatureRowProps) {
  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-surface-600">{label}</span>
        {value ? (
          <Check className="w-4 h-4 text-success-600" />
        ) : (
          <X className="w-4 h-4 text-surface-300" />
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-surface-600">{label}</span>
      <span className="text-sm font-semibold text-surface-900">
        {value === -1 ? 'Illimite' : value}
      </span>
    </div>
  );
}
