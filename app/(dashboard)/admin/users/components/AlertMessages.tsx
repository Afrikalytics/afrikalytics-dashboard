'use client';

import { AnimatePresence } from 'framer-motion';
import { Alert } from '@/components/ui';

interface AlertMessagesProps {
  error: string;
  success: string;
  onDismissError: () => void;
  onDismissSuccess: () => void;
}

export function AlertMessages({
  error,
  success,
  onDismissError,
  onDismissSuccess,
}: AlertMessagesProps) {
  return (
    <AnimatePresence>
      {error && (
        <Alert variant="error" dismissible onDismiss={onDismissError}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onDismiss={onDismissSuccess}>
          {success}
        </Alert>
      )}
    </AnimatePresence>
  );
}
