"use client";

import { Search } from "lucide-react";
import { Card } from "@/components/ui";

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterPlan: string;
  onFilterPlanChange: (value: string) => void;
  filterAdmin: string;
  onFilterAdminChange: (value: string) => void;
}

export function UserFilters({
  searchTerm,
  onSearchChange,
  filterPlan,
  onFilterPlanChange,
  filterAdmin,
  onFilterAdminChange,
}: UserFiltersProps) {
  return (
    <Card padding="sm">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" aria-hidden="true" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-surface-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 hover:border-surface-400 transition-all placeholder:text-surface-400"
          />
        </div>
        <select
          value={filterPlan}
          onChange={(e) => onFilterPlanChange(e.target.value)}
          className="px-4 py-2 text-sm border border-surface-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 hover:border-surface-400 appearance-none cursor-pointer"
        >
          <option value="all">Tous les plans</option>
          <option value="basic">Basic</option>
          <option value="professionnel">Professionnel</option>
          <option value="entreprise">Entreprise</option>
        </select>
        <select
          value={filterAdmin}
          onChange={(e) => onFilterAdminChange(e.target.value)}
          className="px-4 py-2 text-sm border border-surface-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 hover:border-surface-400 appearance-none cursor-pointer"
        >
          <option value="all">Tous les types</option>
          <option value="admin">Administrateurs</option>
          <option value="user">Utilisateurs</option>
        </select>
      </div>
    </Card>
  );
}
