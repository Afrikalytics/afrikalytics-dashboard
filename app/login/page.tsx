import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Connexion — Afrikalytics',
  description: 'Connectez-vous à votre tableau de bord Afrikalytics pour accéder à vos analyses business.',
  openGraph: {
    title: 'Connexion — Afrikalytics',
    description: 'Plateforme de Business Intelligence pour l\'Afrique francophone',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
