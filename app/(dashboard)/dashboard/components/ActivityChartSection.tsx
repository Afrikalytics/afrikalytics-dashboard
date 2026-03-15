"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";

// Code-split: recharts is ~200KB — lazy-load the chart component
const ActivityChart = dynamic(() => import("@/components/ui/ActivityChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[260px] bg-surface-50 rounded-xl animate-pulse flex items-center justify-center">
      <span className="text-sm text-surface-400">Chargement du graphique...</span>
    </div>
  ),
});

interface ActivityDataItem {
  day: string;
  date: string;
  études: number;
  insights: number;
}

interface ActivityChartSectionProps {
  data: ActivityDataItem[];
}

export function ActivityChartSection({ data }: ActivityChartSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card padding="none">
        <div className="px-5 lg:px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface-100" aria-hidden="true">
              <TrendingUp className="h-5 w-5 text-surface-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-surface-900 tracking-tight">
                Activité des 7 derniers jours
              </h2>
              <p className="text-xs text-surface-500">Études et insights consultés</p>
            </div>
          </div>
        </div>
        <div className="p-5 lg:p-6">
          <ActivityChart data={data} />
        </div>
      </Card>
    </motion.div>
  );
}
