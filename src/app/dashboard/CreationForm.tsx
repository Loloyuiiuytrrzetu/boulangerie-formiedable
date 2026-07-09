"use client";

import { useState, useTransition } from "react";
import { creerRestaurant } from "./actions";

export function CreationForm() {
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  function soumettre(formData: FormData) {
    startTransition(async () => {
      const resultat = await creerRestaurant(formData);
      if (resultat?.erreur) setErreur(resultat.erreur);
    });
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8">
      <h1 className="text-xl font-bold text-stone-900">Bienvenue sur Walletiz 👋</h1>
      <p className="mt-2 text-sm text-stone-500">
        Commençons par créer la fiche de votre commerce. Vous pourrez ensuite
        personnaliser votre carte de fidélité et imprimer votre QR code.
      </p>
      <form action={soumettre} className="mt-6 space-y-4">
        <div>
          <label htmlFor="nom" className="mb-1.5 block text-sm font-medium text-stone-700">
            Nom du commerce
          </label>
          <input
            id="nom"
            name="nom"
            required
            maxLength={80}
            placeholder="Ex : Boulangerie Formiedable"
            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200"
          />
        </div>
        {erreur && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
        )}
        <button
          type="submit"
          disabled={enCours}
          className="w-full rounded-lg bg-bordeaux-800 px-4 py-2.5 font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
        >
          {enCours ? "Création…" : "Créer mon commerce"}
        </button>
      </form>
    </div>
  );
}
