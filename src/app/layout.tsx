import type { Metadata, Viewport } from "next";
import "./globals.css";

// Titre par défaut ultra-court : les pages qui ont leur propre metadata
// (comme /c/[slug]) écrasent totalement ce titre par le nom du commerce.
// Sur iPhone, une page installée en PWA affiche ce titre en sous-ligne
// des notifications — on veut donc rien qui parle de Walletiz sur la
// page commerce.
export const metadata: Metadata = {
  metadataBase: new URL("https://walletiz.fr"),
  title: "Walletiz",
  description: "Cartes de fidélité digitales pour petits commerces.",
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
