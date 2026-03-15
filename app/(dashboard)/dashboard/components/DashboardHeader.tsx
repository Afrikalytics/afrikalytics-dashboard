"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { PLAN_BADGES } from "@/lib/constants";

interface DashboardHeaderProps {
  userName: string | undefined;
  userPlan: string | undefined;
}

export function DashboardHeader({ userName, userPlan }: DashboardHeaderProps) {
  const planBadge = PLAN_BADGES[userPlan || "basic"] || PLAN_BADGES.basic;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 className="font-heading text-3xl lg:text-4xl font-bold text-surface-900 tracking-tight">
          Bienvenue, {userName?.split(" ")[0]}
        </h1>
        <p className="text-surface-500 mt-1 text-sm">
          Voici un aperçu de vos études et insights
        </p>
      </div>
      <Badge
        variant={userPlan === "entreprise" ? "accent" : userPlan === "professionnel" ? "primary" : "default"}
        size="md"
      >
        {planBadge.label}
      </Badge>
    </motion.div>
  );
}
