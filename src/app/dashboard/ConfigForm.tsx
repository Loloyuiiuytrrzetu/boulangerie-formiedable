"use client";

import { useState, useTransition } from "react";
import { mettreAJourConfig } from "./actions";
import { TAMPON_ICONES } from "@/lib/icons";
import type { Restaurant } from "@/lib/types";

export function ConfigForm({ restaurant }: { restaurant: Restaurant }) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [enCours, startTransition] = useTransition();
  const [couleur, setCouleur] = useState(restaurant.couleur);
  const [icone, setIcone] = useState(restaurant.tampon_icone);

  function soumettre(formData: FormData) {
    setErreur(null);
    setSucces(false);
    startTransition(async () => {
      const resultat = await mettreAJourConfig(formData);
      if (resultat?.erreur) setErreur(resultat.erreur);
      else setSucces(true);
    });
  }

  const classesInput =
    "w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200";

  return (
    <form action={soumettre} className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-bold text-stone-900">Ma carte de fidélité</h2>
      <p className="mt-1 text-sm text-stone-500">
        Personnalisez la page que vos clients voient en scannant le QR code.
      </p>

      <div className="mt-6 space-y-5">
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

        <div>
          <label htmlFor="logo" className="mb-1.5 block text-sm font-medium text-stone-700">
            Logo / photo de couverture
          </label>
          {restaurant.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={restaurant.logo_url}
              alt="Logo actuel"
              className="mb-2 h-20 w-20 rounded-xl border border-stone-200 object-cover"
            />
          )}
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-stone-500 file:mr-3 file:rounded-lg file:border-0 file:bg-bordeaux-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-bordeaux-800 hover:file:bg-bordeaux-100"
          />
          <p className="mt-1 text-xs text-stone-400">Image, 4 Mo maximum.</p>
        </div>

        <div>
          <label htmlFor="couleur" className="mb-1.5 block text-sm font-medium text-stone-700">
            Couleur principale de votre page
          </label>
          <div className="flex items-center gap-3">
            <input
              id="couleur"
              name="couleur"
              type="color"
              value={couleur}
              onChange={(e) => setCouleur(e.target.value)}
              className="h-11 w-16 cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
            />
            <span className="text-sm font-mono text-stone-500">{couleur}</span>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-stone-700">
            Icône du tampon
          </span>
          <input type="hidden" name="tampon_icone" value={icone} />
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(TAMPON_ICONES).map(([cle, { emoji, label }]) => (
              <button
                key={cle}
                type="button"
                title={label}
                onClick={() => setIcone(cle)}
                className={`flex h-12 items-center justify-center rounded-xl border text-2xl transition ${
                  icone === cle
                    ? "border-bordeaux-700 bg-bordeaux-50 ring-2 ring-bordeaux-200"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="nombre_tampons_requis"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Tampons requis pour la récompense
            </label>
            <select
              id="nombre_tampons_requis"
              name="nombre_tampons_requis"
              defaultValue={restaurant.nombre_tampons_requis}
              className={classesInput}
            >
              {[5, 6, 8, 10, 12, 15].map((n) => (
                <option key={n} value={n}>
                  {n} tampons
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="texte_recompense"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Récompense offerte
            </label>
            <input
              id="texte_recompense"
              name="texte_recompense"
              required
              maxLength={120}
              defaultValue={restaurant.texte_recompense}
              placeholder="Ex : 1 café offert"
              className={classesInput}
            />
          </div>
        </div>
      </div>

      {erreur && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
      )}
      {succes && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Configuration enregistrée ✓
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
