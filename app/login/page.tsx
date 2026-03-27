import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Connexion — Datatym AI',
  description: 'Connectez-vous à votre tableau de bord Datatym AI pour accéder à vos analyses business.',
  openGraph: {
    title: 'Connexion — Datatym AI',
    description: 'Plateforme de Business Intelligence pour l\'Afrique francophone',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
