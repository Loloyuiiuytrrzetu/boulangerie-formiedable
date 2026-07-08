"use client";

import { useEffect, useState, useTransition } from "react";
import { activerNotifications, ajouterTampon, reclamerRecompense } from "./actions";
import { iconeEmoji } from "@/lib/icons";

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

// --- Une carte de fidélité du client : grille + tampon + réclamation ---
function BlocCarte({
  slug,
  couleur,
  carte,
  recompenses,
}: {
  slug: string;
  couleur: string;
  carte: CarteAffichee;
  recompenses: RecompenseAffichee[];
}) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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

  function reclamer() {
    setErreur(null);
    setMessage(null);
    startTransition(async () => {
      const resultat = await reclamerRecompense(slug, carte.id);
      if (resultat?.erreur) setErreur(resultat.erreur);
      else
        setMessage(
          `Récompense validée : ${resultat.recompense} — montrez cet écran au commerçant !`
        );
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
        <p className={`mt-0.5 text-xs ${carte.expiree ? "font-semibold text-red-600" : "text-stone-400"}`}>
          {carte.expiree ? "Carte expirée le " : "Valable jusqu'au "}
          {new Date(carte.date_expiration + "T00:00:00").toLocaleDateString("fr-FR")}
        </p>
      )}

      {/* Grille de tampons */}
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

      {/* Récompense(s) visée(s) */}
      {recompenses.length > 0 && (
        <div
          className="mt-5 rounded-2xl px-4 py-3 text-center text-sm font-medium"
          style={{ backgroundColor: `${couleur}14`, color: couleur }}
        >
          🎁 {recompenses.map((r) => r.texte).join(" + ")}
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
            <button
              onClick={reclamer}
              disabled={enCours}
              className="w-full animate-pulse rounded-xl px-4 py-3.5 font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: couleur }}
            >
              {enCours ? "Validation…" : "🎉 Réclamer ma récompense"}
            </button>
          ) : (
            <button
              onClick={prendreTampon}
              disabled={enCours || carte.tampon_pris_aujourdhui}
              className="w-full rounded-xl px-4 py-3.5 font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: couleur }}
            >
              {carte.tampon_pris_aujourdhui
                ? "Tampon du jour déjà pris ✓"
                : enCours
                  ? "Un instant…"
                  : `${emoji} Prendre mon tampon du jour`}
            </button>
          )}
          <p className="mt-2 text-center text-xs text-stone-400">
            1 tampon maximum par jour
          </p>
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

// --- Espace client complet : cartes + récompenses + notifications ---
export function EspaceClient({
  slug,
  couleur,
  cartes,
  recompenses,
  notificationsActives,
}: {
  slug: string;
  couleur: string;
  cartes: CarteAffichee[];
  recompenses: RecompenseAffichee[];
  notificationsActives: boolean;
}) {
  // Proposition (optionnelle, jamais bloquante) d'activer les notifications
  const cleRefus = `fidelio_notif_refus_${slug}`;
  const [proposerNotifs, setProposerNotifs] = useState(false);
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
    } catch {
      // ne bloque jamais le parcours
    }
  }

  function refuserNotifs() {
    localStorage.setItem(cleRefus, "1");
    setProposerNotifs(false);
  }

  const titresCartes = new Map(cartes.map((c) => [c.id, c.titre]));

  return (
    <div className="space-y-8">
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

      {/* ----- Section cartes de fidélité ----- */}
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
            />
          ))
        )}
      </section>

      {/* ----- Section récompenses ----- */}
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
                  <img
                    src={r.image_url}
                    alt={r.texte}
                    className="h-24 w-full object-cover"
                  />
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
                  {titresCartes.get(r.carte_id) && (
                    <p className="mt-0.5 text-xs text-stone-400">
                      {titresCartes.get(r.carte_id)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
