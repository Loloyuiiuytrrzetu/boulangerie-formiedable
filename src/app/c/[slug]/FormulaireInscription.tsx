"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inscrireClient } from "./actions";
import { reinitialiserPromptInstallation } from "./InstallationIOS";
import { abonnerAuxNotifications } from "@/lib/abonnement-push";
import { useLangue, useT } from "@/lib/langue";
import { LANGUES } from "@/lib/i18n";

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
  const t = useT();
  const { langue, setLangue } = useLangue();
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [avertissement, setAvertissement] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const [notifs, setNotifs] = useState(true);
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
    setAvertissement(null);
    const formData = new FormData(e.currentTarget);

    // On tente l'abonnement push AVANT toute action asynchrone longue,
    // pour préserver le "user gesture" nécessaire à la popup navigateur.
    const promesseAbonnement = notifs
      ? abonnerAuxNotifications(restaurantId, vapidPublicKey)
      : Promise.resolve({ statut: "refuse" as const });

    startTransition(async () => {
      const resAbonnement = await promesseAbonnement;
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

      // Le client vient de s'inscrire → on force l'onboarding PWA à réapparaître
      // (popup « Ajouter à l'écran d'accueil »). Qu'il la passe ou non, elle
      // reste ensuite accessible depuis l'onglet Info.
      reinitialiserPromptInstallation();

      if (resAbonnement.statut === "ios-install") {
        setAvertissement(t("ios_install_pour_notifs"));
      } else if (resAbonnement.statut === "non-supporte") {
        setAvertissement(t("notifs_impossible"));
      }
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

        <label className="flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={notifs}
            onChange={(e) => setNotifs(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-stone-800"
          />
          <span>
            {t("accepter_notifs")} <em>{t("accepter_notifs_obligatoire")}</em>
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
          {enCours ? t("creation_en_cours") : t("creer_carte")}
        </button>
      </form>
    </div>
  );
}
