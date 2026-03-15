import type { Metadata } from 'next';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Inscription — Afrikalytics',
  description: 'Créez votre compte Afrikalytics et commencez à analyser vos données business.',
  openGraph: {
    title: 'Inscription — Afrikalytics',
    description: 'Créez votre compte sur la plateforme de Business Intelligence pour l\'Afrique francophone',
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
