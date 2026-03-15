"use client";

import { forwardRef } from "react";

// =============================================================================
// Card — Design System (Corporate Premium)
// =============================================================================
// Variants: default, elevated, interactive, bordered, glass
// Supports: padding sizes, header/footer slots
// =============================================================================

type CardVariant = "default" | "elevated" | "interactive" | "bordered" | "glass";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white rounded-xl shadow-soft border border-surface-100",
  elevated: "bg-white rounded-xl shadow-medium border border-surface-100",
  interactive: "bg-white rounded-xl shadow-soft border border-surface-100 hover:shadow-medium hover:border-surface-200 transition-all duration-200 cursor-pointer",
  bordered: "bg-white rounded-xl border border-surface-200",
  glass: "bg-white/70 backdrop-blur-xl rounded-xl border border-white/40 shadow-soft",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-4 lg:p-6",
  lg: "p-6 lg:p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 pb-4 border-b border-surface-100 ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="shrink-0 p-2 rounded-lg bg-primary-50 text-primary-600">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-surface-900 tracking-tight truncate">{title}</h3>
          {subtitle && (
            <p className="text-sm text-surface-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// Stat Card — specialized for dashboard stats
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, iconBg = "bg-primary-50 text-primary-600", trend, className = "" }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-soft border border-surface-100 p-4 lg:p-6 animate-fade-in-up ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl lg:text-3xl font-extrabold text-surface-900 mt-1 tracking-tight tabular-nums">{value}</p>
          {trend && (
            <p className={`text-xs font-semibold mt-2 ${trend.positive ? "text-success-600" : "text-danger-600"}`}>
              {trend.positive ? "+" : ""}{trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`} aria-hidden="true">
          {icon}
        </div>
      </div>
    </div>
  );
}
