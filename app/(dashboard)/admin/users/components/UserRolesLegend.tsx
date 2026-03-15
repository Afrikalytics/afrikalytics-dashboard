"use client";

import { ADMIN_ROLES } from "@/lib/constants";
import { Badge, Card } from "@/components/ui";
import { getRoleBadgeVariant } from "../utils";

export function UserRolesLegend() {
  return (
    <Card padding="sm">
      <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Rôles Administrateurs</h3>
      <div className="flex flex-wrap gap-2">
        {ADMIN_ROLES.map((role) => (
          <Badge key={role.code} variant={getRoleBadgeVariant(role.code)} size="sm">
            {role.label}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
