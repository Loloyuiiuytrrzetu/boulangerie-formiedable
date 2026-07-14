import Link from "next/link";

// Vitrine publique de Walletiz — la page d'accueil que voient les gens
// qui arrivent sur walletiz.fr avant de se connecter. Explique en 30 s
// à qui c'est destiné et pousse au clic "Connexion" (pour restaurateurs
// existants) ou au contact (pour prospects).
export default function Vitrine() {
  return (
    <main className="min-h-screen bg-white text-stone-800">
      {/* --- Navigation --- */}
      <nav className="sticky top-0 z-40 border-b border-stone-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="Walletiz"
              className="h-9 w-9 rounded-xl object-cover"
            />
            <span className="text-lg font-extrabold text-bordeaux-800">
              Walletiz
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#contact"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:text-bordeaux-700 sm:inline-block"
            >
              Nous contacter
            </a>
            <Link
              href="/login"
              className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-bordeaux-700"
            >
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero --- */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #7A1E2E 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-bordeaux-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-bordeaux-800">
              Cartes de fidélité digitales
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-6xl">
              Fidélisez vos clients{" "}
              <span className="text-bordeaux-800">sans app à télécharger</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600 sm:text-xl">
              Vos clients scannent un QR code, obtiennent leurs tampons, et
              reviennent. Zéro friction, zéro papier, zéro carte à imprimer.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#contact"
                className="w-full rounded-xl bg-bordeaux-800 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-bordeaux-700 sm:w-auto"
              >
                Rejoindre Walletiz
              </a>
              <Link
                href="/login"
                className="w-full rounded-xl border border-stone-300 bg-white px-6 py-3.5 text-base font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 sm:w-auto"
              >
                J&apos;ai déjà un compte
              </Link>
            </div>
            <p className="mt-6 text-xs text-stone-400">
              Aucune installation. Aucun matériel. Compatible iPhone & Android.
            </p>
          </div>
        </div>
      </section>

      {/* --- Comment ça marche --- */}
      <section className="border-t border-stone-100 bg-stone-50/70 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">
              3 étapes, c&apos;est tout.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-stone-600">
              Vos clients n&apos;installent rien. Vous n&apos;imprimez plus
              rien. Tout se passe dans le navigateur.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                num: "1",
                titre: "Ils scannent",
                desc: "Le client scanne le QR code affiché en caisse avec l'appareil photo de son téléphone.",
              },
              {
                num: "2",
                titre: "Ils s'inscrivent",
                desc: "Numéro de téléphone + nom, en 10 secondes. Aucun mot de passe à retenir, aucune app à installer.",
              },
              {
                num: "3",
                titre: "Ils reviennent",
                desc: "À chaque visite, un tampon. Une fois la carte pleine, ils choisissent leur récompense.",
              },
            ].map((e) => (
              <div
                key={e.num}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bordeaux-800 text-lg font-bold text-white">
                  {e.num}
                </div>
                <h3 className="mt-4 text-lg font-bold text-stone-900">
                  {e.titre}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {e.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Fonctionnalités --- */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">
              Une vraie boîte à outils pour fidéliser
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-stone-600">
              Pensée pour les petits commerces qui n&apos;ont pas le temps de
              gérer un système compliqué.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icone: "🎨",
                titre: "Aux couleurs de votre commerce",
                desc: "Logo, image de fond, couleur principale — 24 teintes au choix. Vos clients voient votre marque.",
              },
              {
                icone: "🃏",
                titre: "Plusieurs cartes par commerce",
                desc: "Carte café, carte midi, carte week-end… Créez toutes les cartes que vous voulez, avec leurs propres règles.",
              },
              {
                icone: "🎁",
                titre: "Récompenses au choix",
                desc: "Le client choisit sa récompense parmi celles que vous proposez. Avec photos pour lui donner envie.",
              },
              {
                icone: "🔔",
                titre: "Notifications push",
                desc: "Envoyez une promo ou une info directement sur l'écran de vos clients. Programmables à l'heure locale.",
              },
              {
                icone: "📊",
                titre: "Statistiques exactes",
                desc: "Graphiques semaine et année. Compteurs par jour selon votre fuseau horaire. Rien n'est approximatif.",
              },
              {
                icone: "🛡️",
                titre: "Anti-fraude activable",
                desc: "En 1 clic, seul vous (ou votre employé) peut attribuer les tampons via votre scanner. Adieu les photos du QR.",
              },
              {
                icone: "👥",
                titre: "Sous-compte employé",
                desc: "Donnez un accès limité à votre équipe : uniquement le scanner, pas le reste du dashboard.",
              },
              {
                icone: "🌍",
                titre: "7 langues côté client",
                desc: "Français, anglais, espagnol, allemand, chinois, arabe, russe. Chaque client choisit la sienne.",
              },
              {
                icone: "📱",
                titre: "Installable comme une app",
                desc: "Vos clients peuvent ajouter votre page à leur écran d'accueil. Une vraie app, sans passer par le store.",
              },
            ].map((f) => (
              <div
                key={f.titre}
                className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-bordeaux-200 hover:shadow-md"
              >
                <div className="text-3xl">{f.icone}</div>
                <h3 className="mt-3 text-base font-bold text-stone-900">
                  {f.titre}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Pour qui --- */}
      <section className="border-t border-stone-100 bg-bordeaux-800 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Pour tous les commerces qui vivent des habitués.
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {[
                "☕ Cafés",
                "🥐 Boulangeries",
                "🍔 Fast-food",
                "🍕 Pizzérias",
                "🍣 Restaurants",
                "🍦 Glaciers",
                "🍺 Bars",
                "🍰 Pâtisseries",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium backdrop-blur"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA / Contact --- */}
      <section
        id="contact"
        className="border-t border-stone-100 py-16 sm:py-24"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">
            Prêt à fidéliser sans papier ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone-600">
            Contactez-nous, on met en place votre commerce sur Walletiz en
            quelques minutes. Vous êtes prêt à accueillir vos premiers clients
            fidèles le jour même.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:contact@walletiz.fr"
              className="w-full rounded-xl bg-bordeaux-800 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-bordeaux-700 sm:w-auto"
            >
              📧 contact@walletiz.fr
            </a>
            <Link
              href="/login"
              className="w-full rounded-xl border border-stone-300 bg-white px-6 py-3.5 text-base font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 sm:w-auto"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-stone-100 bg-stone-50 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-stone-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt=""
              className="h-6 w-6 rounded-md object-cover"
            />
            <span>© {new Date().getFullYear()} Walletiz</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="mailto:contact@walletiz.fr"
              className="hover:text-bordeaux-700"
            >
              Contact
            </a>
            <Link href="/login" className="hover:text-bordeaux-700">
              Connexion
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
