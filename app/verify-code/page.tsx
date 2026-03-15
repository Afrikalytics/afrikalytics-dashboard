"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/constants";
import { saveSession } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function VerifyCodeForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown pour le bouton renvoyer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Récupérer l'email depuis sessionStorage au chargement
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verify_email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== "") && index === 5) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (codeString?: string) => {
    const finalCode = codeString || code.join("");

    if (finalCode.length !== 6) {
      setError("Veuillez entrer les 6 chiffres du code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          email: email,
          code: finalCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Code invalide");
      }

      await saveSession(data.access_token, data.user);
      sessionStorage.removeItem("verify_email");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResending(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi");
      }

      setCountdown(60);
    } catch {
      setError("Erreur lors de l'envoi du code");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="w-full max-w-[400px] text-center">
        <p className="text-surface-500 text-sm mb-4">Session expirée</p>
        <Link
          href="/login"
          className="text-surface-900 hover:text-primary-600 font-medium text-sm transition-colors"
        >
          Retour à la connexion
        </Link>
      </div>
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
          Vérification
        </h1>
        <p className="text-surface-500 text-sm">
          Entrez le code à 6 chiffres envoyé à
        </p>
        <p className="text-surface-900 font-medium text-sm mt-1">{email}</p>
      </motion.div>

      {error && (
        <motion.div variants={fadeInUp} className="mb-6">
          <Alert
            variant="error"
            dismissible
            onDismiss={() => setError("")}
          >
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Code Inputs */}
      <motion.div variants={fadeInUp} className="flex justify-center gap-3 mb-8">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={loading}
            aria-label={`Chiffre ${index + 1} sur 6`}
            className="w-12 h-14 text-center text-xl font-semibold border border-surface-300 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
              hover:border-surface-400 transition-all duration-200 disabled:opacity-50
              bg-white text-surface-900"
          />
        ))}
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Button
          onClick={() => handleSubmit()}
          loading={loading}
          disabled={code.some((d) => d === "")}
          fullWidth
          size="lg"
        >
          {loading ? "Vérification..." : "Vérifier"}
        </Button>
      </motion.div>

      {/* Resend Code */}
      <motion.div variants={fadeInUp} className="mt-8 text-center">
        <p className="text-surface-400 text-xs mb-3">Vous n&apos;avez pas reçu le code ?</p>
        <button
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {resending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi...
            </>
          ) : countdown > 0 ? (
            <>
              <RefreshCw className="h-4 w-4" />
              Renvoyer dans {countdown}s
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Renvoyer le code
            </>
          )}
        </button>
      </motion.div>

      {/* Back to login */}
      <motion.div variants={fadeInUp} className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
      </motion.div>

      {/* Info */}
      <motion.p variants={fadeInUp} className="text-center text-xs text-surface-300 mt-8">
        Le code expire dans 10 minutes
      </motion.p>

      {/* Footer */}
      <motion.div variants={fadeInUp} className="mt-12 text-center">
        <p className="text-xs text-surface-300">
          © 2026 Afrikalytics by Marketym
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function VerifyCodePage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-white flex items-center justify-center p-6"
    >
      <VerifyCodeForm />
    </main>
  );
}
