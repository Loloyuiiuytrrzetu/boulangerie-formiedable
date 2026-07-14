"use client";

import { useEffect, useState } from "react";

const LIENS = [
  { href: "#comment", label: "Comment ça marche", icone: "🚀" },
  { href: "#fonctions", label: "Fonctionnalités", icone: "✨" },
  { href: "#tarif", label: "Tarif", icone: "💳" },
  { href: "#sites-web", label: "Sites web sur mesure", icone: "🛠️" },
  { href: "#contact", label: "Contact", icone: "📞" },
];

// Bouton hamburger visible uniquement en mobile (à droite du bouton Connexion).
// Ouvre un panneau plein écran listant toutes les sections de la vitrine.
export function MenuMobile() {
  const [ouvert, setOuvert] = useState(false);

  // Empêche le scroll du body quand le menu est ouvert.
  useEffect(() => {
    if (ouvert) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [ouvert]);

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir le menu"
        onClick={() => setOuvert(true)}
        className="ml-1 flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 transition hover:border-bordeaux-300 hover:text-bordeaux-800 md:hidden"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {ouvert && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Fond flou cliquable pour fermer */}
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOuvert(false)}
            className="absolute inset-0 bg-stone-900/30 backdrop-blur-md"
          />

          {/* Panneau bordeaux plein qui glisse depuis la droite.
              inset-y-0 + h-dvh évite le bug h-full sur iOS Safari (barre d'URL
              dynamique qui réduit la hauteur du panneau). */}
          <div className="anim-slide-right absolute inset-y-0 right-0 flex h-dvh w-[85%] max-w-sm flex-col bg-bordeaux-800 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icon.png"
                  alt="Walletiz"
                  className="h-9 w-9 rounded-xl object-cover"
                />
                <span className="text-lg font-extrabold text-white">
                  Walletiz
                </span>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setOuvert(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {LIENS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOuvert(false)}
                  className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold text-white/90 transition hover:bg-white/10 hover:text-white active:bg-white/15"
                >
                  <span className="text-xl">{l.icone}</span>
                  <span>{l.label}</span>
                </a>
              ))}
            </nav>

            <div className="border-t border-white/15 p-4">
              <a
                href="https://calendly.com/walletiz-fr"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOuvert(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-bordeaux-800 shadow-lg transition hover:bg-stone-100"
              >
                📅 Prendre rendez-vous
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
