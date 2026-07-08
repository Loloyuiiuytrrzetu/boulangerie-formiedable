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
    startTransition(async () => {
      const resultat = await inscrireClient(slug, formData);
      if (resultat?.erreur) setErreur(resultat.erreur);
      else router.refresh();
    });
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
      <h2 className="text-lg font-bold text-stone-900">Bienvenue ! 👋</h2>
      <p className="mt-2 text-sm text-stone-500">
        Entrez votre numéro de téléphone pour créer votre carte de fidélité.
        Rien à installer, rien d&apos;autre à remplir.
      </p>

      <form action={soumettre} className="mt-6 space-y-4">
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

      <p className="mt-4 text-center text-xs text-stone-400">
        Votre numéro sert uniquement à retrouver votre carte. Aucune publicité.
      </p>
    </div>
  );
}
