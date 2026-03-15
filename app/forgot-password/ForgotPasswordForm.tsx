"use client";

import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, BarChart3 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Une erreur est survenue");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-white flex items-center justify-center p-6"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="w-full max-w-[400px] text-center"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-success-50 rounded-full mb-6">
              <CheckCircle className="h-7 w-7 text-success-600" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold text-surface-900 mb-3">
              Email envoyé
            </h1>
            <p className="text-surface-500 text-sm leading-relaxed">
              Si un compte existe avec l&apos;adresse <span className="font-medium text-surface-700">{email}</span>,
              vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
            </p>
            <p className="text-xs text-surface-400 mt-4">
              Le lien expire dans 1 heure. Pensez à vérifier vos spams.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-white flex items-center justify-center p-6"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-16">
          <BarChart3 className="h-6 w-6 text-surface-900" />
          <span className="text-xl font-semibold text-surface-900 tracking-tight">
            Afrikalytics<span className="text-warning-500">.</span>
          </span>
        </motion.div>

        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="text-2xl font-semibold text-surface-900 tracking-tight mb-2">
            Mot de passe oublié
          </h1>
          <p className="text-surface-500 text-sm">
            Entrez votre email et nous vous enverrons un lien de réinitialisation.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div variants={fadeInUp}>
              <Alert
                variant="error"
                dismissible
                onDismiss={() => setError("")}
              >
                {error}
              </Alert>
            </motion.div>
          )}

          <motion.div variants={fadeInUp}>
            <Input
              label="Adresse email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              icon={<Mail className="h-4 w-4" />}
              size="lg"
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Button
              type="submit"
              loading={loading}
              disabled={!email}
              fullWidth
              size="lg"
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </Button>
          </motion.div>
        </form>

        <motion.div variants={fadeInUp} className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div variants={fadeInUp} className="mt-16 text-center">
          <p className="text-xs text-surface-300">
            © 2026 Afrikalytics by Marketym
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
