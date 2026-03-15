"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Crown, ArrowRight, Mail } from "lucide-react";
import { getSession } from "@/lib/api";
import { Button } from "@/components/ui";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function PaymentSuccessPage() {
  const [countdown, setCountdown] = useState(10);
  const redirectUrlRef = useRef("/login");

  useEffect(() => {
    // Check auth to redirect to the right page
    getSession().then((session) => {
      if (session.authenticated) {
        redirectUrlRef.current = "/dashboard";
      }
    });

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = redirectUrlRef.current;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="main-content"
      className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50 flex items-center justify-center p-4"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full"
      >
        {/* Success Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-heavy overflow-hidden border border-surface-100"
        >
          {/* Header */}
          <div className="bg-surface-900 px-8 py-10 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-5"
            >
              <CheckCircle className="h-10 w-10 text-success-500" />
            </motion.div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Paiement Réussi
            </h1>
            <p className="text-surface-300 mt-2 text-sm">
              Bienvenue dans Afrikalytics Premium
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 bg-warning-50 text-warning-700 px-4 py-2 rounded-md text-sm font-semibold mb-6 ring-1 ring-inset ring-warning-200">
                <Crown className="h-4 w-4" />
                Plan Professionnel Actif
              </div>
            </motion.div>

            <motion.p variants={itemVariants} className="text-surface-600 text-sm mb-6 leading-relaxed">
              Votre compte a été créé avec succès. Vos identifiants de connexion ont été envoyés à votre adresse email.
            </motion.p>

            <motion.div variants={itemVariants}>
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 text-primary-700">
                  <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Vérifiez votre boîte mail</p>
                    <p className="text-xs text-primary-600 mt-0.5">
                      Vos identifiants vous attendent !
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                iconRight={<ArrowRight className="h-4 w-4" />}
                onClick={() => window.location.href = "/login"}
              >
                Se connecter
              </Button>
            </motion.div>

            <motion.p variants={itemVariants} className="text-surface-400 text-xs text-center mt-4 tabular-nums">
              Redirection automatique dans {countdown} seconde{countdown !== 1 ? "s" : ""}...
            </motion.p>
          </div>

          {/* Features Reminder */}
          <motion.div variants={itemVariants} className="bg-surface-50 p-6 border-t border-surface-100">
            <p className="text-xs text-surface-600 font-semibold mb-3 uppercase tracking-wider">
              Vous avez maintenant accès à :
            </p>
            <div className="grid grid-cols-2 gap-2.5 text-xs text-surface-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success-500 shrink-0" aria-hidden="true" />
                Résultats temps réel
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success-500 shrink-0" aria-hidden="true" />
                Insights complets
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success-500 shrink-0" aria-hidden="true" />
                Rapports PDF
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success-500 shrink-0" aria-hidden="true" />
                Support prioritaire
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Help Link */}
        <motion.p variants={itemVariants} className="text-center text-surface-400 text-sm mt-6">
          Besoin d&apos;aide ?{" "}
          <a
            href="https://afrikalytics.com/contact"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Contactez-nous
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
