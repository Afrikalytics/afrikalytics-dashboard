'use client';

import Link from 'next/link';
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function AccessDenied() {
  return (
    <div className="page-container flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="p-4 rounded-xl bg-accent-50 w-fit mx-auto mb-6" aria-hidden="true">
          <Building className="h-8 w-8 text-accent-600" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-surface-900 mb-2 tracking-tight">
          Fonctionnalité Entreprise
        </h1>
        <p className="text-surface-500 mb-6 leading-relaxed">
          La gestion d&apos;équipe est réservée aux abonnés du forfait Entreprise. Passez au plan
          Entreprise pour ajouter jusqu&apos;à 5 utilisateurs.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button variant="secondary">Retour au dashboard</Button>
          </Link>
          <a href="https://afrikalytics.com/premium">
            <Button variant="primary">Voir le plan Entreprise</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
