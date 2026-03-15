import type { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Mot de passe oublié — Afrikalytics',
  description: 'Réinitialisez votre mot de passe Afrikalytics.',
  openGraph: {
    title: 'Mot de passe oublié — Afrikalytics',
    description: 'Réinitialisez votre mot de passe sur la plateforme Afrikalytics',
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
