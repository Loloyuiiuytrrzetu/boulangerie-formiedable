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

// Zoom verrouillé partout (vitrine, page client, dashboard, super-admin) :
// empêche le pinch-to-zoom et le dézoom qui cassaient la mise en page.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// iOS Safari ignore volontairement « user-scalable=no » dans le viewport.
// On bloque donc explicitement les gestes de zoom (pinch) et le double-tap
// zoom via des écouteurs. Le script est injecté avant l'hydratation pour
// être actif dès le premier rendu, sur TOUTES les pages.
const SCRIPT_NO_ZOOM = `
(function(){
  // Pinch-to-zoom iOS Safari (événements « gesture »)
  ['gesturestart','gesturechange','gestureend'].forEach(function(ev){
    document.addEventListener(ev, function(e){ e.preventDefault(); }, { passive: false });
  });
  // Pinch multi-touch (tous navigateurs tactiles)
  document.addEventListener('touchmove', function(e){
    if (e.touches.length > 1) { e.preventDefault(); }
  }, { passive: false });

  // Android/Chrome : capture l'événement d'installation le plus tôt possible
  // (il peut se déclencher avant le montage de React). On le stocke pour que
  // la bannière « Ajouter à l'écran d'accueil » puisse le rejouer d'un clic.
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    window.__walletizBip = e;
    window.dispatchEvent(new Event('walletiz-bip'));
  });
  window.addEventListener('appinstalled', function(){
    window.__walletizBip = null;
    window.dispatchEvent(new Event('walletiz-installed'));
  });
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white antialiased">
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_NO_ZOOM }} />
        {children}
      </body>
    </html>
  );
}
