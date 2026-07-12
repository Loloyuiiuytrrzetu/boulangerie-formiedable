"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  ajouterTampon,
  choisirRecompense,
  utiliserRecompense,
} from "./actions";
import { AnimationRecompense } from "./Animation";
import { AbonnementPush } from "./AbonnementPush";
import { iconeEmoji } from "@/lib/icons";
import type { RecompenseGagnee, Section } from "@/lib/types";

export type CarteAffichee = {
  id: string;
  titre: string;
  tampon_icone: string;
  tampon_image_url: string | null;
  tampon_forme: "carre" | "cercle" | "hexagone" | "etoile";
  nombre_tampons_requis: number;
  texte_bas: string | null;
  date_expiration: string | null;
  expiree: boolean;
  tampons_actuels: number;
  recompenses_reclamees: number;
  tampon_pris_aujourdhui: boolean;
};

export type RecompenseAffichee = {
  id: string;
  carte_id: string;
  texte: string;
  image_url: string | null;
};

// --- Rendu d'un tampon selon la forme choisie ---
// Utilise un SVG pour toutes les formes : cohérent (bord dashed possible
// pour chaque forme quand la case est vide) et pas de bug de clip-path.
function TamponCase({
  forme,
  rempli,
  couleur,
  image,
  emoji,
}: {
  forme: "carre" | "cercle" | "hexagone" | "etoile";
  rempli: boolean;
  couleur: string;
  image: string | null;
  emoji: string;
}) {
  const fill = rempli
    ? image
      ? "#ffffff"
      : couleur
    : "transparent";
  const stroke = rempli ? couleur : "#e7e5e4";
  const dashed = !rempli;
  const strokeProps = dashed ? { strokeDasharray: "5 4" } : {};

  // clipPath partagé par l'image pour qu'elle épouse la forme choisie.
  // Chaque case a son propre id (aléatoire) pour éviter les collisions.
  const clipId = React.useId();

  return (
    <div className="relative aspect-square">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id={clipId}>
            {forme === "carre" && (
              <rect x="5" y="5" width="90" height="90" rx="18" />
            )}
            {forme === "cercle" && <circle cx="50" cy="50" r="45" />}
            {forme === "hexagone" && (
              <polygon points="50,5 90,27 90,73 50,95 10,73 10,27" />
            )}
            {forme === "etoile" && (
              <polygon points="50,5 61,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 39,38" />
            )}
          </clipPath>
        </defs>
        {forme === "carre" && (
          <rect
            x="5"
            y="5"
            width="90"
            height="90"
            rx="18"
            fill={fill}
            stroke={stroke}
            strokeWidth="5"
            {...strokeProps}
          />
        )}
        {forme === "cercle" && (
          <circle
            cx="50"
            cy="50"
            r="45"
            fill={fill}
            stroke={stroke}
            strokeWidth="5"
            {...strokeProps}
          />
        )}
        {forme === "hexagone" && (
          <polygon
            points="50,5 90,27 90,73 50,95 10,73 10,27"
            fill={fill}
            stroke={stroke}
            strokeWidth="5"
            {...strokeProps}
          />
        )}
        {forme === "etoile" && (
          <polygon
            points="50,5 61,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 39,38"
            fill={fill}
            stroke={stroke}
            strokeWidth="5"
            {...strokeProps}
          />
        )}
        {image && (
          <image
            href={image}
            x="10"
            y="10"
            width="80"
            height="80"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
            opacity={rempli ? 1 : 0.25}
            style={rempli ? undefined : { filter: "grayscale(1)" }}
          />
        )}
      </svg>
      {!image && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl ${rempli ? "" : "opacity-20 grayscale"}`}>
            {emoji}
          </span>
        </div>
      )}
    </div>
  );
}

// --- Petit carrousel de récompenses (utilisé pour 1 ou plusieurs) ---
function CarrouselRecompenses({
  recompenses,
  couleur,
}: {
  recompenses: RecompenseAffichee[];
  couleur: string;
}) {
  // Une seule récompense : grande carte centrée
  if (recompenses.length === 1) {
    const r = recompenses[0];
    return (
      <div className="mt-5">
        <p
          className="mb-2 rounded-2xl px-4 py-2 text-center text-sm font-medium"
          style={{ backgroundColor: `${couleur}14`, color: couleur }}
        >
          🎁 Votre récompense
        </p>
        <div className="mx-auto max-w-xs overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {r.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.image_url}
              alt={r.texte}
              className="h-40 w-full object-cover sm:h-48"
            />
          ) : (
            <div
              className="flex h-40 w-full items-center justify-center text-5xl sm:h-48"
              style={{ backgroundColor: `${couleur}14` }}
            >
              🎁
            </div>
          )}
          <p className="p-3 text-center text-sm font-bold text-stone-900">{r.texte}</p>
        </div>
      </div>
    );
  }

  // Plusieurs récompenses : carrousel horizontal (choix)
  return (
    <div className="mt-5">
      <p
        className="mb-2 rounded-2xl px-4 py-2 text-center text-sm font-medium"
        style={{ backgroundColor: `${couleur}14`, color: couleur }}
      >
        🎁 Au choix parmi {recompenses.length} récompenses
      </p>
      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-2">
        {recompenses.map((r) => (
          <div
            key={r.id}
            className="w-40 shrink-0 snap-start overflow-hidden rounded-2xl border border-stone-200 bg-white sm:w-44"
          >
            {r.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.image_url} alt={r.texte} className="h-24 w-full object-cover" />
            ) : (
              <div
                className="flex h-24 w-full items-center justify-center text-3xl"
                style={{ backgroundColor: `${couleur}14` }}
              >
                🎁
              </div>
            )}
            <p className="p-2 text-center text-xs font-semibold text-stone-900">
              {r.texte}
            </p>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-stone-400">
        ← Glissez pour voir toutes les récompenses →
      </p>
    </div>
  );
}

// --- Une carte de fidélité ---
function BlocCarte({
  slug,
  couleur,
  carte,
  recompenses,
  scanRecent,
  onRecompenseObtenue,
}: {
  slug: string;
  couleur: string;
  carte: CarteAffichee;
  recompenses: RecompenseAffichee[];
  scanRecent: boolean;
  onRecompenseObtenue: (animation: string) => void;
}) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [choix, setChoix] = useState(false);
  const [enCours, startTransition] = useTransition();

  const requis = carte.nombre_tampons_requis;
  const emoji = iconeEmoji(carte.tampon_icone);
  const cartePleine = carte.tampons_actuels >= requis;

  function prendreTampon() {
    setErreur(null);
    setMessage(null);
    startTransition(async () => {
      const resultat = await ajouterTampon(slug, carte.id);
      if (resultat?.erreur) setErreur(resultat.erreur);
      else setMessage("Tampon ajouté, merci de votre visite ! 🎉");
    });
  }

  function choisir(recompenseId: string, animation: string) {
    setErreur(null);
    setMessage(null);
    startTransition(async () => {
      const resultat = await choisirRecompense(slug, carte.id, recompenseId);
      if (resultat?.erreur) {
        setErreur(resultat.erreur);
        setChoix(false);
      } else {
        setChoix(false);
        onRecompenseObtenue(resultat.animation ?? animation);
      }
    });
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xl sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-bold text-stone-900">{carte.titre}</h3>
        <span className="shrink-0 text-sm font-semibold" style={{ color: couleur }}>
          {Math.min(carte.tampons_actuels, requis)} / {requis}
        </span>
      </div>

      {carte.date_expiration && (
        <p
          className={`mt-0.5 text-xs ${
            carte.expiree ? "font-semibold text-red-600" : "text-stone-400"
          }`}
        >
          {carte.expiree ? "Carte expirée le " : "Valable jusqu'au "}
          {new Date(carte.date_expiration + "T00:00:00").toLocaleDateString("fr-FR")}
        </p>
      )}

      <div className="mt-4 grid grid-cols-5 gap-2.5">
        {Array.from({ length: requis }, (_, i) => {
          const rempli = i < carte.tampons_actuels;
          return (
            <TamponCase
              key={i}
              forme={carte.tampon_forme}
              rempli={rempli}
              couleur={couleur}
              image={carte.tampon_image_url}
              emoji={emoji}
            />
          );
        })}
      </div>

      {recompenses.length > 0 && (
        <CarrouselRecompenses recompenses={recompenses} couleur={couleur} />
      )}

      {erreur && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{erreur}</p>
      )}
      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>
      )}

      {!carte.expiree && (
        <div className="mt-5">
          {cartePleine ? (
            choix && recompenses.length > 0 ? (
              <div className="space-y-2">
                <p className="text-center text-sm font-semibold text-stone-800">
                  Choisissez votre récompense :
                </p>
                {recompenses.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => choisir(r.id, "confettis")}
                    disabled={enCours}
                    className="flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 text-left transition hover:border-stone-300 disabled:opacity-60"
                  >
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                        style={{ backgroundColor: `${couleur}14` }}
                      >
                        🎁
                      </span>
                    )}
                    <span className="flex-1 text-sm font-semibold text-stone-900">{r.texte}</span>
                    <span style={{ color: couleur }}>›</span>
                  </button>
                ))}
                <button
                  onClick={() => setChoix(false)}
                  className="w-full rounded-xl px-4 py-2 text-sm font-medium text-stone-500 hover:bg-stone-50"
                >
                  Plus tard
                </button>
              </div>
            ) : (
              <button
                onClick={() => setChoix(true)}
                disabled={enCours}
                className="w-full animate-pulse rounded-xl px-4 py-3.5 font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: couleur }}
              >
                🎉 Choisir ma récompense
              </button>
            )
          ) : (
            <>
              <button
                onClick={prendreTampon}
                disabled={enCours || carte.tampon_pris_aujourdhui || !scanRecent}
                className="w-full rounded-xl px-4 py-3.5 font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: couleur }}
              >
                {!scanRecent
                  ? "📷 Scannez le QR code en caisse"
                  : carte.tampon_pris_aujourdhui
                    ? "Tampon du jour déjà pris ✓"
                    : enCours
                      ? "Un instant…"
                      : `${emoji} Prendre mon tampon du jour`}
              </button>
              <p className="mt-2 text-center text-xs text-stone-400">
                1 tampon maximum par jour
              </p>
            </>
          )}
        </div>
      )}

      {carte.texte_bas && (
        <p className="mt-4 border-t border-stone-100 pt-3 text-center text-xs italic text-stone-500">
          {carte.texte_bas}
        </p>
      )}
    </div>
  );
}

// --- Espace client complet avec onglets ---
export function EspaceClient({
  slug,
  couleur,
  animation,
  sections,
  cartes,
  recompenses,
  recompensesEnAttente,
  notificationsActives,
  scanRecent,
  qrClientDataUrl,
  restaurantId,
  vapidPublicKey,
}: {
  slug: string;
  couleur: string;
  animation: string;
  sections: Section[];
  cartes: CarteAffichee[];
  recompenses: RecompenseAffichee[];
  recompensesEnAttente: RecompenseGagnee[];
  notificationsActives: boolean;
  scanRecent: boolean;
  qrClientDataUrl: string | null;
  restaurantId: string;
  vapidPublicKey: string | null;
}) {
  // Fallback : si la table sections est vide (migration incomplète),
  // on affiche quand même les 2 onglets par défaut pour ne jamais avoir
  // une page vide côté client.
  const sectionsAffichees: Section[] =
    sections.length > 0
      ? sections
      : [
          {
            id: "default-cartes",
            restaurant_id: "",
            type: "cartes",
            titre: "Cartes de fidélité",
            texte: null,
            lien_url: null,
            lien_libelle: null,
            ordre: 0,
            supprimable: false,
            created_at: "",
          },
          {
            id: "default-info",
            restaurant_id: "",
            type: "info",
            titre: "Info",
            texte:
              "Présentez ce QR code au commerçant à chaque passage pour recevoir vos tampons.",
            lien_url: null,
            lien_libelle: null,
            ordre: 100,
            supprimable: false,
            created_at: "",
          },
        ];
  const [ongletActif, setOngletActif] = useState<string>(sectionsAffichees[0].id);
  const cleRefus = `walletiz_notif_refus_${slug}`;
  const [proposerNotifs, setProposerNotifs] = useState(false);
  const [animationEnCours, setAnimationEnCours] = useState<string | null>(null);

  useEffect(() => {
    setProposerNotifs(
      !notificationsActives &&
        typeof Notification !== "undefined" &&
        Notification.permission !== "denied" &&
        localStorage.getItem(cleRefus) !== "1"
    );
  }, [notificationsActives, cleRefus]);

  function refuserNotifs() {
    localStorage.setItem(cleRefus, "1");
    setProposerNotifs(false);
  }

  const sectionActive =
    sectionsAffichees.find((s) => s.id === ongletActif) ?? sectionsAffichees[0];

  return (
    <div className="space-y-6">
      {animationEnCours && (
        <AnimationRecompense
          type={animationEnCours}
          couleur={couleur}
          onEnd={() => setAnimationEnCours(null)}
        />
      )}

      {/* Onglets style pilules — carrousel horizontal si trop d'onglets */}
      <div className="rounded-2xl bg-white p-2 shadow-lg">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:justify-center">
          {sectionsAffichees.map((s) => {
            const actif = s.id === (sectionActive?.id ?? "");
            return (
              <button
                key={s.id}
                onClick={() => setOngletActif(s.id)}
                className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition"
                style={{
                  backgroundColor: actif ? couleur : "transparent",
                  color: actif ? "#fff" : "#57534E",
                }}
              >
                {s.titre}
              </button>
            );
          })}
        </div>
      </div>

      {proposerNotifs && (
        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-lg">
          <p className="mb-2 text-sm text-stone-600">
            🔔 Être averti(e) des nouveautés et récompenses de ce commerce ?
          </p>
          <AbonnementPush
            restaurantId={restaurantId}
            vapidPublicKey={vapidPublicKey}
            dejaActif={notificationsActives}
            couleur={couleur}
          />
          <button
            onClick={refuserNotifs}
            className="mt-2 text-xs font-medium text-stone-500 hover:text-stone-700"
          >
            Plus tard
          </button>
        </div>
      )}

      {/* Récompenses en attente : toujours visibles, indépendantes de l'onglet */}
      {recompensesEnAttente.length > 0 && (
        <section className="space-y-3">
          <h2 className="px-1 text-lg font-extrabold text-stone-900">
            🏆 Mes récompenses à récupérer ({recompensesEnAttente.length})
          </h2>
          <div className="space-y-3">
            {recompensesEnAttente.map((r) => (
              <RecompenseAttenteCard key={r.id} slug={slug} couleur={couleur} recompense={r} />
            ))}
          </div>
        </section>
      )}

      {/* Contenu de l'onglet actif */}
      {sectionActive && (
        <ContenuSection
          section={sectionActive}
          slug={slug}
          couleur={couleur}
          animation={animation}
          cartes={cartes}
          recompenses={recompenses}
          scanRecent={scanRecent}
          qrClientDataUrl={qrClientDataUrl}
          onAnimation={(a) => setAnimationEnCours(a || animation)}
        />
      )}
    </div>
  );
}

function ContenuSection({
  section,
  slug,
  couleur,
  cartes,
  recompenses,
  scanRecent,
  qrClientDataUrl,
  onAnimation,
}: {
  section: Section;
  slug: string;
  couleur: string;
  animation: string;
  cartes: CarteAffichee[];
  recompenses: RecompenseAffichee[];
  scanRecent: boolean;
  qrClientDataUrl: string | null;
  onAnimation: (a: string) => void;
}) {
  if (section.type === "cartes") {
    return (
      <section className="space-y-4">
        {cartes.length === 0 ? (
          <p className="rounded-3xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500 shadow-xl">
            Aucune carte disponible pour le moment.
          </p>
        ) : (
          cartes.map((carte) => (
            <BlocCarte
              key={carte.id}
              slug={slug}
              couleur={couleur}
              carte={carte}
              recompenses={recompenses.filter((r) => r.carte_id === carte.id)}
              scanRecent={scanRecent}
              onRecompenseObtenue={onAnimation}
            />
          ))
        )}
      </section>
    );
  }

  if (section.type === "info") {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl">
        {section.texte && (
          <p className="whitespace-pre-line text-center text-sm text-stone-600">
            {section.texte}
          </p>
        )}
        {qrClientDataUrl && (
          <>
            <div className="mt-5 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrClientDataUrl}
                alt="Mon QR code personnel"
                className="w-64 rounded-2xl border border-stone-100 p-2"
              />
            </div>
            <p className="mt-3 text-center text-xs text-stone-400">
              Présentez ce QR code au commerçant. Il n&apos;a plus qu&apos;à le scanner
              pour ajouter vos tampons.
            </p>
          </>
        )}
      </section>
    );
  }

  // Section personnalisée : titre + texte + lien optionnel
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl">
      <h2 className="text-lg font-bold text-stone-900">{section.titre}</h2>
      {section.texte && (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-600">
          {section.texte}
        </p>
      )}
      {section.lien_url && (
        <a
          href={section.lien_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
          style={{ backgroundColor: couleur }}
        >
          {section.lien_libelle || "Ouvrir le lien"} →
        </a>
      )}
    </section>
  );
}

function RecompenseAttenteCard({
  slug,
  couleur,
  recompense,
}: {
  slug: string;
  couleur: string;
  recompense: RecompenseGagnee;
}) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const [utilisee, setUtilisee] = useState(false);

  function utiliser() {
    if (!window.confirm("Confirmer l'utilisation de cette récompense ? À faire uniquement devant le commerçant.")) return;
    setErreur(null);
    startTransition(async () => {
      const r = await utiliserRecompense(slug, recompense.id);
      if (r?.erreur) setErreur(r.erreur);
      else setUtilisee(true);
    });
  }
  if (utilisee) return null;

  return (
    <div
      className="overflow-hidden rounded-3xl border-2 shadow-lg"
      style={{ borderColor: couleur }}
    >
      <div className="flex items-center gap-3 p-4" style={{ backgroundColor: `${couleur}14` }}>
        {recompense.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recompense.image_url}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white text-3xl">
            🎁
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-base font-extrabold" style={{ color: couleur }}>
            {recompense.texte_recompense}
          </p>
          <p className="text-xs text-stone-500">
            Obtenue le {new Date(recompense.date_gagnee).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
      <div className="p-3">
        <button
          onClick={utiliser}
          disabled={enCours}
          className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: couleur }}
        >
          ✅ Utiliser maintenant (devant le commerçant)
        </button>
        {erreur && <p className="mt-2 text-center text-xs text-red-600">{erreur}</p>}
      </div>
    </div>
  );
}
