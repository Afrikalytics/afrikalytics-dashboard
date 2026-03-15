"use client";

import { ChevronRight, Home } from "lucide-react";

// =============================================================================
// Breadcrumb — Design System (Corporate Premium)
// =============================================================================
// Navigation breadcrumb with home icon and separator
// Corporate: generous spacing, tracking-wide for current page
// =============================================================================

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" className={className}>
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <a
            href="/dashboard"
            className="text-surface-400 hover:text-primary-600 transition-colors p-1 rounded"
            aria-label="Accueil"
          >
            <Home className="h-4 w-4" />
          </a>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="h-3.5 w-3.5 text-surface-300" aria-hidden="true" />
              {isLast || !item.href ? (
                <span
                  className="font-semibold text-surface-800 tracking-tight"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="text-surface-400 hover:text-primary-600 transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
