import type { Metadata } from 'next';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe — Datatym AI',
  description: 'Définissez un nouveau mot de passe pour votre compte Datatym AI.',
  openGraph: {
    title: 'Réinitialiser le mot de passe — Datatym AI',
    description: 'Définissez un nouveau mot de passe sur la plateforme Datatym AI',
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
