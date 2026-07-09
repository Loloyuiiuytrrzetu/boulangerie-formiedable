// Barre de navigation latérale du dashboard restaurateur.
// - Desktop (lg+) : colonne verticale sticky à gauche
// - Mobile / tablette : ligne coulissante horizontale en haut du contenu
export function NavigationSidebar() {
  const items = [
    { href: "#graphiques", label: "Graphiques", icone: "📊" },
    { href: "#commerce", label: "Mon commerce", icone: "🏪" },
    { href: "#cartes", label: "Cartes de fidélité", icone: "💳" },
    { href: "#sections-page", label: "Sections de ma page", icone: "🗂️" },
    { href: "#souscompte", label: "Sous-compte", icone: "👥" },
    { href: "#qr-code", label: "QR code", icone: "📱" },
  ];

  return (
    <>
      {/* Mobile / tablette : barre coulissante horizontale */}
      <nav className="mb-6 -mx-4 overflow-x-auto px-4 pb-1 lg:hidden">
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

      {/* Desktop : colonne verticale sticky à gauche */}
      <aside className="hidden lg:sticky lg:top-4 lg:block lg:h-fit">
        <nav className="rounded-2xl border border-stone-200 bg-white p-3">
          <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-stone-400">
            Navigation
          </p>
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-bordeaux-50 hover:text-bordeaux-800"
                >
                  <span className="text-base">{item.icone}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
