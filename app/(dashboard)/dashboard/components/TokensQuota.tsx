"use client";

import { motion } from "framer-motion";
import { Coins, Infinity, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TOKEN_LABELS, ROUTES } from "@/lib/constants";
import type { QuotaData } from "@/lib/types";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface TokensQuotaProps {
  quota: QuotaData;
}

export function TokensQuota({ quota }: TokensQuotaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card padding="none" className="overflow-hidden">
        <div className="px-5 lg:px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-surface-100" aria-hidden="true">
              <Coins className="h-5 w-5 text-surface-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-surface-900 tracking-tight">
                Mes Tokens
              </h2>
              <p className="text-xs text-surface-500">Utilisation du mois en cours</p>
            </div>
          </div>
          {quota.days_remaining !== null && (
            <Badge variant="outline">
              {quota.days_remaining}j restants
            </Badge>
          )}
        </div>

        <div className="p-5 lg:p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {quota.tokens.map((tokenItem) => {
              const meta = TOKEN_LABELS[tokenItem.name] || { label: tokenItem.name, icon: "zap" };

              return (
                <motion.div
                  key={tokenItem.name}
                  variants={itemVariants}
                  className="border border-surface-200 rounded-xl p-4 hover:border-surface-300 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-surface-700">{meta.label}</span>
                    {tokenItem.unlimited ? (
                      <Badge variant="success" size="sm" icon={<Infinity className="h-3 w-3" />}>
                        Illimité
                      </Badge>
                    ) : (
                      <span className="text-xs text-surface-500 tabular-nums">
                        {tokenItem.used}/{tokenItem.limit}
                      </span>
                    )}
                  </div>

                  {tokenItem.unlimited ? (
                    <ProgressBar value={100} variant="success" size="sm" />
                  ) : (
                    <>
                      <ProgressBar
                        value={tokenItem.used}
                        max={tokenItem.limit}
                        autoColor
                        size="sm"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-surface-500">
                          {tokenItem.remaining} restant{(tokenItem.remaining ?? 0) > 1 ? "s" : ""}
                        </span>
                        {tokenItem.percentage >= 90 && (
                          <Badge variant="danger" size="sm" icon={<Zap className="h-3 w-3" />}>
                            Presque épuisé
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {quota.plan === "basic" && (
            <div className="mt-4 flex items-center justify-between bg-surface-50 rounded-xl p-4 border border-surface-200">
              <p className="text-sm text-surface-600">
                Passez à Premium pour débloquer des tokens illimités
              </p>
              <a
                href={ROUTES.PREMIUM}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap ml-4"
              >
                Voir les offres
              </a>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
