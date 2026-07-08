import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fidélio — Carte de fidélité digitale",
  description:
    "La carte de fidélité digitale des petits commerces : un QR code, zéro application à installer.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
