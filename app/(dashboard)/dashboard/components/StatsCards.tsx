"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, Lightbulb, Download } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface StatItem {
  label: string;
  value: number;
  icon: ReactNode;
  iconBg: string;
}

interface StatsCardsProps {
  stats: DashboardStats | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items: StatItem[] = [
    {
      label: "Études accessibles",
      value: stats?.studies_accessible || 0,
      icon: <FileText className="h-5 w-5" />,
      iconBg: "bg-surface-100 text-surface-600",
    },
    {
      label: "Études ouvertes",
      value: stats?.studies_open || 0,
      icon: <CheckCircle className="h-5 w-5" />,
      iconBg: "bg-surface-100 text-surface-600",
    },
    {
      label: "Insights disponibles",
      value: stats?.insights_available || 0,
      icon: <Lightbulb className="h-5 w-5" />,
      iconBg: "bg-surface-100 text-surface-600",
    },
    {
      label: "Rapports disponibles",
      value: stats?.reports_available || 0,
      icon: <Download className="h-5 w-5" />,
      iconBg: "bg-surface-100 text-surface-600",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
    >
      {items.map((stat) => (
        <motion.div key={stat.label} variants={itemVariants}>
          <div className="bg-white rounded-xl border border-surface-200 p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl lg:text-3xl font-extrabold text-surface-900 mt-1 tracking-tight tabular-nums">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.iconBg}`} aria-hidden="true">
                {stat.icon}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
