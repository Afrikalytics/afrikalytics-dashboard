"use client";

import { motion } from "framer-motion";
import { Users, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";

export function TeamBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card
        padding="none"
        className="border-l-4 border-l-accent-600 overflow-hidden"
      >
        <div className="p-5 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-accent-50 shrink-0" aria-hidden="true">
              <Users className="h-5 w-5 text-accent-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">Mon Équipe Entreprise</h3>
              <p className="text-surface-500 text-sm mt-0.5">
                Gérez les membres de votre équipe (jusqu&apos;à 5 utilisateurs)
              </p>
            </div>
          </div>
          <a
            href={ROUTES.EQUIPE}
            className="inline-flex items-center gap-2 text-accent-700 font-semibold text-sm hover:text-accent-800 transition-colors whitespace-nowrap"
          >
            Gérer mon équipe
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </Card>
    </motion.div>
  );
}
