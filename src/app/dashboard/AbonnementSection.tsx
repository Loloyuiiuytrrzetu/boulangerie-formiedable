"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { annulerAbonnement, reactiverAbonnement } from "./abonnement-actions";
import type { Restaurant } from "@/lib/types";
import { useTDash } from "@/lib/langue-dashboard";

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
  const t = useTDash();
  const router = useRouter();
  const [enCours, startTransition] = useTransition();
  const [confirmation, setConfirmation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const tz = restaurant.timezone ?? "Europe/Paris";
  // Le statut stocké peut rester « essai » alors que la date de fin est
  // dépassée (webhook Stripe non déclenché pour ce compte). On calcule donc
  // un statut EFFECTIF : un essai dont la date de fin est passée est traité
  // comme terminé, pour ne plus afficher « Essai gratuit » à tort.
  const essaiTermine =
    restaurant.abonnement_statut === "essai" &&
    !!restaurant.essai_fin_le &&
    new Date(restaurant.essai_fin_le).getTime() < Date.now();
  const statut = essaiTermine ? "expire" : restaurant.abonnement_statut;

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
            💳 {t("mon_abonnement")}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {t("abonnement_desc")}
          </p>
        </div>
        <StatutBadge statut={statut} essaiTermine={essaiTermine} />
      </div>

      {statut === "essai" && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-bold text-green-900">
            🎁 {t("essai_gratuit")}
          </p>
          <p className="mt-2 text-xs text-green-700">
            {t("fin_essai")} <strong>{formatDate(restaurant.essai_fin_le, tz)}</strong>
          </p>
        </div>
      )}

      {statut === "actif" && (
        <div className="mt-5 rounded-xl border border-bordeaux-200 bg-bordeaux-50 p-4">
          <p className="text-sm font-bold text-bordeaux-900">
            ✓ {t("plan_pro")}
          </p>
          <p className="mt-1 text-sm text-bordeaux-800">
            {t("prochaine_facture")}{" "}
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
            ⚠️ {t("annule")}
          </p>
          <p className="mt-1 text-sm text-amber-800">
            <strong>
              {formatDate(
                restaurant.abonnement_prochaine_facture_le ??
                  restaurant.essai_fin_le,
                tz
              )}
            </strong>
          </p>
        </div>
      )}

      {statut === "expire" && essaiTermine && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-900">
            ⌛ {t("essai_termine")}
          </p>
          <p className="mt-2 text-xs text-amber-800">
            {t("essai_termine_desc")}{" "}
            <strong>{formatDate(restaurant.essai_fin_le, tz)}</strong>
          </p>
        </div>
      )}

      {statut === "expire" && !essaiTermine && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-900">
            ⛔ {t("expire")}
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
            {t("annuler_abonnement")}
          </button>
        )}
        {statut === "annule" && (
          <button
            type="button"
            onClick={reactiver}
            disabled={enCours}
            className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
          >
            {enCours ? "…" : t("reactiver_abonnement")}
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
              {t("confirmer_annulation_abonnement")}
            </p>
            <p className="mt-2 text-sm text-stone-600">
              {t("annulation_abonnement_desc")}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={annuler}
                disabled={enCours}
                className="rounded-xl bg-stone-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:opacity-60 sm:flex-1"
              >
                {enCours ? "…" : t("annuler_abonnement")}
              </button>
              <button
                type="button"
                onClick={() => setConfirmation(false)}
                disabled={enCours}
                className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 sm:flex-1"
              >
                {t("annuler")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function StatutBadge({
  statut,
  essaiTermine,
}: {
  statut: Restaurant["abonnement_statut"];
  essaiTermine?: boolean;
}) {
  const t = useTDash();
  if (essaiTermine) {
    return (
      <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
        {t("essai_termine")}
      </span>
    );
  }
  const config = {
    essai: { label: t("essai_gratuit"), classes: "bg-green-100 text-green-800" },
    actif: { label: t("plan_pro"), classes: "bg-bordeaux-100 text-bordeaux-800" },
    annule: { label: t("annule"), classes: "bg-amber-100 text-amber-800" },
    expire: { label: t("expire"), classes: "bg-red-100 text-red-800" },
  }[statut];
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
