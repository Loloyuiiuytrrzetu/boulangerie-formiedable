"use client";

import { deconnexion } from "./actions";

// Barre latérale bordeaux pleine hauteur (desktop) / barre horizontale (mobile)
export function NavigationSidebar({ userEmail }: { userEmail: string }) {
  const items = [
    { href: "#graphiques", label: "Graphiques", icone: "📊" },
    { href: "#commerce", label: "Mon commerce", icone: "🏪" },
    { href: "#cartes", label: "Cartes de fidélité", icone: "💳" },
    { href: "#sections-page", label: "Sections de ma page", icone: "🗂️" },
    { href: "#souscompte", label: "Sous-compte", icone: "👥" },
    { href: "#notifications", label: "Notifications push", icone: "🔔" },
    { href: "#abonnement", label: "Mon abonnement", icone: "💳" },
    { href: "#qr-code", label: "QR code", icone: "📱" },
  ];

  return (
    <>
      {/* Mobile / tablette : en-tête blanc + pilules coulissantes */}
      <div className="border-b border-stone-200 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="Walletiz"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="font-bold text-bordeaux-800">Walletiz</span>
          </div>
          <form action={deconnexion}>
            <button className="text-xs font-medium text-stone-500 hover:text-bordeaux-700">
              Se déconnecter
            </button>
          </form>
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

      {/* Desktop : sidebar bordeaux pleine hauteur, fixée à gauche, sans démarcation */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:bg-bordeaux-800 lg:text-white">
        {/* En-tête logo */}
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

        {/* Liens de navigation — pas de démarcation entre les items */}
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

        {/* Bas : email + déconnexion */}
        <div className="p-4">
          <p className="text-xs uppercase tracking-wider text-white/50">
            Connecté
          </p>
          <p className="mt-1 truncate text-sm font-semibold">{userEmail}</p>
          <form action={deconnexion} className="mt-3">
            <button className="w-full rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/25">
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
