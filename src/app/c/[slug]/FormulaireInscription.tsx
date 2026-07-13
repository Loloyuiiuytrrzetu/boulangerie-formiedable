"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inscrireClient } from "./actions";
import { abonnerAuxNotifications } from "@/lib/abonnement-push";

// Première visite : téléphone + nom + acceptation des notifications
// (obligatoire — pour recevoir les promotions et alertes de récompenses).
// L'inscription et l'abonnement aux notifications se font en un seul clic.
export function FormulaireInscription({
  slug,
  couleur,
  restaurantId,
  vapidPublicKey,
}: {
  slug: string;
  couleur: string;
  restaurantId: string;
  vapidPublicKey: string | null;
}) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [avertissement, setAvertissement] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const [notifs, setNotifs] = useState(true);

  function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    setAvertissement(null);
    const formData = new FormData(e.currentTarget);

    // On tente l'abonnement push AVANT toute action asynchrone longue,
    // pour préserver le "user gesture" nécessaire à la popup navigateur.
    const promesseAbonnement = notifs
      ? abonnerAuxNotifications(restaurantId, vapidPublicKey)
      : Promise.resolve({ statut: "refuse" as const });

    startTransition(async () => {
      const resAbonnement = await promesseAbonnement;
      // On mémorise le choix côté client pour ne plus reproposer la bannière
      if (typeof window !== "undefined") {
        if (resAbonnement.statut === "abonne")
          localStorage.removeItem(`walletiz_notif_refus_${slug}`);
        else if (resAbonnement.statut === "refuse")
          localStorage.setItem(`walletiz_notif_refus_${slug}`, "1");
      }

      const resultat = await inscrireClient(slug, formData);
      if (resultat?.erreur) {
        setErreur(resultat.erreur);
        return;
      }

      // Message informatif si l'abonnement n'a pas fonctionné, mais on
      // laisse quand même le client continuer vers sa page.
      if (resAbonnement.statut === "ios-install") {
        setAvertissement(
          "Pour recevoir les notifications sur iPhone, ajoutez ensuite cette page à votre écran d'accueil (bouton Partager → « Sur l'écran d'accueil »)."
        );
      } else if (resAbonnement.statut === "non-supporte") {
        setAvertissement(
          "Votre navigateur ne supporte pas les notifications. Vous ne recevrez pas les promotions du commerce."
        );
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
      <h2 className="text-lg font-bold text-stone-900">Bienvenue ! 👋</h2>

      <form onSubmit={soumettre} className="mt-5 space-y-4">
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

        <label className="flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={notifs}
            onChange={(e) => setNotifs(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-stone-800"
          />
          <span>
            J&apos;accepte de recevoir les notifications de promotions et
            événements de ce commerce. <em>(Obligatoire pour vous inscrire.)</em>
          </span>
        </label>

        {erreur && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
        )}
        {avertissement && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {avertissement}
          </p>
        )}

        <button
          type="submit"
          disabled={enCours || !notifs}
          className="w-full rounded-xl px-4 py-3.5 font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: couleur }}
        >
          {enCours ? "Création…" : "Créer ma carte de fidélité"}
        </button>
      </form>
    </div>
  );
}
