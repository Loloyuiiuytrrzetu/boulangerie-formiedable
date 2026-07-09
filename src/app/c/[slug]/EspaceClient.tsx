"use client";

import { useEffect, useState, useTransition } from "react";
import {
  activerNotifications,
  ajouterTampon,
  choisirRecompense,
  utiliserRecompense,
} from "./actions";
import { AnimationRecompense } from "./Animation";
import { iconeEmoji } from "@/lib/icons";
import type { RecompenseGagnee } from "@/lib/types";

export type CarteAffichee = {
  id: string;
  titre: string;
  tampon_icone: string;
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
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl">
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
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-2xl border-2 text-2xl transition"
              style={
                rempli
                  ? { backgroundColor: couleur, borderColor: couleur }
                  : { borderColor: "#e7e5e4", borderStyle: "dashed" }
              }
            >
              <span className={rempli ? "" : "opacity-20 grayscale"}>{emoji}</span>
            </div>
          );
        })}
      </div>

      {/* Récompense(s) : au choix, jamais cumulées */}
      {recompenses.length === 1 && (
        <div
          className="mt-5 rounded-2xl px-4 py-3 text-center text-sm font-medium"
          style={{ backgroundColor: `${couleur}14`, color: couleur }}
        >
          🎁 {recompenses[0].texte}
        </div>
      )}
      {recompenses.length > 1 && (
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
                className="w-40 shrink-0 snap-start overflow-hidden rounded-2xl border border-stone-200 bg-white"
              >
                {r.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image_url} alt={r.texte} className="h-20 w-full object-cover" />
                ) : (
                  <div
                    className="flex h-20 w-full items-center justify-center text-3xl"
                    style={{ backgroundColor: `${couleur}14` }}
                  >
                    🎁
                  </div>
                )}
                <p className="p-2 text-center text-xs font-semibold text-stone-900">{r.texte}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-stone-400">
            ← Glissez pour voir toutes les récompenses →
          </p>
        </div>
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
      {carte.recompenses_reclamees > 0 && (
        <p className="mt-3 text-center text-xs text-stone-400">
          {carte.recompenses_reclamees} récompense
          {carte.recompenses_reclamees > 1 ? "s" : ""} déjà obtenue
          {carte.recompenses_reclamees > 1 ? "s" : ""} 🏆
        </p>
      )}
    </div>
  );
}

// --- Espace client ---
export function EspaceClient({
  slug,
  couleur,
  animation,
  cartes,
  recompenses,
  recompensesEnAttente,
  notificationsActives,
  scanRecent,
}: {
  slug: string;
  couleur: string;
  animation: string;
  cartes: CarteAffichee[];
  recompenses: RecompenseAffichee[];
  recompensesEnAttente: RecompenseGagnee[];
  notificationsActives: boolean;
  scanRecent: boolean;
}) {
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

  async function accepterNotifs() {
    setProposerNotifs(false);
    try {
      const permission = await Notification.requestPermission();
      await activerNotifications(slug, permission === "granted");
    } catch {}
  }

  function refuserNotifs() {
    localStorage.setItem(cleRefus, "1");
    setProposerNotifs(false);
  }

  return (
    <div className="space-y-8">
      {animationEnCours && (
        <AnimationRecompense
          type={animationEnCours}
          onEnd={() => setAnimationEnCours(null)}
        />
      )}

      {proposerNotifs && (
        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm text-stone-600">
            🔔 Être averti(e) quand une récompense vous attend ?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={accepterNotifs}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: couleur }}
            >
              Activer les notifications
            </button>
            <button
              onClick={refuserNotifs}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-100"
            >
              Plus tard
            </button>
          </div>
        </div>
      )}

      {!scanRecent && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          📷 Pour prendre un tampon, scannez le QR code affiché en caisse.
        </div>
      )}

      {/* ----- Récompenses en attente ----- */}
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

      {/* ----- Cartes de fidélité ----- */}
      <section className="space-y-4">
        <h2 className="px-1 text-lg font-extrabold text-stone-900">
          💳 Mes cartes de fidélité
        </h2>
        {cartes.length === 0 ? (
          <p className="rounded-3xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500 shadow-xl">
            Aucune carte disponible pour le moment — revenez bientôt !
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
              onRecompenseObtenue={(a) => setAnimationEnCours(a || animation)}
            />
          ))
        )}
      </section>

      {/* ----- Récompenses proposées par le commerce ----- */}
      {recompenses.length > 0 && (
        <section className="space-y-4">
          <h2 className="px-1 text-lg font-extrabold text-stone-900">🎁 Récompenses</h2>
          <div className="grid grid-cols-2 gap-3">
            {recompenses.map((r) => (
              <div
                key={r.id}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg"
              >
                {r.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image_url} alt={r.texte} className="h-24 w-full object-cover" />
                ) : (
                  <div
                    className="flex h-24 w-full items-center justify-center text-4xl"
                    style={{ backgroundColor: `${couleur}14` }}
                  >
                    🎁
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-semibold text-stone-900">{r.texte}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// --- Bloc récompense en attente : "présenter au commerçant" ---
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
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white text-3xl"
          >
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
