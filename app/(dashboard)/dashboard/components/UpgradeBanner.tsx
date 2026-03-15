"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";

export function UpgradeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card
        padding="none"
        className="bg-surface-900 text-white overflow-hidden border-none"
      >
        <div className="p-5 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              Passez à Premium
            </h3>
            <p className="text-surface-400 text-sm mt-0.5">
              Accédez aux résultats en temps réel, insights complets et rapports détaillés
            </p>
          </div>
          <a
            href={ROUTES.PREMIUM}
            className="inline-flex items-center gap-2 bg-white text-surface-900 px-5 py-2.5 rounded-lg font-semibold hover:bg-surface-100 transition-all text-sm whitespace-nowrap"
          >
            Voir les offres
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </Card>
    </motion.div>
  );
}
