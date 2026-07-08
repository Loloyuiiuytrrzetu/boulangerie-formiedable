"use client";

import { useEffect, useState, useTransition } from "react";
import { activerNotifications, ajouterTampon, reclamerRecompense } from "./actions";
import { iconeEmoji } from "@/lib/icons";

type Props = {
  slug: string;
  restaurant: {
    couleur: string;
    tampon_icone: string;
    nombre_tampons_requis: number;
    texte_recompense: string;
  };
  client: {
    tampons_actuels: number;
    recompenses_reclamees: number;
    notifications_push_actif: boolean;
    tampon_pris_aujourdhui: boolean;
  };
};

// Carte de fidélité du client reconnu : grille de tampons,
// bouton "1 tampon par jour" et réclamation de la récompense.
export function CarteFidelite({ slug, restaurant, client }: Props) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  // Proposition (optionnelle, jamais bloquante) d'activer les notifications :
  // affichée tant que le client n'a ni accepté ni cliqué « Plus tard ».
  const cleRefus = `fidelio_notif_refus_${slug}`;
  const [proposerNotifs, setProposerNotifs] = useState(false);
  useEffect(() => {
    setProposerNotifs(
      !client.notifications_push_actif &&
        typeof Notification !== "undefined" &&
        Notification.permission !== "denied" &&
        localStorage.getItem(cleRefus) !== "1"
    );
  }, [client.notifications_push_actif, cleRefus]);

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

  const { couleur, nombre_tampons_requis: requis } = restaurant;
  const emoji = iconeEmoji(restaurant.tampon_icone);
  const cartePleine = client.tampons_actuels >= requis;

  function prendreTampon() {
    setErreur(null);
    setMessage(null);
    startTransition(async () => {
      const resultat = await ajouterTampon(slug);
      if (resultat?.erreur) setErreur(resultat.erreur);
      else setMessage("Tampon ajouté, merci de votre visite ! 🎉");
    });
  }

  function reclamer() {
    setErreur(null);
    setMessage(null);
    startTransition(async () => {
      const resultat = await reclamerRecompense(slug);
      if (resultat?.erreur) setErreur(resultat.erreur);
      else
        setMessage(
          `Récompense validée : ${resultat.recompense} — montrez cet écran au commerçant !`
        );
    });
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl">
      {proposerNotifs && (
        <div className="mb-5 rounded-2xl bg-stone-50 px-4 py-3">
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

      <div className="flex items-baseline justify-between">
        <h2 className="font-bold text-stone-900">Mes tampons</h2>
        <span className="text-sm font-semibold" style={{ color: couleur }}>
          {Math.min(client.tampons_actuels, requis)} / {requis}
        </span>
      </div>

      {/* Grille de tampons */}
      <div className="mt-4 grid grid-cols-5 gap-2.5">
        {Array.from({ length: requis }, (_, i) => {
          const rempli = i < client.tampons_actuels;
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

      {/* Récompense visée */}
      <div
        className="mt-5 rounded-2xl px-4 py-3 text-center text-sm font-medium"
        style={{ backgroundColor: `${couleur}14`, color: couleur }}
      >
        🎁 Récompense : {restaurant.texte_recompense}
      </div>

      {erreur && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {erreur}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </p>
      )}

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
            disabled={enCours || client.tampon_pris_aujourdhui}
            className="w-full rounded-xl px-4 py-3.5 font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: couleur }}
          >
            {client.tampon_pris_aujourdhui
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

      {client.recompenses_reclamees > 0 && (
        <p className="mt-4 text-center text-xs text-stone-400">
          {client.recompenses_reclamees} récompense
          {client.recompenses_reclamees > 1 ? "s" : ""} déjà obtenue
          {client.recompenses_reclamees > 1 ? "s" : ""} 🏆
        </p>
      )}
    </div>
  );
}
