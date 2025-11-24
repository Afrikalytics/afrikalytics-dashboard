import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Afrikalytics Dashboard",
  description: "Votre espace premium Afrikalytics AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
