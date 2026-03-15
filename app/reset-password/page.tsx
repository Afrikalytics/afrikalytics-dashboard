import type { Metadata } from 'next';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe — Afrikalytics',
  description: 'Définissez un nouveau mot de passe pour votre compte Afrikalytics.',
  openGraph: {
    title: 'Réinitialiser le mot de passe — Afrikalytics',
    description: 'Définissez un nouveau mot de passe sur la plateforme Afrikalytics',
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
