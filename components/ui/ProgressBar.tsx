"use client";

import { motion } from "framer-motion";

// =============================================================================
// ProgressBar — Design System (Corporate Premium)
// =============================================================================
// Accessible progress bar with color variants and label
// Animated fill on mount with framer-motion
// =============================================================================

type ProgressVariant = "primary" | "success" | "warning" | "danger" | "accent";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  /** Auto-select color based on percentage thresholds */
  autoColor?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
  className?: string;
}

const variantColors: Record<ProgressVariant, { bg: string; fill: string }> = {
  primary: { bg: "bg-primary-100", fill: "bg-primary-500" },
  success: { bg: "bg-success-100", fill: "bg-success-500" },
  warning: { bg: "bg-warning-100", fill: "bg-warning-500" },
  danger: { bg: "bg-danger-100", fill: "bg-danger-500" },
  accent: { bg: "bg-accent-100", fill: "bg-accent-500" },
};

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

function getAutoVariant(percentage: number): ProgressVariant {
  if (percentage >= 90) return "danger";
  if (percentage >= 70) return "warning";
  return "primary";
}

export function ProgressBar({
  value,
  max = 100,
  variant = "primary",
  autoColor = false,
  size = "md",
  label,
  showValue = false,
  className = "",
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  const effectiveVariant = autoColor ? getAutoVariant(percentage) : variant;
  const colors = variantColors[effectiveVariant];

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-surface-700">{label}</span>}
          {showValue && (
            <span className="text-xs font-medium text-surface-500 tabular-nums">
              {value}/{max === Infinity ? "\u221E" : max}
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${colors.bg} rounded-full overflow-hidden ${sizeStyles[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max === Infinity ? undefined : max}
        aria-label={label || `${percentage}%`}
      >
        <motion.div
          className={`${colors.fill} ${sizeStyles[size]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  );
}
