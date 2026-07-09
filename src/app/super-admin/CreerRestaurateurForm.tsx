"use client";

import { useRef, useState, useTransition } from "react";
import { creerRestaurateur } from "./actions";
import { TIMEZONES } from "@/lib/timezones";

export function CreerRestaurateurForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [enCours, startTransition] = useTransition();

  function soumettre(formData: FormData) {
    setErreur(null);
    setSucces(false);
    startTransition(async () => {
      const resultat = await creerRestaurateur(formData);
      if (resultat?.erreur) {
        setErreur(resultat.erreur);
      } else {
        setSucces(true);
        formRef.current?.reset();
      }
    });
  }

  const classesInput =
    "w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200";

  return (
    <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="font-bold text-stone-900">Nouveau restaurateur</h2>
      <p className="mt-1 text-sm text-stone-500">
        Crée le compte de connexion et la fiche du commerce.
      </p>

      <form ref={formRef} action={soumettre} className="mt-5 space-y-4">
        <div>
          <label htmlFor="nom_commerce" className="mb-1.5 block text-sm font-medium text-stone-700">
            Nom du commerce
          </label>
          <input id="nom_commerce" name="nom_commerce" required maxLength={80} className={classesInput} placeholder="Café des Arts" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">
            Email du restaurateur
          </label>
          <input id="email" name="email" type="email" required className={classesInput} placeholder="contact@cafedesarts.fr" />
        </div>
        <div>
          <label htmlFor="timezone" className="mb-1.5 block text-sm font-medium text-stone-700">
            Région du commerce
          </label>
          <select
            id="timezone"
            name="timezone"
            required
            defaultValue="Europe/Paris"
            className={classesInput}
          >
            {TIMEZONES.map((t) => (
              <option key={t.timezone} value={t.timezone}>
                {t.region}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-stone-400">
            Détermine le fuseau horaire — un « tampon du jour » sera calculé
            selon l&apos;heure locale du commerce, pour des chiffres exacts.
          </p>
        </div>

        <div>
          <label htmlFor="mot_de_passe" className="mb-1.5 block text-sm font-medium text-stone-700">
            Mot de passe initial
          </label>
          <input id="mot_de_passe" name="mot_de_passe" type="text" required minLength={8} className={classesInput} placeholder="8 caractères minimum" />
        </div>

        {erreur && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
        )}
        {succes && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Compte restaurateur créé ✓
          </p>
        )}

        <button
          type="submit"
          disabled={enCours}
          className="w-full rounded-lg bg-bordeaux-800 px-4 py-2.5 font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
        >
          {enCours ? "Création…" : "Créer le compte"}
        </button>
      </form>
    </aside>
  );
}
