"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { annulerAbonnement, reactiverAbonnement } from "./abonnement-actions";
import type { Restaurant } from "@/lib/types";

const PRIX_ABO = 64;

function joursRestants(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(iso: string | null, timezone: string): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function AbonnementSection({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const [enCours, startTransition] = useTransition();
  const [confirmation, setConfirmation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const statut = restaurant.abonnement_statut;
  const joursEssai = joursRestants(restaurant.essai_fin_le);
  const tz = restaurant.timezone ?? "Europe/Paris";

  function annuler() {
    setErreur(null);
    startTransition(async () => {
      const r = await annulerAbonnement();
      if (r?.erreur) setErreur(r.erreur);
      else {
        setConfirmation(false);
        router.refresh();
      }
    });
  }

  function reactiver() {
    setErreur(null);
    startTransition(async () => {
      const r = await reactiverAbonnement();
      if (r?.erreur) setErreur(r.erreur);
      else router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            💳 Mon abonnement
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Plan Pro Walletiz — {PRIX_ABO}€ par mois, sans engagement.
          </p>
        </div>
        <StatutBadge statut={statut} />
      </div>

      {statut === "essai" && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-bold text-green-900">
            🎁 Vous êtes en essai gratuit
          </p>
          <p className="mt-1 text-sm text-green-800">
            {joursEssai === 0
              ? "Votre essai se termine aujourd'hui."
              : joursEssai === 1
                ? "Il vous reste 1 jour d'essai."
                : `Il vous reste ${joursEssai} jours d'essai.`}
          </p>
          <p className="mt-2 text-xs text-green-700">
            Fin de l&apos;essai : <strong>{formatDate(restaurant.essai_fin_le, tz)}</strong>.
            À cette date, {PRIX_ABO}€ seront prélevés puis chaque mois.
            Annulez avant pour ne rien payer.
          </p>
        </div>
      )}

      {statut === "actif" && (
        <div className="mt-5 rounded-xl border border-bordeaux-200 bg-bordeaux-50 p-4">
          <p className="text-sm font-bold text-bordeaux-900">
            ✓ Abonnement Pro actif
          </p>
          <p className="mt-1 text-sm text-bordeaux-800">
            Prochain prélèvement : {" "}
            <strong>
              {formatDate(restaurant.abonnement_prochaine_facture_le, tz)}
            </strong>
            {" "}({PRIX_ABO}€)
          </p>
        </div>
      )}

      {statut === "annule" && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">
            ⚠️ Abonnement annulé
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Vous gardez l&apos;accès complet jusqu&apos;au{" "}
            <strong>
              {formatDate(
                restaurant.abonnement_prochaine_facture_le ??
                  restaurant.essai_fin_le,
                tz
              )}
            </strong>
            . Aucun prélèvement ne sera fait.
          </p>
          <p className="mt-2 text-xs text-amber-700">
            Changé d&apos;avis ? Vous pouvez réactiver à tout moment.
          </p>
        </div>
      )}

      {statut === "expire" && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-900">
            ⛔ Abonnement expiré
          </p>
          <p className="mt-1 text-sm text-red-800">
            Votre abonnement est terminé. Contactez-nous pour le réactiver.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {(statut === "essai" || statut === "actif") && (
          <button
            type="button"
            onClick={() => setConfirmation(true)}
            disabled={enCours}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-60"
          >
            Annuler l&apos;abonnement
          </button>
        )}
        {statut === "annule" && (
          <button
            type="button"
            onClick={reactiver}
            disabled={enCours}
            className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
          >
            {enCours ? "…" : "Réactiver mon abonnement"}
          </button>
        )}
      </div>

      {erreur && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erreur}
        </p>
      )}

      {confirmation && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => !enCours && setConfirmation(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-stone-900">
              Annuler l&apos;abonnement ?
            </p>
            <p className="mt-2 text-sm text-stone-600">
              Votre commerce restera{" "}
              <strong>accessible jusqu&apos;au{" "}
              {formatDate(
                restaurant.abonnement_prochaine_facture_le ??
                  restaurant.essai_fin_le,
                tz
              )}</strong>. Aucun prélèvement ne sera fait. Vous pouvez réactiver
              à tout moment.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={annuler}
                disabled={enCours}
                className="rounded-xl bg-stone-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60 sm:flex-1"
              >
                {enCours ? "Annulation…" : "Oui, annuler"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmation(false)}
                disabled={enCours}
                className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 sm:flex-1"
              >
                Non, garder
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function StatutBadge({ statut }: { statut: Restaurant["abonnement_statut"] }) {
  const config = {
    essai: { label: "Essai gratuit", classes: "bg-green-100 text-green-800" },
    actif: { label: "Actif", classes: "bg-bordeaux-100 text-bordeaux-800" },
    annule: { label: "Annulé", classes: "bg-amber-100 text-amber-800" },
    expire: { label: "Expiré", classes: "bg-red-100 text-red-800" },
  }[statut];
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
