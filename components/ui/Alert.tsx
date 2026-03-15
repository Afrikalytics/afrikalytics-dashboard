"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

// =============================================================================
// Alert — Design System (Corporate Premium)
// =============================================================================
// Variants: info, success, warning, error
// Supports: dismissible, icon override, title + description
// Animated with framer-motion (slide-in from top)
// =============================================================================

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  { bg: string; border: string; text: string; icon: typeof AlertCircle }
> = {
  info: {
    bg: "bg-primary-50",
    border: "border-primary-200",
    text: "text-primary-800",
    icon: Info,
  },
  success: {
    bg: "bg-success-50",
    border: "border-success-500/20",
    text: "text-success-700",
    icon: CheckCircle2,
  },
  warning: {
    bg: "bg-warning-50",
    border: "border-warning-500/20",
    text: "text-warning-700",
    icon: AlertTriangle,
  },
  error: {
    bg: "bg-danger-50",
    border: "border-danger-500/20",
    text: "text-danger-700",
    icon: AlertCircle,
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  dismissible = false,
  onDismiss,
  className = "",
}: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={`
        flex gap-3 p-4 rounded-lg border
        ${config.bg} ${config.border} ${config.text}
        ${className}
      `}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Fermer le message"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}
