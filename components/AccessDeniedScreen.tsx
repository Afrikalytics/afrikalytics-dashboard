"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AccessDeniedScreen() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center p-4 min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="bg-danger-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-10 w-10 text-danger-600" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-surface-900 mb-2">
          Accès refusé
        </h1>
        <p className="text-surface-500 mb-6">
          Cette page est réservée aux administrateurs. Vous n&apos;avez pas les
          permissions nécessaires pour y accéder.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/dashboard")}
        >
          Retour au dashboard
        </Button>
      </motion.div>
    </div>
  );
}
