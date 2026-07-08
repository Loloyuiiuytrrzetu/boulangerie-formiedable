"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inscrireClient, activerNotifications } from "./actions";

// Première visite : le client entre uniquement son numéro de téléphone.
// L'activation des notifications est proposée ensuite, sans jamais bloquer.
export function FormulaireInscription({
  slug,
  couleur,
}: {
  slug: string;
  couleur: string;
}) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [inscrit, setInscrit] = useState(false);
  const [enCours, startTransition] = useTransition();

  function soumettre(formData: FormData) {
    setErreur(null);
    startTransition(async () => {
      const resultat = await inscrireClient(slug, formData);
      if (resultat?.erreur) {
        setErreur(resultat.erreur);
      } else {
        setInscrit(true); // on propose d'abord les notifications
      }
    });
  }

  async function repondreNotifications(accepte: boolean) {
    if (accepte && typeof Notification !== "undefined") {
      try {
        const permission = await Notification.requestPermission();
        await activerNotifications(slug, permission === "granted");
      } catch {
        // le refus ou l'absence de support ne bloque jamais
      }
    }
    router.refresh(); // affiche la carte de fidélité
  }

  if (inscrit) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xl">
        <p className="text-4xl">🔔</p>
        <h2 className="mt-3 text-lg font-bold text-stone-900">
          Votre carte est créée !
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          Souhaitez-vous être averti(e) quand une récompense vous attend ?
          C&apos;est facultatif.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => repondreNotifications(true)}
            className="rounded-xl px-4 py-3 font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: couleur }}
          >
            Activer les notifications
          </button>
          <button
            onClick={() => repondreNotifications(false)}
            className="rounded-xl px-4 py-3 text-sm font-medium text-stone-500 transition hover:bg-stone-50"
          >
            Plus tard
          </button>
        </div>
      </div>
    );
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
