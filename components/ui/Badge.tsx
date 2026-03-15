"use client";

// =============================================================================
// Badge — Design System (Corporate Premium)
// =============================================================================
// Variants: default, primary, success, warning, danger, accent, outline
// Sizes: sm, md
// Supports: dot indicator, icon, removable
// Corporate: rounded-md, uppercase option for small badges
// =============================================================================

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "accent" | "outline";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Accessible label for screen readers when used as a status indicator */
  "aria-label"?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-100 text-surface-700",
  primary: "bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-200",
  success: "bg-success-50 text-success-700 ring-1 ring-inset ring-success-500/20",
  warning: "bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-500/20",
  danger: "bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-500/20",
  accent: "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-200",
  outline: "bg-transparent text-surface-600 ring-1 ring-inset ring-surface-300",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-surface-400",
  primary: "bg-primary-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
  accent: "bg-accent-500",
  outline: "bg-surface-400",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-2xs uppercase tracking-wider font-semibold",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  icon,
  children,
  className = "",
  "aria-label": ariaLabel,
}: BadgeProps) {
  return (
    <span
      role={ariaLabel ? "status" : undefined}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-md whitespace-nowrap
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
