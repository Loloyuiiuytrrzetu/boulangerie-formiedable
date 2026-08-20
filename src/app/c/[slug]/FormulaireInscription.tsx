"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inscrireClient } from "./actions";
import { reinitialiserPromptInstallation } from "./InstallationIOS";
import { useLangue, useT } from "@/lib/langue";
import { LANGUES } from "@/lib/i18n";

// Première visite : téléphone + nom + langue. On NE demande PAS le
// consentement notifications ici : sur iPhone elles ne fonctionnent qu'une
// fois la page ajoutée à l'écran d'accueil, donc forcer la case à
// l'inscription n'a pas de sens. Les notifications sont proposées APRÈS
// l'inscription (bannière d'invitation + guide « ajouter à l'écran d'accueil »
// dans l'espace client), au moment où le client peut réellement les activer.
export function FormulaireInscription({
  slug,
  couleur,
}: {
  slug: string;
  couleur: string;
}) {
  const t = useT();
  const { langue, setLangue } = useLangue();
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const [langueChoix, setLangueChoix] = useState(langue);

  useEffect(() => {
    setLangueChoix(langue);
  }, [langue]);

  function changerLangue(l: (typeof LANGUES)[number]["code"]) {
    setLangueChoix(l);
    setLangue(l); // application immédiate → toutes les strings du form changent
  }

  function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const resultat = await inscrireClient(slug, formData);
      if (resultat?.erreur) {
        setErreur(t(resultat.erreur as Parameters<typeof t>[0]));
        return;
      }

      // Le client vient de s'inscrire → on force l'onboarding PWA à réapparaître
      // (popup « Ajouter à l'écran d'accueil »). Qu'il la passe ou non, elle
      // reste ensuite accessible depuis l'onglet Info, et c'est là qu'il pourra
      // activer les notifications une fois la page installée.
      reinitialiserPromptInstallation();

      router.refresh();
    });
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
      <h2 className="text-lg font-bold text-stone-900">
        {t("bienvenue")} 👋
      </h2>

      <form onSubmit={soumettre} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="telephone"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            {t("telephone")}
          </label>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder={t("telephone_placeholder")}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-lg tracking-wide outline-none transition focus:ring-2"
            style={{ caretColor: couleur }}
          />
        </div>

        <div>
          <label
            htmlFor="identite"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            {t("nom_prenom")}
          </label>
          <input
            id="identite"
            name="identite"
            type="text"
            required
            autoComplete="name"
            maxLength={80}
            placeholder={t("nom_prenom_placeholder")}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:ring-2"
            style={{ caretColor: couleur }}
          />
        </div>

        {/* Sélecteur de langue — sous nom/prénom.
            Français par défaut, mais l'utilisateur peut choisir avant
            l'inscription : tout le formulaire s'adapte instantanément. */}
        <div>
          <label
            htmlFor="inscription-langue"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            {t("langue")} / Language / Idioma
          </label>
          <select
            id="inscription-langue"
            value={langueChoix}
            onChange={(e) =>
              changerLangue(
                e.target.value as (typeof LANGUES)[number]["code"]
              )
            }
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:ring-2"
            style={{ caretColor: couleur }}
          >
            {LANGUES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.drapeau} {l.nom}
              </option>
            ))}
          </select>
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
          {enCours ? t("creation_en_cours") : t("creer_carte")}
        </button>
      </form>
    </div>
  );
}
