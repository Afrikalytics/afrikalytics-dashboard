"use client";

import { SkeletonCard } from "@/components/ui/Skeleton";

export function DashboardPageSkeleton() {
  return (
    <div className="page-container space-y-8" aria-busy="true">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="skeleton h-8 w-64 rounded-lg" />
          <div className="skeleton h-4 w-48 rounded" />
        </div>
        <div className="skeleton h-8 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="skeleton h-64 rounded-2xl" />
      <div className="skeleton h-52 rounded-2xl" />
      <div className="card p-6 space-y-4">
        <div className="skeleton h-5 w-40 rounded" />
        <div className="skeleton h-20 rounded-xl" />
        <div className="skeleton h-20 rounded-xl" />
      </div>
    </div>
  );
}
