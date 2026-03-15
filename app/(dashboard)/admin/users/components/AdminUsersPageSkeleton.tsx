"use client";

import { Card, SkeletonTable } from "@/components/ui";

export function AdminUsersPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-8 w-64 rounded" />
        <div className="skeleton h-4 w-40 rounded" />
      </div>
      <Card padding="sm">
        <div className="flex flex-wrap gap-4">
          <div className="skeleton h-10 flex-1 min-w-[200px] rounded-lg" />
          <div className="skeleton h-10 w-40 rounded-lg" />
          <div className="skeleton h-10 w-40 rounded-lg" />
        </div>
      </Card>
      <Card padding="md">
        <SkeletonTable rows={6} cols={6} />
      </Card>
    </div>
  );
}
