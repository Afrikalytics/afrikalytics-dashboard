"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Crown, ArrowRight, Mail, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/login";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-center">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">Paiement Réussi !</h1>
            <p className="text-green-100 mt-2">Bienvenue dans Afrikalytics Premium</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Crown className="h-4 w-4" />
              Plan Professionnel Actif
            </div>

            <p className="text-gray-600 mb-6">
              Votre compte a été créé avec succès. Vos identifiants de connexion ont été envoyés à votre adresse email.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 text-blue-700">
                <Mail className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Vérifiez votre boîte mail</p>
                  <p className="text-sm text-blue-600">
                    Vos identifiants vous attendent !
                  </p>
                </div>
              </div>
            </div>

            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Se connecter
              <ArrowRight className="h-5 w-5" />
            </a>

            <p className="text-gray-400 text-sm mt-4">
              Redirection automatique dans {countdown} secondes...
            </p>
          </div>

          {/* Features Reminder */}
          <div className="bg-gray-50 p-6 border-t">
            <p className="text-sm text-gray-600 font-medium mb-3">
              Vous avez maintenant accès à :
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Résultats temps réel
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Insights complets
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Rapports PDF
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Support prioritaire
              </div>
            </div>
          </div>
        </div>

        {/* Help Link */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Besoin d&apos;aide ?{" "}
          <a href="https://afrikalytics.com/contact" className="text-blue-600 hover:underline">
            Contactez-nous
          </a>
        </p>
      </div>
    </div>
  );
}
