import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://walletiz.fr"),
  title: "Walletiz — Carte de fidélité digitale",
  description:
    "La carte de fidélité digitale des petits commerces : un QR code, zéro application à installer.",
  openGraph: {
    title: "Walletiz — Carte de fidélité digitale",
    description:
      "La carte de fidélité digitale des petits commerces : un QR code, zéro application à installer.",
    url: "https://walletiz.fr",
    siteName: "Walletiz",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "Walletiz" }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Walletiz — Carte de fidélité digitale",
    description:
      "La carte de fidélité digitale des petits commerces : un QR code, zéro application à installer.",
    images: ["/icon.png"],
  },
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
