'use client';

import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuccessMessageProps {
  readonly message: string;
}

export function SuccessMessage({ message }: SuccessMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-xl text-sm"
      role="status"
    >
      <CheckCircle className="h-5 w-5 shrink-0" />
      {message}
    </motion.div>
  );
}
