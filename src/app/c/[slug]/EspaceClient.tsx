"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ajouterTampon,
  choisirRecompense,
  desinscrireClient,
  modifierIdentite,
  utiliserRecompense,
} from "./actions";
import { AnimationRecompense } from "./Animation";
import { AbonnementPush } from "./AbonnementPush";
import { InstallationIOS } from "./InstallationIOS";
import { ScannerClient } from "./ScannerClient";
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
            x="0"
            y="0"
            width="100"
            height="100"
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
  tamponRestaurateurOnly,
  onRecompenseObtenue,
}: {
  slug: string;
  couleur: string;
  carte: CarteAffichee;
  recompenses: RecompenseAffichee[];
  scanRecent: boolean;
  tamponRestaurateurOnly: boolean;
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
                    onClick={() => choisir(r.id, "rayons")}
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
          ) : tamponRestaurateurOnly ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-center text-sm text-stone-600">
              {carte.tampon_pris_aujourdhui
                ? "Tampon du jour déjà pris ✓"
                : "Présentez votre QR code personnel au commerçant pour recevoir votre tampon."}
            </div>
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
  tamponRestaurateurOnly,
  animationCouleur,
  nomCommerce,
  identiteClient,
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
  tamponRestaurateurOnly: boolean;
  animationCouleur: string;
  nomCommerce: string;
  identiteClient: string;
}) {
  // Fallback : si la table sections est vide (migration incomplète),
  // on affiche quand même les 2 onglets par défaut pour ne jamais avoir
  // une page vide côté client.
  const sectionsBase: Section[] =
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
              "Présentez ce QR code uniquement si le commerçant vous le demande.",
            lien_url: null,
            lien_libelle: null,
            ordre: 100,
            supprimable: false,
            created_at: "",
          },
        ];

  // Onglet virtuel "Scan" toujours inséré juste après le premier onglet
  // Cartes — le client peut y scanner lui-même le QR de caisse pour
  // recevoir un tampon (règles habituelles : 1/jour, mode manuel respecté).
  const sectionScan: Section = {
    id: "virtual-scan",
    restaurant_id: "",
    type: "scan",
    titre: "Scan",
    texte: null,
    lien_url: null,
    lien_libelle: null,
    ordre: 1,
    supprimable: false,
    created_at: "",
  };
  const indexCartes = sectionsBase.findIndex((s) => s.type === "cartes");
  const sectionsAffichees: Section[] =
    indexCartes >= 0
      ? [
          ...sectionsBase.slice(0, indexCartes + 1),
          sectionScan,
          ...sectionsBase.slice(indexCartes + 1),
        ]
      : [sectionScan, ...sectionsBase];
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
      <InstallationIOS couleur={couleur} nomCommerce={nomCommerce} />
      {animationEnCours && (
        <AnimationRecompense
          type={animationEnCours}
          couleur={animationCouleur}
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
        <div
          className="animate-pulse-slow rounded-2xl border-2 px-4 py-4 shadow-xl"
          style={{
            borderColor: couleur,
            backgroundColor: `${couleur}0d`,
          }}
        >
          <p className="mb-1 text-base font-bold" style={{ color: couleur }}>
            🔔 Dernière étape : activez vos notifications
          </p>
          <p className="mb-3 text-xs text-stone-600">
            Appuyez sur le bouton ci-dessous et autorisez les notifications pour
            recevoir les promotions et les alertes de récompenses de ce commerce.
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
            Non merci, plus tard
          </button>
        </div>
      )}

      {/* Récompenses en attente : toujours visibles, indépendantes de l'onglet.
          Si plusieurs, on les affiche dans un carrousel horizontal — le client
          slide vers la gauche pour voir les suivantes. */}
      {recompensesEnAttente.length > 0 && (
        <section className="space-y-3">
          <h2 className="px-1 text-lg font-extrabold text-stone-900">
            🏆 Mes récompenses à récupérer ({recompensesEnAttente.length})
          </h2>
          {recompensesEnAttente.length === 1 ? (
            <RecompenseAttenteCard
              slug={slug}
              couleur={couleur}
              recompense={recompensesEnAttente[0]}
              onAnimation={() => setAnimationEnCours(animation)}
            />
          ) : (
            <>
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0">
                {recompensesEnAttente.map((r) => (
                  <div key={r.id} className="w-[92%] shrink-0 snap-center sm:w-[85%]">
                    <RecompenseAttenteCard
                      slug={slug}
                      couleur={couleur}
                      recompense={r}
                      onAnimation={() => setAnimationEnCours(animation)}
                    />
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-stone-400">
                ← Glissez pour voir toutes vos récompenses →
              </p>
            </>
          )}
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
          tamponRestaurateurOnly={tamponRestaurateurOnly}
          restaurantId={restaurantId}
          identiteClient={identiteClient}
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
  tamponRestaurateurOnly,
  restaurantId,
  identiteClient,
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
  tamponRestaurateurOnly: boolean;
  restaurantId: string;
  identiteClient: string;
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
              tamponRestaurateurOnly={tamponRestaurateurOnly}
              onRecompenseObtenue={onAnimation}
            />
          ))
        )}
      </section>
    );
  }

  if (section.type === "scan") {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl">
        <ScannerClient
          slug={slug}
          couleur={couleur}
          cartes={cartes}
          onAnimation={() => onAnimation("")}
        />
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
              Présentez ce QR code uniquement si le commerçant vous le
              demande.
            </p>
          </>
        )}
        <ModifierIdentite slug={slug} identiteActuelle={identiteClient} />
        <DesactivationNotifs slug={slug} restaurantId={restaurantId} />
        <BoutonDesinscription slug={slug} couleur={couleur} />
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
  onAnimation,
}: {
  slug: string;
  couleur: string;
  recompense: RecompenseGagnee;
  onAnimation?: () => void;
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
      else {
        setUtilisee(true);
        // Rejoue l'animation de récompense choisie par le restaurateur
        // pour valider visuellement l'utilisation devant le commerçant.
        onAnimation?.();
      }
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

// Petite case tout en bas de l'onglet Info : le client peut renoncer aux
// notifications push (promotions, événements) à tout moment.
function DesactivationNotifs({
  slug,
  restaurantId,
}: {
  slug: string;
  restaurantId: string;
}) {
  const cle = `walletiz_notif_refus_${slug}`;
  // Valeur sauvegardée (celle qui compte réellement)
  const [enregistre, setEnregistre] = useState(false);
  // Valeur temporaire (celle qu'affiche la case, en attente de clic "Enregistrer")
  const [choix, setChoix] = useState(false);
  const [succes, setSucces] = useState(false);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const val = localStorage.getItem(cle) === "1";
    setEnregistre(val);
    setChoix(val);
  }, [cle]);

  async function enregistrer() {
    if (typeof window === "undefined") return;
    setEnCours(true);
    if (choix) {
      // Le client demande à ne plus recevoir de notifications :
      // 1. Désenregistre l'abonnement du navigateur
      // 2. Supprime les abonnements de la base côté serveur
      // 3. Mémorise le refus en localStorage pour ne plus proposer la bannière
      localStorage.setItem(cle, "1");
      try {
        const registration = await navigator.serviceWorker?.getRegistration("/sw.js");
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) await subscription.unsubscribe();
      } catch {
        // Continue même si le désabonnement navigateur échoue
      }
      try {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restaurantId }),
        });
      } catch {
        // Continue même en cas d'échec réseau
      }
    } else {
      localStorage.removeItem(cle);
    }
    setEnregistre(choix);
    setSucces(true);
    setEnCours(false);
    setTimeout(() => setSucces(false), 2000);
  }

  const modifie = choix !== enregistre;

  return (
    <div className="mt-8 border-t border-stone-100 pt-4">
      <label className="flex items-start gap-2 text-xs text-stone-500">
        <input
          type="checkbox"
          checked={choix}
          onChange={(e) => setChoix(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-stone-600"
        />
        <span>
          J&apos;accepte de ne pas recevoir de notifications pour m&apos;avertir
          d&apos;une promotion ou d&apos;un événement.
        </span>
      </label>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={enregistrer}
          disabled={!modifie || enCours}
          className="rounded-lg bg-stone-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {enCours ? "…" : "Enregistrer"}
        </button>
        {succes && (
          <span className="text-xs font-medium text-green-600">
            ✓ Choix enregistré
          </span>
        )}
      </div>
    </div>
  );
}

// Modification du nom / prénom depuis l'onglet Info.
function ModifierIdentite({
  slug,
  identiteActuelle,
}: {
  slug: string;
  identiteActuelle: string;
}) {
  const router = useRouter();
  const [valeur, setValeur] = useState(identiteActuelle);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  function enregistrer() {
    setErreur(null);
    setSucces(false);
    const formData = new FormData();
    formData.set("identite", valeur);
    startTransition(async () => {
      const r = await modifierIdentite(slug, formData);
      if (r?.erreur) setErreur(r.erreur);
      else {
        setSucces(true);
        router.refresh();
        setTimeout(() => setSucces(false), 2000);
      }
    });
  }

  const modifie = valeur.trim() !== identiteActuelle.trim();

  return (
    <div className="mt-8 border-t border-stone-100 pt-4">
      <label className="mb-1.5 block text-sm font-medium text-stone-700">
        Nom et prénom
      </label>
      <input
        type="text"
        value={valeur}
        onChange={(e) => setValeur(e.target.value)}
        maxLength={80}
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
      />
      {erreur && <p className="mt-1 text-xs text-red-600">{erreur}</p>}
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={enregistrer}
          disabled={!modifie || enCours || !valeur.trim()}
          className="rounded-lg bg-stone-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {enCours ? "…" : "Enregistrer"}
        </button>
        {succes && (
          <span className="text-xs font-medium text-green-600">
            ✓ Modifié
          </span>
        )}
      </div>
    </div>
  );
}

// Bouton de désinscription tout en bas de l'onglet Info : supprime le
// compte client + efface le cookie de reconnaissance. Après ça, un
// nouveau scan du QR code redémarre comme une première visite.
function BoutonDesinscription({
  slug,
  couleur,
}: {
  slug: string;
  couleur: string;
}) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  function confirmer() {
    setErreur(null);
    startTransition(async () => {
      const r = await desinscrireClient(slug);
      if (r?.erreur) setErreur(r.erreur);
      else {
        setConfirmation(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-8 border-t border-stone-100 pt-4 text-center">
      <button
        type="button"
        onClick={() => setConfirmation(true)}
        className="text-xs font-medium text-stone-500 underline hover:text-red-600"
      >
        Se désinscrire de ce commerce
      </button>

      {confirmation && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => !enCours && setConfirmation(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-stone-900">
              Se désinscrire ?
            </p>
            <p className="mt-2 text-sm text-stone-600">
              Toutes vos cartes de fidélité, tampons et récompenses en attente
              seront <strong>définitivement supprimés</strong>. Vous pourrez
              vous réinscrire en scannant à nouveau le QR code du commerce.
            </p>
            {erreur && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {erreur}
              </p>
            )}
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={confirmer}
                disabled={enCours}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {enCours ? "Désinscription…" : "Oui, me désinscrire"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmation(false)}
                disabled={enCours}
                className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
                style={{ color: couleur, borderColor: `${couleur}55` }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
