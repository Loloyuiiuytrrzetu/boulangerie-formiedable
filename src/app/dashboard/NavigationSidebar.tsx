"use client";

import { useEffect, useState, useTransition } from "react";
import { deconnexion, changerLangue } from "./actions";
import { useLangueDashboard, useTDash } from "@/lib/langue-dashboard";
import { LANGUES, type Langue } from "@/lib/i18n";

// Barre latérale bordeaux pleine hauteur (desktop) / barre horizontale (mobile)
// Le provider de langue est monté par le parent (dashboard/page.tsx) — ce
// composant se contente d'utiliser le contexte via useLangueDashboard.
// (langueInitiale est encore reçu pour rétrocompatibilité mais non utilisé.)
export function NavigationSidebar({
  userEmail,
}: {
  userEmail: string;
  langueInitiale?: Langue;
}) {
  const t = useTDash();
  const { langue, setLangue } = useLangueDashboard();
  const [enCoursLangue, startLangue] = useTransition();
  const [menuOuvert, setMenuOuvert] = useState(false);

  // Empêche le scroll de la page quand le menu burger est ouvert.
  useEffect(() => {
    if (menuOuvert) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [menuOuvert]);

  function changer(l: Langue) {
    setLangue(l); // instantané côté navigateur
    startLangue(async () => {
      await changerLangue(l); // persistance en base
    });
  }

  const items = [
    { href: "#graphiques", label: t("graphiques"), icone: "📊" },
    { href: "#commerce", label: t("mon_commerce"), icone: "🏪" },
    { href: "#cartes", label: t("cartes_de_fidelite"), icone: "💳" },
    { href: "#sections-page", label: t("sections_de_ma_page"), icone: "🗂️" },
    { href: "#souscompte", label: t("sous_compte"), icone: "👥" },
    { href: "#notifications", label: t("notifications_push"), icone: "🔔" },
    { href: "#abonnement", label: t("mon_abonnement"), icone: "💳" },
    { href: "#qr-code", label: t("qr_code"), icone: "📱" },
  ];

  return (
    <>
      {/* Mobile / tablette : barre FIXE (sticky) qui reste visible au
          défilement, avec logo + menu burger — comme la page vitrine. */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/85 lg:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="Walletiz"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="font-bold text-bordeaux-800">Walletiz</span>
          </div>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOuvert(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 transition hover:border-bordeaux-300 hover:text-bordeaux-800"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        </div>
      </header>

      {/* Panneau burger plein écran (mobile) : tous les onglets + langue +
          déconnexion. Fermé au clic sur un onglet ou sur le fond. */}
      {menuOuvert && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setMenuOuvert(false)}
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
                aria-label="Fermer"
                onClick={() => setMenuOuvert(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            {/* Sélecteur de langue en haut du panneau */}
            <div className="border-b border-white/15 px-5 py-3">
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-white/60">
                🌍 {t("langue_dashboard")}
              </label>
              <select
                value={langue}
                onChange={(e) => changer(e.target.value as Langue)}
                disabled={enCoursLangue}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:bg-white/20 disabled:opacity-60"
              >
                {LANGUES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-bordeaux-900 text-white">
                    {l.drapeau} {l.nom}
                  </option>
                ))}
              </select>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOuvert(false)}
                  className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold text-white/90 transition hover:bg-white/10 hover:text-white active:bg-white/15"
                >
                  <span className="text-xl">{item.icone}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>

            <div className="border-t border-white/15 p-4">
              <p className="text-xs uppercase tracking-wider text-white/50">
                {t("connecte")}
              </p>
              <p className="mt-1 truncate text-sm font-semibold">{userEmail}</p>
              <form action={deconnexion} className="mt-3">
                <button className="w-full rounded-xl bg-white/15 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/25">
                  {t("se_deconnecter")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Desktop : sidebar bordeaux pleine hauteur, fixée à gauche */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:bg-bordeaux-800 lg:text-white">
        <div className="flex items-center gap-3 px-6 py-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="Walletiz"
            className="h-10 w-10 rounded-xl object-cover"
          />
          <div>
            <p className="text-lg font-extrabold">Walletiz</p>
            <p className="text-xs uppercase tracking-widest opacity-60">Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <span className="text-base">{item.icone}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="p-4">
          <p className="text-xs uppercase tracking-wider text-white/50">
            {t("connecte")}
          </p>
          <p className="mt-1 truncate text-sm font-semibold">{userEmail}</p>

          {/* Sélecteur de langue — la valeur est enregistrée en base
              immédiatement quand elle change. */}
          <div className="mt-3">
            <label className="mb-1 block text-xs uppercase tracking-wider text-white/50">
              {t("langue_dashboard")}
            </label>
            <select
              value={langue}
              onChange={(e) => changer(e.target.value as Langue)}
              disabled={enCoursLangue}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:bg-white/20 disabled:opacity-60"
            >
              {LANGUES.map((l) => (
                <option
                  key={l.code}
                  value={l.code}
                  className="bg-bordeaux-900 text-white"
                >
                  {l.drapeau} {l.nom}
                </option>
              ))}
            </select>
          </div>

          <form action={deconnexion} className="mt-3">
            <button className="w-full rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/25">
              {t("se_deconnecter")}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
