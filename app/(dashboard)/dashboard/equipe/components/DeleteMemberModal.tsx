'use client';

import { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DeleteMemberModalProps {
  readonly memberName: string;
  readonly actionLoading: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export function DeleteMemberModal({
  memberName,
  actionLoading,
  onClose,
  onConfirm,
}: DeleteMemberModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);

    const firstFocusable = modalRef.current?.querySelector('button') as HTMLElement;
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  const handleTabTrap = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusableEls = modalRef.current?.querySelectorAll(
      'button:not([disabled])',
    ) as NodeListOf<HTMLElement>;
    if (!focusableEls || focusableEls.length === 0) return;
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    if (e.shiftKey && document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-member-modal-title"
        className="bg-white rounded-xl w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleTabTrap}
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-danger-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="h-6 w-6 text-danger-600" aria-hidden="true" />
          </div>
          <h2
            id="delete-member-modal-title"
            className="text-lg font-semibold text-surface-900 mb-2"
          >
            Retirer ce membre ?
          </h2>
          <p className="text-surface-500 text-sm mb-1">
            Êtes-vous sûr de vouloir retirer{' '}
            <strong className="text-surface-700">{memberName}</strong> de votre équipe ?
          </p>
          <p className="text-xs text-surface-400 mb-6">
            Cette personne n&apos;aura plus accès au plan Entreprise.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Annuler
            </Button>
            <Button variant="danger" fullWidth loading={actionLoading} onClick={onConfirm}>
              Retirer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
