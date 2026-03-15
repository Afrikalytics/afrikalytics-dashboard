import type { Metadata } from 'next';
import VerifyCodeForm from './VerifyCodeForm';

export const metadata: Metadata = {
  title: 'Vérification — Afrikalytics',
  description: 'Vérifiez votre code de sécurité Afrikalytics.',
  openGraph: {
    title: 'Vérification — Afrikalytics',
    description: 'Vérifiez votre code de sécurité sur la plateforme Afrikalytics',
  },
};

export default function VerifyCodePage() {
  return <VerifyCodeForm />;
}
