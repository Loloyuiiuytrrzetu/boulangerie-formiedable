"use client";

import { useTransition } from "react";
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
      {/* Mobile / tablette : en-tête blanc + pilules coulissantes */}
      <div className="border-b border-stone-200 bg-white lg:hidden">
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
          <div className="flex items-center gap-2">
            <select
              value={langue}
              onChange={(e) => changer(e.target.value as Langue)}
              disabled={enCoursLangue}
              className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs font-semibold text-stone-700 disabled:opacity-60"
              aria-label={t("changer_langue")}
            >
              {LANGUES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.drapeau}
                </option>
              ))}
            </select>
            <form action={deconnexion}>
              <button className="text-xs font-medium text-stone-500 hover:text-bordeaux-700">
                {t("se_deconnecter")}
              </button>
            </form>
          </div>
        </div>
        <nav className="overflow-x-auto px-4 pb-3">
          <div className="flex gap-2">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:border-bordeaux-300 hover:text-bordeaux-800"
              >
                <span>{item.icone}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </nav>
      </div>

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
