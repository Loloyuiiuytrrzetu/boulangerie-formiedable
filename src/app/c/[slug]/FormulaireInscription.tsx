"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inscrireClient } from "./actions";

// Première visite : le client entre uniquement son numéro de téléphone.
// Une fois la carte créée (cookie posé), la page se re-rend et affiche
// la carte de fidélité, avec une bannière optionnelle pour les notifications.
export function FormulaireInscription({
  slug,
  couleur,
}: {
  slug: string;
  couleur: string;
}) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  function soumettre(formData: FormData) {
    setErreur(null);
    // Si le client a décoché la case notifications à l'inscription, on
    // pose immédiatement le refus en localStorage pour que la bannière
    // d'abonnement n'apparaisse pas ensuite.
    if (typeof window !== "undefined") {
      const veutNotifs = formData.get("recevoir_notifs") === "on";
      if (!veutNotifs) localStorage.setItem(`walletiz_notif_refus_${slug}`, "1");
      else localStorage.removeItem(`walletiz_notif_refus_${slug}`);
    }
    startTransition(async () => {
      const resultat = await inscrireClient(slug, formData);
      if (resultat?.erreur) setErreur(resultat.erreur);
      else router.refresh();
    });
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
      <h2 className="text-lg font-bold text-stone-900">Bienvenue ! 👋</h2>

      <form action={soumettre} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="telephone"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Numéro de téléphone
          </label>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="06 12 34 56 78"
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-lg tracking-wide outline-none transition focus:ring-2"
            style={{ caretColor: couleur }}
          />
        </div>

        <div>
          <label
            htmlFor="identite"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Nom et prénom
          </label>
          <input
            id="identite"
            name="identite"
            type="text"
            required
            autoComplete="name"
            maxLength={80}
            placeholder="Nom Prénom (ou juste l'un des deux)"
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:ring-2"
            style={{ caretColor: couleur }}
          />
        </div>

        <label className="flex items-start gap-2 text-xs text-stone-500">
          <input
            type="checkbox"
            name="recevoir_notifs"
            defaultChecked
            className="mt-0.5 h-4 w-4 shrink-0 accent-stone-600"
          />
          <span>
            Recevoir les alertes de promotions et événements par notification
            (désactivable à tout moment dans l&apos;onglet Info).
          </span>
        </label>

        {erreur && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
        )}

        <button
          type="submit"
          disabled={enCours}
          className="w-full rounded-xl px-4 py-3.5 font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: couleur }}
        >
          {enCours ? "Création…" : "Créer ma carte de fidélité"}
        </button>
      </form>
    </div>
  );
}
