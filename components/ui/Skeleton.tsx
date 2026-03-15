"use client";

// =============================================================================
// Skeleton — Design System (Corporate Premium)
// =============================================================================
// Contextual skeleton loaders: line, circle, card, table row
// Corporate: subtle gradient shimmer
// =============================================================================

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "h-4 w-full" }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded bg-surface-100 ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-surface-200/60 to-transparent" />
    </div>
  );
}

// Skeleton text lines
export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded bg-surface-100 h-3.5 ${
            i === lines - 1 ? "w-3/4" : "w-full"
          }`}
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-surface-200/60 to-transparent" />
        </div>
      ))}
    </div>
  );
}

// Skeleton card
export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-white rounded-xl border border-surface-100 shadow-soft p-6 ${className}`} aria-hidden="true">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3 rounded" />
          <Skeleton className="h-8 w-1/2 rounded" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
      <Skeleton className="h-3 w-2/3 rounded" />
    </div>
  );
}

// Skeleton table rows
export function SkeletonTable({ rows = 5, cols = 4, className = "" }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center gap-4 p-4 rounded-xl bg-white">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 flex items-center gap-4">
            {Array.from({ length: cols - 1 }).map((_, col) => (
              <Skeleton
                key={col}
                className={`h-4 rounded ${
                  col === 0 ? "w-1/3" : col === 1 ? "w-1/4" : "w-1/6"
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Full page skeleton
export function PageSkeleton() {
  return (
    <div className="page-container space-y-6" aria-busy="true" aria-label="Chargement en cours">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Content */}
      <div className="bg-white rounded-xl border border-surface-100 shadow-soft p-6">
        <SkeletonTable rows={4} />
      </div>
    </div>
  );
}
