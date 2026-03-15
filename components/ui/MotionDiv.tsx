"use client";

import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";

// =============================================================================
// MotionDiv — Lazy-loaded framer-motion wrapper for code splitting
// =============================================================================
// Uses LazyMotion + domAnimation instead of full motion bundle.
// domAnimation (~17KB) vs full motion (~95KB) = significant bundle savings.
// Usage: import via next/dynamic with ssr: false for maximum splitting.
// =============================================================================

interface MotionDivProps {
  children: React.ReactNode;
  className?: string;
  variants?: Record<string, any>;
  initial?: string | Record<string, any>;
  animate?: string | Record<string, any>;
  exit?: string | Record<string, any>;
  transition?: Record<string, any>;
  whileHover?: Record<string, any>;
  whileTap?: Record<string, any>;
}

export function MotionDiv({
  children,
  className,
  variants,
  initial,
  animate,
  exit,
  transition,
  whileHover,
  whileTap,
}: MotionDivProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        variants={variants}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        whileHover={whileHover}
        whileTap={whileTap}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

export { LazyMotion, domAnimation, m, AnimatePresence };

export default MotionDiv;
