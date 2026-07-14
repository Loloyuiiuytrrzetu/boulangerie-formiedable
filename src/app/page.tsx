import Link from "next/link";
import { HeroTampons, GrapheAnime, MockupCartes, NotifsAnimees } from "./VitrineAnimations";

// Vitrine publique de Walletiz. Objectif : en 15 secondes, un visiteur
// qui ne connaît pas le produit comprend ce que ça fait et clique soit
// pour prendre rendez-vous, soit se connecter s'il a déjà un compte.

const EMAIL = "contact@walletiz.fr";
const TEL_AFFICHE = "+590 690 98 85 38";
const TEL_LIEN = "+590690988538";
const CALENDLY = "https://calendly.com/walletiz.fr";
const PRIX_SETUP = 120;
const PRIX_ABO = 64;

export default function Vitrine() {
  return (
    <main className="min-h-screen bg-white text-stone-800">
      {/* ==================== NAV ==================== */}
      <nav className="sticky top-0 z-40 border-b border-stone-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="Walletiz" className="h-9 w-9 rounded-xl object-cover" />
            <span className="text-lg font-extrabold text-bordeaux-800">Walletiz</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#comment" className="text-sm font-medium text-stone-600 hover:text-bordeaux-700">
              Comment ça marche
            </a>
            <a href="#fonctions" className="text-sm font-medium text-stone-600 hover:text-bordeaux-700">
              Fonctionnalités
            </a>
            <a href="#tarif" className="text-sm font-medium text-stone-600 hover:text-bordeaux-700">
              Tarif
            </a>
            <a href="#sites-web" className="text-sm font-medium text-stone-600 hover:text-bordeaux-700">
              Sites web
            </a>
            <a href="#contact" className="text-sm font-medium text-stone-600 hover:text-bordeaux-700">
              Contact
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg bg-bordeaux-50 px-4 py-2 text-sm font-semibold text-bordeaux-800 transition hover:bg-bordeaux-100 sm:inline-block"
            >
              📅 Prendre RDV
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

      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden">
        {/* Fond dégradé animé */}
        <div
          className="anim-gradient absolute inset-0 opacity-90"
          style={{
            background:
              "linear-gradient(135deg, #fdf2f4 0%, #ffffff 25%, #fbe3e7 60%, #ffffff 100%)",
          }}
        />
        {/* Grille en filigrane */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #7A1E2E 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          {/* Colonne texte */}
          <div className="anim-apparaitre">
            <span className="inline-flex items-center gap-2 rounded-full border border-bordeaux-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-bordeaux-800 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="anim-pulse absolute inline-flex h-full w-full rounded-full bg-bordeaux-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-bordeaux-600" />
              </span>
              Nouveau · Cartes de fidélité digitales
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Fidélisez vos clients{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-bordeaux-800 to-bordeaux-500 bg-clip-text text-transparent">
                  sans app
                </span>
                <span
                  className="absolute inset-x-0 bottom-1 z-0 h-3 rounded-sm bg-bordeaux-100/80"
                  aria-hidden="true"
                />
              </span>{" "}
              à télécharger.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-600 sm:text-xl">
              Vos clients scannent un QR code, obtiennent leurs tampons en
              temps réel, et reviennent. Zéro friction, zéro papier, zéro
              carte à imprimer.
            </p>
            <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
              <a
                href={CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                className="anim-glow group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-bordeaux-800 px-6 py-4 text-base font-bold text-white shadow-xl transition hover:bg-bordeaux-700 sm:w-auto"
              >
                📅 Prendre rendez-vous
                <span className="transition group-hover:translate-x-1">→</span>
              </a>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-stone-200 bg-white px-6 py-4 text-base font-semibold text-stone-700 transition hover:border-bordeaux-300 hover:text-bordeaux-700 sm:w-auto"
              >
                J&apos;ai déjà un compte
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-stone-500">
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <span>Sans installation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <span>iPhone & Android</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <span>Mise en place en moins de 72h</span>
              </div>
            </div>
          </div>

          {/* Colonne visuelle : cartes qui flottent + tampons temps réel */}
          <div className="relative h-[420px] sm:h-[500px] lg:h-[560px]">
            <HeroTampons />
          </div>
        </div>
      </section>

      {/* ==================== BANDEAU CHIFFRES ==================== */}
      <section className="border-y border-bordeaux-100 bg-bordeaux-50/40 py-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 text-center sm:grid-cols-4 sm:px-6">
          {[
            { chiffre: "10 s", label: "d'inscription client" },
            { chiffre: "0 €", label: "de matériel à acheter" },
            { chiffre: "7", label: "langues côté client" },
            { chiffre: "24/7", label: "notifications programmables" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold text-bordeaux-800 sm:text-3xl">
                {s.chiffre}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-stone-500 sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== COMMENT ÇA MARCHE ==================== */}
      <section id="comment" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">
              Simple comme bonjour
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-5xl">
              3 étapes, c&apos;est tout.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
              Vos clients n&apos;installent rien. Vous n&apos;imprimez plus
              rien. Tout se passe dans leur navigateur.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                num: "1",
                emoji: "📷",
                titre: "Ils scannent",
                desc: "Le client scanne le QR code affiché en caisse avec l'appareil photo de son téléphone. Aucune application requise.",
              },
              {
                num: "2",
                emoji: "✍️",
                titre: "Ils s'inscrivent",
                desc: "Numéro de téléphone + prénom. En 10 secondes ils ont leur carte de fidélité. Aucun mot de passe à retenir.",
              },
              {
                num: "3",
                emoji: "🎁",
                titre: "Ils reviennent",
                desc: "À chaque visite, un tampon. Carte pleine ? Ils choisissent leur récompense — pizza offerte, café gratuit, ce que vous voulez.",
              },
            ].map((e, i) => (
              <div
                key={e.num}
                className="relative rounded-3xl border border-stone-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-bordeaux-300 hover:shadow-lg"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-bordeaux-800 to-bordeaux-600 text-2xl shadow-lg">
                  {e.emoji}
                </div>
                <div className="absolute right-6 top-6 text-6xl font-black text-bordeaux-100">
                  {e.num}
                </div>
                <h3 className="mt-5 text-xl font-bold text-stone-900">{e.titre}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {e.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TEMPS RÉEL : CARTE QUI SE REMPLIT ==================== */}
      <section className="bg-stone-50/60 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">
              En direct
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              Les tampons apparaissent{" "}
              <span className="text-bordeaux-800">en temps réel</span> sur le
              téléphone du client.
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Le client voit sa carte se remplir sous ses yeux. Une petite
              animation à chaque tampon lui rappelle qu&apos;il est bientôt
              récompensé — un vrai moteur pour revenir.
            </p>
            <ul className="mt-8 space-y-3 text-stone-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-bordeaux-700">✓</span>
                <span>
                  <strong>Anti-triche</strong> : 1 tampon max par jour, reset à
                  minuit heure locale de votre commerce.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-bordeaux-700">✓</span>
                <span>
                  <strong>Formes personnalisables</strong> : carré, cercle,
                  hexagone, étoile. Vos couleurs, votre logo.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-bordeaux-700">✓</span>
                <span>
                  <strong>Animation de récompense</strong> : étoiles, rayons,
                  ondes… un petit wow à chaque carte pleine.
                </span>
              </li>
            </ul>
          </div>
          <div className="flex items-center justify-center">
            <MockupCartes />
          </div>
        </div>
      </section>

      {/* ==================== DASHBOARD : STATS TEMPS RÉEL ==================== */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div className="order-2 flex items-center justify-center lg:order-1">
            <GrapheAnime />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">
              Tableau de bord
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              Suivez votre fidélité{" "}
              <span className="text-bordeaux-800">au jour près</span>.
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Graphiques semaine et année. Compteur "tampons distribués
              aujourd&apos;hui" qui repart à zéro à minuit local. Rien
              n&apos;est approximatif — les chiffres sont exacts, toujours.
            </p>
            <ul className="mt-8 space-y-3 text-stone-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-bordeaux-700">✓</span>
                <span>
                  <strong>Historique complet</strong> : naviguez entre les
                  années, retrouvez la saison qui a le mieux marché.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-bordeaux-700">✓</span>
                <span>
                  <strong>Fuseau horaire</strong> : que vous soyez à Paris,
                  Guadeloupe ou New York, tout est calculé sur votre heure
                  locale.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-bordeaux-700">✓</span>
                <span>
                  <strong>Aucune fausse donnée</strong> : chaque tampon est
                  enregistré au moment exact où il est attribué.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==================== NOTIFICATIONS PUSH ==================== */}
      <section className="border-y border-bordeaux-100 bg-gradient-to-br from-bordeaux-50 via-white to-bordeaux-50/40 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">
              Marketing intégré
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              Envoyez une promo{" "}
              <span className="text-bordeaux-800">
                directement sur leur écran
              </span>
              .
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Une baisse de fréquentation le mardi ? Un plat du jour qui doit
              partir ? Un message, un clic, et vos clients reçoivent une vraie
              notification push sur leur téléphone.
            </p>
            <ul className="mt-8 space-y-3 text-stone-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-bordeaux-700">✓</span>
                <span>
                  <strong>Envoi immédiat</strong> ou <strong>programmé</strong>{" "}
                  à l&apos;heure locale de votre commerce.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-bordeaux-700">✓</span>
                <span>
                  <strong>Votre logo</strong> apparaît sur la notification.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-bordeaux-700">📱</span>
                <span>
                  <strong>Sur iPhone</strong>, pour recevoir les notifications
                  push, le client doit ajouter votre page à son écran
                  d&apos;accueil en 3 étapes :
                  <ol className="mt-2 ml-1 list-decimal space-y-1 pl-4 text-sm text-stone-600">
                    <li>
                      Ouvrir votre page dans <strong>Safari</strong> ou{" "}
                      <strong>Chrome</strong> et appuyer sur le bouton{" "}
                      <strong>Partager</strong>.
                    </li>
                    <li>
                      Cliquer sur <strong>« En voir plus »</strong>.
                    </li>
                    <li>
                      Faire défiler et cliquer sur{" "}
                      <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>.
                    </li>
                  </ol>
                  <span className="mt-2 block text-xs text-stone-500">
                    Une fois l&apos;icône ajoutée, il ouvre l&apos;app depuis son
                    écran d&apos;accueil et accepte les notifications — c&apos;est
                    tout. On lui affiche automatiquement ces instructions à sa
                    première visite.
                  </span>
                </span>
              </li>
            </ul>
          </div>
          <div className="flex items-center justify-center">
            <NotifsAnimees />
          </div>
        </div>
      </section>

      {/* ==================== FONCTIONNALITÉS ==================== */}
      <section id="fonctions" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">
              Toutes les fonctionnalités
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-5xl">
              Une vraie boîte à outils
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
              Pensée pour les petits commerces qui n&apos;ont ni le temps ni le
              budget d&apos;un système compliqué.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icone: "🎨", titre: "Aux couleurs de votre commerce", desc: "Logo, image de fond, 24 couleurs au choix. Une page 100% à l'image de votre marque." },
              { icone: "🃏", titre: "Plusieurs cartes par commerce", desc: "Carte café, carte midi, carte week-end… Créez toutes les cartes que vous voulez, avec leurs règles propres." },
              { icone: "🎁", titre: "Récompenses au choix", desc: "Le client choisit sa récompense parmi celles que vous proposez. Avec photos pour donner envie." },
              { icone: "🔔", titre: "Notifications push", desc: "Envoyez une promo qui apparaît sur l'écran de vos clients. Programmable à l'heure locale." },
              { icone: "📊", titre: "Statistiques exactes", desc: "Graphiques semaine et année. Compteurs au jour près selon votre fuseau horaire." },
              { icone: "🛡️", titre: "Système manuel activable", desc: "Seul vous ou votre employé peut donner les tampons via votre scanner. Adieu les photos du QR partagées." },
              { icone: "👥", titre: "Sous-compte employé", desc: "Donnez un accès limité : uniquement le scanner, pas le reste du dashboard." },
              { icone: "🌍", titre: "7 langues côté client", desc: "Français, anglais, espagnol, allemand, chinois, arabe, russe. Chaque client choisit la sienne." },
              { icone: "📱", titre: "Installable comme une app", desc: "Vos clients peuvent ajouter votre page à leur écran d'accueil. Une vraie app, sans passer par le store." },
            ].map((f) => (
              <div
                key={f.titre}
                className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-bordeaux-300 hover:shadow-lg"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-bordeaux-50 text-2xl transition group-hover:scale-110 group-hover:bg-bordeaux-100">
                  {f.icone}
                </div>
                <h3 className="text-base font-bold text-stone-900">{f.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== POUR QUI ==================== */}
      <section className="relative overflow-hidden bg-bordeaux-950 py-20 text-white sm:py-24">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-5xl">
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
              "💈 Barbiers",
              "🥗 Traiteurs",
              "🧋 Bubble tea",
              "🍜 Ramen",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium backdrop-blur"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TARIF ==================== */}
      <section id="tarif" className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">
              Tarif transparent
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-5xl">
              Un seul plan, tout inclus.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
              Pas de coût caché, pas d&apos;options à cocher, pas de commission
              sur vos ventes. Un tarif clair, aussi simple que le reste.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-xl">
            <div
              className="anim-glow relative overflow-hidden rounded-3xl border-2 border-bordeaux-200 bg-white p-8 shadow-2xl sm:p-10"
            >
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-bordeaux-100 opacity-40 blur-2xl" />
              <div className="flex items-center gap-3">
                <span className="inline-block rounded-full bg-bordeaux-800 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white">
                  Plan Pro
                </span>
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-green-800">
                  7 jours gratuits
                </span>
              </div>
              <div className="mt-6">
                <p className="text-sm text-stone-500">Frais de mise en place</p>
                <p className="text-4xl font-black text-bordeaux-800 sm:text-5xl">
                  {PRIX_SETUP}€{" "}
                  <span className="text-lg font-medium text-stone-500">
                    une fois
                  </span>
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  Programmation, configuration, création de votre commerce.
                </p>
              </div>
              <div className="mt-6 rounded-2xl bg-bordeaux-50 p-5">
                <p className="text-sm text-stone-600">
                  Puis, après vos 7 jours d&apos;essai
                </p>
                <p className="text-4xl font-black text-bordeaux-800 sm:text-5xl">
                  {PRIX_ABO}€{" "}
                  <span className="text-lg font-medium text-stone-500">/ mois</span>
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Sans engagement. Annulez en 1 clic depuis votre dashboard —
                  aucun prélèvement si vous annulez avant la fin de la semaine
                  d&apos;essai.
                </p>
              </div>

              <ul className="mt-6 space-y-2.5 text-sm text-stone-700">
                {[
                  "Cartes de fidélité illimitées",
                  "Clients inscrits illimités",
                  "Notifications push illimitées",
                  "Sous-compte employé inclus",
                  "Statistiques temps réel",
                  "7 langues côté client",
                  "Système manuel anti-fraude",
                  "Support par email et téléphone",
                  "Mises à jour et améliorations offertes",
                ].map((a) => (
                  <li key={a} className="flex items-start gap-2">
                    <span className="mt-0.5 text-bordeaux-700">✓</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>

              <a
                href={CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-bordeaux-800 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-bordeaux-700"
              >
                📅 Réserver un rendez-vous
                <span>→</span>
              </a>
              <p className="mt-3 text-center text-xs text-stone-400">
                On vous appelle, on vous montre, vous décidez.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SITES WEB SUR MESURE ==================== */}
      <section
        id="sites-web"
        className="relative overflow-hidden border-y border-bordeaux-100 bg-gradient-to-br from-bordeaux-50/60 via-white to-white py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-bordeaux-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-bordeaux-800 shadow-sm">
              🛠️ Nouveau service
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-stone-900 sm:text-5xl">
              Création de site web{" "}
              <span className="bg-gradient-to-r from-bordeaux-800 to-bordeaux-500 bg-clip-text text-transparent">
                sur mesure
              </span>
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Vous voulez plus qu&apos;une carte de fidélité ? On code aussi
              votre site vitrine, votre boutique en ligne, votre système de
              réservation. <strong>On s&apos;adapte à votre demande</strong> :
              vous nous dites ce dont vous avez besoin, on fait le reste.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icone: "🏪",
                titre: "Site vitrine",
                desc: "Une page ou plusieurs, pour présenter votre commerce, votre carte, vos horaires. Rapide, léger, mobile-first.",
              },
              {
                icone: "🛒",
                titre: "Boutique en ligne",
                desc: "Vendez en ligne : commande à emporter, livraison, click & collect, paiement en ligne. On intègre Stripe pour vous.",
              },
              {
                icone: "📅",
                titre: "Réservation de table",
                desc: "Vos clients réservent en ligne, vous validez depuis votre téléphone. Sans commission par couvert.",
              },
              {
                icone: "🎨",
                titre: "Refonte de site",
                desc: "Vous avez déjà un site vieillissant ? On le refait, moderne, rapide, aux couleurs de votre marque.",
              },
              {
                icone: "📱",
                titre: "App web installable",
                desc: "Votre site s'installe sur l'écran d'accueil de vos clients comme une vraie appli — sans passer par l'App Store.",
              },
              {
                icone: "🔗",
                titre: "Intégration Walletiz",
                desc: "Votre nouveau site et vos cartes de fidélité communiquent : un seul écosystème, une seule expérience.",
              },
            ].map((f) => (
              <div
                key={f.titre}
                className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-bordeaux-300 hover:shadow-lg"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-bordeaux-50 text-2xl transition group-hover:scale-110 group-hover:bg-bordeaux-100">
                  {f.icone}
                </div>
                <h3 className="text-base font-bold text-stone-900">{f.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-2xl rounded-3xl border-2 border-bordeaux-200 bg-white p-8 text-center shadow-xl sm:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">
              Devis gratuit, sans engagement
            </p>
            <h3 className="mt-3 text-2xl font-extrabold text-stone-900 sm:text-3xl">
              Chaque projet est différent.
            </h3>
            <p className="mt-3 text-stone-600">
              Le tarif dépend de ce que vous voulez faire. On discute d&apos;abord
              de votre besoin, puis on vous propose un devis clair, tout compris.
              Vous n&apos;engagez rien tant que vous n&apos;avez pas signé.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-bordeaux-800 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-bordeaux-700 sm:w-auto"
              >
                📅 Prendre rendez-vous
                <span>→</span>
              </a>
              <a
                href={`mailto:${EMAIL}?subject=Demande%20de%20site%20web%20sur%20mesure`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-stone-200 bg-white px-6 py-4 text-base font-semibold text-stone-700 transition hover:border-bordeaux-300 hover:text-bordeaux-700 sm:w-auto"
              >
                ✉️ Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CONTACT ==================== */}
      <section
        id="contact"
        className="relative overflow-hidden border-t border-stone-100 bg-gradient-to-br from-white via-bordeaux-50/30 to-white py-20 sm:py-28"
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">
            Parlons-en
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-5xl">
            3 façons de nous joindre.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
            On répond vite. Vraiment.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border-2 border-stone-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-bordeaux-400 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bordeaux-100 text-2xl">
                📅
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-stone-500">
                Rendez-vous
              </p>
              <p className="mt-1 font-bold text-stone-900">
                Réservez un créneau
              </p>
              <p className="mt-2 text-sm text-stone-600">
                On vous appelle à l&apos;heure choisie pour une démo.
              </p>
              <p className="mt-3 text-sm font-semibold text-bordeaux-700 group-hover:underline">
                calendly.com/walletiz.fr →
              </p>
            </a>

            <a
              href={`mailto:${EMAIL}`}
              className="group rounded-2xl border-2 border-stone-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-bordeaux-400 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bordeaux-100 text-2xl">
                ✉️
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-stone-500">
                Email
              </p>
              <p className="mt-1 font-bold text-stone-900">Écrivez-nous</p>
              <p className="mt-2 text-sm text-stone-600">
                Une question, un devis, une info : on répond dans la journée.
              </p>
              <p className="mt-3 text-sm font-semibold text-bordeaux-700 group-hover:underline">
                {EMAIL} →
              </p>
            </a>

            <a
              href={`tel:${TEL_LIEN}`}
              className="group rounded-2xl border-2 border-stone-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-bordeaux-400 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bordeaux-100 text-2xl">
                📞
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-stone-500">
                Téléphone
              </p>
              <p className="mt-1 font-bold text-stone-900">Appelez-nous</p>
              <p className="mt-2 text-sm text-stone-600">
                Du lundi au samedi, réponse rapide.
              </p>
              <p className="mt-3 text-sm font-semibold text-bordeaux-700 group-hover:underline">
                {TEL_AFFICHE} →
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-stone-200 bg-stone-50 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="h-7 w-7 rounded-md object-cover" />
            <span className="text-sm text-stone-600">
              © {new Date().getFullYear()} <strong className="text-bordeaux-800">Walletiz</strong> —
              Cartes de fidélité digitales
            </span>
          </div>
          <div className="flex items-center gap-5 text-sm text-stone-500">
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="hover:text-bordeaux-700">
              Rendez-vous
            </a>
            <a href={`mailto:${EMAIL}`} className="hover:text-bordeaux-700">
              Email
            </a>
            <a href={`tel:${TEL_LIEN}`} className="hover:text-bordeaux-700">
              Téléphone
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
