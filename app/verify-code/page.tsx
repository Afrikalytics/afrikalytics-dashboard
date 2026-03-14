"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/constants";
import { saveSession } from "@/lib/api";

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
    const storedEmail = sessionStorage.getItem('verify_email');
    if (storedEmail) {
      setEmail(storedEmail);
    }
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Seulement des chiffres

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Prendre seulement le dernier caractère
    setCode(newCode);

    // Auto-focus sur le prochain input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Si tous les chiffres sont entrés, soumettre automatiquement
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

    // Focus sur le dernier input rempli ou le prochain vide
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    // Si 6 chiffres collés, soumettre
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
          "X-Requested-With": "XMLHttpRequest", // CSRF protection
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

      // Store auth in httpOnly cookies (XSS-safe)
      await saveSession(data.access_token, data.user);

      // Nettoyer l'email de sessionStorage
      sessionStorage.removeItem('verify_email');

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
          "X-Requested-With": "XMLHttpRequest", // CSRF protection
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi");
      }

      setCountdown(60); // 60 secondes avant de pouvoir renvoyer
    } catch (err: unknown) {
      setError("Erreur lors de l'envoi du code");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-gray-600 mb-4">Session expirée</p>
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">
          Afrikalytics AI<span className="text-yellow-400">.</span>
        </h1>
        <p className="text-blue-200 mt-2">by Marketym</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="h-8 w-8 text-blue-600" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Vérification</h2>
          <p className="text-gray-600 mt-2">
            Entrez le code à 6 chiffres envoyé à
          </p>
          <p className="text-blue-600 font-medium">{email}</p>
        </div>

        {error && (
          <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        {/* Code Inputs */}
        <div className="flex justify-center gap-2 mb-6">
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
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2 transition disabled:opacity-50"
            />
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={loading || code.some((d) => d === "")}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Vérification...
            </>
          ) : (
            "Vérifier"
          )}
        </button>

        {/* Resend Code */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-2">Vous n&apos;avez pas reçu le code ?</p>
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
      </div>

      {/* Info */}
      <p className="text-center text-blue-200 text-sm mt-6">
        Le code expire dans 10 minutes
      </p>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <div id="main-content" className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative">
          <VerifyCodeForm />
      </div>
    </div>
  );
}
