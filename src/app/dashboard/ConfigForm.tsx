"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { mettreAJourConfig } from "./actions";
import { SelecteurCouleur } from "./SelecteurCouleur";
import type { Restaurant } from "@/lib/types";

// Identité du commerce : nom, logo, image de fond, couleurs
export function ConfigForm({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [enCours, startTransition] = useTransition();

  function soumettre(formData: FormData) {
    setErreur(null);
    setSucces(false);
    startTransition(async () => {
      const resultat = await mettreAJourConfig(formData);
      if (resultat?.erreur) setErreur(resultat.erreur);
      else {
        setSucces(true);
        router.refresh(); // recharger avec les nouvelles images
      }
    });
  }

  const classesInput =
    "w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200";
  const classesFichier =
    "block w-full text-sm text-stone-500 file:mr-3 file:rounded-lg file:border-0 file:bg-bordeaux-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-bordeaux-800 hover:file:bg-bordeaux-100";

  // key sur restaurant.id : force la ré-initialisation quand les données changent
  return (
    <form
      key={restaurant.id}
      action={soumettre}
      className="rounded-2xl border border-stone-200 bg-white p-6"
    >
      <h2 className="text-lg font-bold text-stone-900">Mon commerce</h2>
      <p className="mt-1 text-sm text-stone-500">
        L&apos;identité visuelle de votre page client.
      </p>

      <div className="mt-6 space-y-6">
        <div>
          <label htmlFor="nom" className="mb-1.5 block text-sm font-medium text-stone-700">
            Nom du commerce
          </label>
          <input
            id="nom"
            name="nom"
            required
            maxLength={80}
            defaultValue={restaurant.nom}
            className={classesInput}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="logo" className="mb-1.5 block text-sm font-medium text-stone-700">
              Logo
            </label>
            {restaurant.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={restaurant.logo_url}
                alt="Logo actuel"
                className="mb-2 h-20 w-20 rounded-xl border border-stone-200 object-cover"
              />
            )}
            <input id="logo" name="logo" type="file" accept="image/*" className={classesFichier} />
          </div>
          <div>
            <label htmlFor="fond" className="mb-1.5 block text-sm font-medium text-stone-700">
              Image de fond
            </label>
            {restaurant.fond_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={restaurant.fond_url}
                alt="Image de fond actuelle"
                className="mb-2 h-20 w-full rounded-xl border border-stone-200 object-cover"
              />
            )}
            <input id="fond" name="fond" type="file" accept="image/*" className={classesFichier} />
          </div>
        </div>
        <p className="-mt-3 text-xs text-stone-400">
          Images, 4 Mo maximum chacune. Si une image de fond est chargée, elle
          remplace la couleur principale sur votre page.
        </p>

        <SelecteurCouleur
          name="couleur"
          initial={restaurant.couleur}
          label="Couleur principale"
          description="Utilisée pour vos tampons, boutons et détails."
        />

        <SelecteurCouleur
          name="couleur_qr"
          initial={restaurant.couleur_qr ?? "#380B15"}
          label="Couleur de votre QR code"
          description="La couleur des carrés du QR code affiché en caisse."
        />
      </div>

      {erreur && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
      )}
      {succes && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Enregistré ✓
        </p>
      )}

      <button
        type="submit"
        disabled={enCours}
        className="mt-6 rounded-lg bg-bordeaux-800 px-6 py-2.5 font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
      >
        {enCours ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
