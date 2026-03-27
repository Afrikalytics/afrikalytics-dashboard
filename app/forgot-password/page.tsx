import type { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Mot de passe oublié — Datatym AI',
  description: 'Réinitialisez votre mot de passe Datatym AI.',
  openGraph: {
    title: 'Mot de passe oublié — Datatym AI',
    description: 'Réinitialisez votre mot de passe sur la plateforme Datatym AI',
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
