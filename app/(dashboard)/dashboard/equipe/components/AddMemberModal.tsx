'use client';

import { User, Mail, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { AddMemberFormData } from './types';

interface AddMemberModalProps {
  readonly formData: AddMemberFormData;
  readonly error: string;
  readonly actionLoading: boolean;
  readonly onFormDataChange: (data: AddMemberFormData) => void;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
}

export function AddMemberModal({
  formData,
  error,
  actionLoading,
  onFormDataChange,
  onClose,
  onSubmit,
}: AddMemberModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl w-full max-w-md shadow-xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <h2 className="text-base font-semibold text-surface-900">Ajouter un membre</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-surface-400" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-danger-50 text-danger-600 px-4 py-2 rounded-lg text-sm border border-danger-200">
              {error}
            </div>
          )}
          <Input
            label="Nom complet"
            value={formData.full_name}
            onChange={(e) => onFormDataChange({ ...formData, full_name: e.target.value })}
            icon={<User className="h-4 w-4" />}
            placeholder="Jean Dupont"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
            icon={<Mail className="h-4 w-4" />}
            placeholder="email@entreprise.com"
          />
          <p className="text-xs text-surface-400">
            Un email sera envoyé avec un mot de passe temporaire.
          </p>
        </div>
        <div className="flex gap-3 p-5 border-t border-surface-100">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            fullWidth
            loading={actionLoading}
            disabled={!formData.email || !formData.full_name}
            onClick={onSubmit}
          >
            Ajouter
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
