"use client";

import { FileX } from "lucide-react";

// =============================================================================
// EmptyState — Design System (Corporate Premium)
// =============================================================================
// Displayed when a list/table has no data.
// Supports: custom icon, title, description, action button
// Corporate: generous spacing, refined typography
// =============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        py-20 px-8 animate-fade-in
        ${className}
      `}
    >
      <div className="p-4 rounded-xl bg-surface-50 text-surface-400 mb-6" aria-hidden="true">
        {icon || <FileX className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-semibold text-surface-900 tracking-tight mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-surface-500 max-w-md mb-8 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  );
}
