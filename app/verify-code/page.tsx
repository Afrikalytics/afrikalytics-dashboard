import type { Metadata } from 'next';
import VerifyCodeForm from './VerifyCodeForm';

export const metadata: Metadata = {
  title: 'Vérification — Datatym AI',
  description: 'Vérifiez votre code de sécurité Datatym AI.',
  openGraph: {
    title: 'Vérification — Datatym AI',
    description: 'Vérifiez votre code de sécurité sur la plateforme Datatym AI',
  },
};

export default function VerifyCodePage() {
  return <VerifyCodeForm />;
}
