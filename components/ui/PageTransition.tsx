"use client";

import { motion } from "framer-motion";

// =============================================================================
// PageTransition — Design System (Corporate Premium)
// =============================================================================
// Wrapper framer-motion pour les transitions de page
// Animation fade-in-up subtile et professionnelle
// Usage: <PageTransition>contenu de la page</PageTransition>
// =============================================================================

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
