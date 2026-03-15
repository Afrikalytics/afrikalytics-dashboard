"use client";

import { motion } from "framer-motion";
import { FileText, ChevronRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/lib/constants";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface Study {
  id: number | string;
  title: string;
  description: string;
  status: string;
  duration?: string;
  category: string;
}

interface RecentStudiesProps {
  studies: Study[];
}

export function RecentStudies({ studies }: RecentStudiesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card padding="none">
        <div className="px-5 lg:px-6 py-4 border-b border-surface-100">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-surface-900 tracking-tight">
              Dernières Études
            </h2>
            <a
              href={ROUTES.ETUDES}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              Voir tout
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {studies.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="Aucune étude disponible"
            description="Les études apparaîtront ici dès qu'elles seront publiées."
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-surface-100"
          >
            {studies.map((study) => (
              <motion.a
                key={study.id}
                variants={itemVariants}
                href={`/dashboard/etudes/${study.id}`}
                className="group flex items-start justify-between gap-4 p-5 lg:p-6 hover:bg-surface-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors tracking-tight">
                      {study.title}
                    </h3>
                    <Badge
                      variant={study.status === "Ouvert" ? "success" : "danger"}
                      size="sm"
                      dot
                    >
                      {study.status}
                    </Badge>
                  </div>
                  <p className="text-surface-500 text-sm mb-3 line-clamp-2">
                    {study.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {study.duration || "15-20 min"}
                    </span>
                    <Badge variant="primary" size="sm">{study.category}</Badge>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-surface-300 group-hover:text-primary-500 transition-colors shrink-0 hidden sm:block mt-1" />
              </motion.a>
            ))}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
