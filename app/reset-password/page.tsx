"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, ArrowLeft, CheckCircle, AlertCircle, BarChart3, Loader2 } from "lucide-react";
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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Token manquant
  if (!token) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="w-full max-w-[400px] text-center"
      >
        <motion.div variants={fadeInUp}>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-danger-50 rounded-full mb-6">
            <AlertCircle className="h-7 w-7 text-danger-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold text-surface-900 mb-3">
            Lien invalide
          </h1>
          <p className="text-surface-500 text-sm mb-8">
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <Button
            fullWidth
            size="lg"
            onClick={() => window.location.href = "/forgot-password"}
          >
            Demander un nouveau lien
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          token: token,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Une erreur est survenue");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="w-full max-w-[400px] text-center"
      >
        <motion.div variants={fadeInUp}>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-success-50 rounded-full mb-6">
            <CheckCircle className="h-7 w-7 text-success-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold text-surface-900 mb-3">
            Mot de passe réinitialisé
          </h1>
          <p className="text-surface-500 text-sm mb-8">
            Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
          </p>
          <Link href="/login">
            <Button fullWidth size="lg">
              Se connecter
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
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
          Nouveau mot de passe
        </h1>
        <p className="text-surface-500 text-sm">
          Définissez votre nouveau mot de passe
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
            label="Nouveau mot de passe"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            size="lg"
            helper="Minimum 8 caractères"
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            size="lg"
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Button
            type="submit"
            loading={loading}
            disabled={!newPassword || !confirmPassword}
            fullWidth
            size="lg"
          >
            {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
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
  );
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-[400px] text-center">
      <Loader2 className="h-8 w-8 animate-spin text-surface-400 mx-auto mb-4" />
      <p className="text-surface-500 text-sm">Chargement...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-white flex items-center justify-center p-6"
    >
      <Suspense fallback={<LoadingFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
