import Link from "next/link";

// Mise en page commune aux pages légales (mentions légales, CGV,
// confidentialité). En-tête sobre + retour à l'accueil, contenu lisible.
export function LegalLayout({
  titre,
  maj,
  children,
}: {
  titre: string;
  maj: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white text-stone-800">
      <header className="border-b border-stone-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="Walletiz" className="h-9 w-9 rounded-xl object-cover" />
            <span className="text-lg font-extrabold text-bordeaux-800">Walletiz</span>
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
          >
            ← Retour au site
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">{titre}</h1>
        <p className="mt-2 text-sm text-stone-400">Dernière mise à jour : {maj}</p>

        <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-stone-600 [&_a]:font-semibold [&_a]:text-bordeaux-700 [&_a]:underline [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-stone-900 [&_h3]:mt-6 [&_h3]:font-bold [&_h3]:text-stone-900 [&_strong]:text-stone-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
          {children}
        </div>

        <div className="mt-12 border-t border-stone-100 pt-6 text-sm text-stone-500">
          <Link href="/mentions-legales" className="hover:text-bordeaux-700">Mentions légales</Link>
          {" · "}
          <Link href="/cgv" className="hover:text-bordeaux-700">CGV</Link>
          {" · "}
          <Link href="/confidentialite" className="hover:text-bordeaux-700">Confidentialité</Link>
        </div>
      </article>
    </main>
  );
}

// Bloc « à compléter » mis en évidence, pour les infos que seul l'éditeur
// connaît (statut, SIRET, adresse…). À remplacer avant mise en production.
export function AComplter({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-900">
      {children}
    </span>
  );
}
