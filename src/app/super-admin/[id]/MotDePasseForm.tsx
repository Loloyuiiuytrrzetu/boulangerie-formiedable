"use client";

import { useRef, useState, useTransition } from "react";
import { changerMotDePasse } from "../actions";

// Outil support : réinitialiser le mot de passe d'un restaurateur
export function MotDePasseForm({ ownerId }: { ownerId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [enCours, startTransition] = useTransition();

  function soumettre(formData: FormData) {
    setErreur(null);
    setSucces(false);
    startTransition(async () => {
      const resultat = await changerMotDePasse(formData);
      if (resultat?.erreur) {
        setErreur(resultat.erreur);
      } else {
        setSucces(true);
        formRef.current?.reset();
      }
    });
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="font-bold text-stone-900">Réinitialiser le mot de passe</h2>
      <p className="mt-1 text-sm text-stone-500">
        À communiquer au restaurateur (support).
      </p>
      <form ref={formRef} action={soumettre} className="mt-4 flex flex-wrap items-center gap-3">
        <input type="hidden" name="owner_id" value={ownerId} />
        <input
          name="mot_de_passe"
          type="text"
          required
          minLength={8}
          placeholder="Nouveau mot de passe (8 car. min)"
          className="w-72 rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200"
        />
        <button
          type="submit"
          disabled={enCours}
          className="rounded-lg bg-bordeaux-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
        >
          {enCours ? "Mise à jour…" : "Mettre à jour"}
        </button>
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        {succes && <p className="text-sm text-green-600">Mot de passe mis à jour ✓</p>}
      </form>
    </section>
  );
}
