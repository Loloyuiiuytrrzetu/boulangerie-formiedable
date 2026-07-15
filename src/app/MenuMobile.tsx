"use client";

import { useEffect, useState } from "react";
import { useLangue, useTV } from "@/lib/langue";
import { LANGUES, type Langue } from "@/lib/i18n";

// Bouton hamburger visible uniquement en mobile (à droite du bouton Connexion).
// Ouvre un panneau plein écran listant toutes les sections de la vitrine.
// Contient aussi un sélecteur de langue en haut du panneau.
export function MenuMobile() {
  const t = useTV();
  const { langue, setLangue } = useLangue();
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

  const LIENS = [
    { href: "#comment", label: t("nav_comment"), icone: "🚀" },
    { href: "#fonctions", label: t("nav_fonctions"), icone: "✨" },
    { href: "#tarif", label: t("nav_tarif"), icone: "💳" },
    { href: "#sites-web", label: t("nav_sites_web"), icone: "🛠️" },
    { href: "#contact", label: t("nav_contact"), icone: "📞" },
  ];

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        onClick={() => setOuvert(true)}
        className="ml-1 flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 transition hover:border-bordeaux-300 hover:text-bordeaux-800 md:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {ouvert && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOuvert(false)}
            className="absolute inset-0 bg-stone-900/30 backdrop-blur-md"
          />

          <div className="anim-slide-right absolute inset-y-0 right-0 flex h-dvh w-[85%] max-w-sm flex-col bg-bordeaux-800 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon.png" alt="Walletiz" className="h-9 w-9 rounded-xl object-cover" />
                <span className="text-lg font-extrabold text-white">Walletiz</span>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOuvert(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            {/* Sélecteur de langue en haut du menu */}
            <div className="border-b border-white/15 px-5 py-3">
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/60">
                🌍 Language
              </label>
              <select
                value={langue}
                onChange={(e) => setLangue(e.target.value as Langue)}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:bg-white/20"
              >
                {LANGUES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-bordeaux-900 text-white">
                    {l.drapeau} {l.nom}
                  </option>
                ))}
              </select>
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
                📅 {t("nav_prendre_rdv_court")}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
