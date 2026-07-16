"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { mettreAJourConfig } from "./actions";
import { SelecteurCouleur } from "./SelecteurCouleur";
import { ApercuAnimation } from "./ApercuAnimation";
import type { Restaurant } from "@/lib/types";
import { compresserChampsImage } from "@/lib/compresser-image";
import { useTDash } from "@/lib/langue-dashboard";
import { TIMEZONES_PAR_GROUPE } from "@/lib/timezones";

// Identité du commerce : nom, logo, image de fond, couleurs
export function ConfigForm({ restaurant }: { restaurant: Restaurant }) {
  const t = useTDash();
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [enCours, startTransition] = useTransition();
  const [animationCouleur, setAnimationCouleur] = useState(
    restaurant.animation_couleur ?? "#FFD700"
  );
  const [apercuLogo, setApercuLogo] = useState<string | null>(null);
  const [apercuFond, setApercuFond] = useState<string | null>(null);
  const [nomLogo, setNomLogo] = useState<string | null>(null);
  const [nomFond, setNomFond] = useState<string | null>(null);

  function previsualiser(
    fichier: File | null,
    setterApercu: (v: string | null) => void,
    setterNom: (v: string | null) => void
  ) {
    if (!fichier) {
      setterApercu(null);
      setterNom(null);
      return;
    }
    setterNom(fichier.name);
    const reader = new FileReader();
    reader.onload = (e) => setterApercu((e.target?.result as string) ?? null);
    reader.readAsDataURL(fichier);
  }

  function soumettre(formData: FormData) {
    setErreur(null);
    setSucces(false);
    startTransition(async () => {
      await compresserChampsImage(formData, ["logo", "fond"]);
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

  // key inclut animation_recompense : après une sauvegarde, si le champ a
  // changé en base, le form est remonté et le <select> reprend la nouvelle
  // valeur au lieu de garder l'ancien defaultValue.
  return (
    <form
      key={`${restaurant.id}-${restaurant.animation_recompense ?? "rayons"}-${
        restaurant.tampon_par_carte !== false
      }-${restaurant.tampon_restaurateur_only === true}-${restaurant.timezone ?? ""}`}
      action={soumettre}
      className="rounded-2xl border border-stone-200 bg-white p-6"
    >
      <h2 className="text-lg font-bold text-stone-900">{t("mon_commerce")}</h2>
      <p className="mt-1 text-sm text-stone-500">
        {t("identite_visuelle")}
      </p>

      <div className="mt-6 space-y-6">
        <div>
          <label htmlFor="nom" className="mb-1.5 block text-sm font-medium text-stone-700">
            {t("nom_du_commerce")}
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
          <label htmlFor="timezone" className="mb-1.5 block text-sm font-medium text-stone-700">
            {t("region_fuseau")}
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={restaurant.timezone ?? "Europe/Paris"}
            className={classesInput}
          >
            {Object.entries(TIMEZONES_PAR_GROUPE).map(([groupe, liste]) => (
              <optgroup key={groupe} label={groupe}>
                {liste.map((tz) => (
                  <option key={tz.timezone} value={tz.timezone}>
                    {tz.region}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="mt-1 text-xs text-stone-400">{t("region_fuseau_desc")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="logo" className="mb-1.5 block text-sm font-medium text-stone-700">
              {t("logo")}
            </label>
            {(apercuLogo || restaurant.logo_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={apercuLogo || restaurant.logo_url!}
                alt="Aperçu logo"
                className="mb-2 h-20 w-20 rounded-xl border border-stone-200 object-cover"
              />
            )}
            <div className="flex items-center gap-2">
              <label
                htmlFor="logo"
                className="cursor-pointer rounded-lg bg-bordeaux-50 px-4 py-2 text-sm font-semibold text-bordeaux-800 transition hover:bg-bordeaux-100"
              >
                {t("choisir_fichier")}
              </label>
              <span className="text-sm text-stone-500 truncate max-w-[10rem]">
                {nomLogo ?? t("aucun_fichier")}
              </span>
              <input
                id="logo"
                name="logo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => previsualiser(e.target.files?.[0] ?? null, setApercuLogo, setNomLogo)}
                className="sr-only"
              />
            </div>
          </div>
          <div>
            <label htmlFor="fond" className="mb-1.5 block text-sm font-medium text-stone-700">
              {t("image_de_fond")}
            </label>
            {(apercuFond || restaurant.fond_url) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={apercuFond || restaurant.fond_url!}
                alt="Aperçu fond"
                className="mb-2 h-20 w-full rounded-xl border border-stone-200 object-cover"
              />
            )}
            <div className="flex items-center gap-2">
              <label
                htmlFor="fond"
                className="cursor-pointer rounded-lg bg-bordeaux-50 px-4 py-2 text-sm font-semibold text-bordeaux-800 transition hover:bg-bordeaux-100"
              >
                {t("choisir_fichier")}
              </label>
              <span className="text-sm text-stone-500 truncate max-w-[10rem]">
                {nomFond ?? t("aucun_fichier")}
              </span>
              <input
                id="fond"
                name="fond"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => previsualiser(e.target.files?.[0] ?? null, setApercuFond, setNomFond)}
                className="sr-only"
              />
            </div>
          </div>
        </div>
        <p className="-mt-3 text-xs text-stone-400">
          {t("images_max_taille")}
        </p>

        <SelecteurCouleur
          name="couleur"
          initial={restaurant.couleur}
          label={t("couleur_principale")}
          description=""
        />

        <SelecteurCouleur
          name="couleur_qr"
          initial={restaurant.couleur_qr ?? "#380B15"}
          label={t("couleur_qr")}
          description=""
        />

        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="tampon_par_carte"
              defaultChecked={restaurant.tampon_par_carte !== false}
              className="mt-0.5 h-4 w-4 shrink-0 accent-bordeaux-800"
            />
            <span className="text-sm text-stone-600">
              <strong>{t("un_tampon_par_carte")}</strong>
              <br />
              {t("un_tampon_par_carte_desc")}
            </span>
          </label>
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="tampon_restaurateur_only"
              defaultChecked={restaurant.tampon_restaurateur_only === true}
              className="mt-0.5 h-4 w-4 shrink-0 accent-bordeaux-800"
            />
            <span className="text-sm text-stone-600">
              <strong>{t("tampon_manuel_uniquement")}</strong>
              <br />
              {t("tampon_manuel_uniquement_desc")}
            </span>
          </label>
        </div>

        <div>
          <label
            htmlFor="animation_recompense"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            {t("animation_recompense")}
          </label>
          <p className="mb-2 text-xs text-stone-400">
            {t("animation_recompense_desc")}
          </p>
          <select
            id="animation_recompense"
            name="animation_recompense"
            defaultValue={restaurant.animation_recompense ?? "rayons"}
            className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200"
          >
            <option value="aucune">{t("aucune_animation")}</option>
            <option value="etoiles">{t("etoiles_scintillantes")}</option>
            <option value="ondes">{t("ondes_lumineuses")}</option>
            <option value="rayons">{t("rayons_eclatants")}</option>
            <option value="vague">{t("vague_coloree")}</option>
          </select>

          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-stone-700">
              {t("couleur_animation")}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="animation_couleur"
                value={animationCouleur}
                onChange={(e) => setAnimationCouleur(e.target.value)}
                className="h-11 w-16 cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
              />
              <input
                type="text"
                value={animationCouleur}
                onChange={(e) => setAnimationCouleur(e.target.value)}
                pattern="^#[0-9a-fA-F]{6}$"
                className="w-28 rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm uppercase focus:border-bordeaux-500 focus:outline-none"
              />
            </div>
          </div>

          <ApercuAnimation selectId="animation_recompense" couleur={animationCouleur} />
        </div>
      </div>

      {erreur && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
      )}
      {succes && (
        <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {t("enregistre")}
        </p>
      )}

      <button
        type="submit"
        disabled={enCours}
        className="mt-6 rounded-lg bg-bordeaux-800 px-6 py-2.5 font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
      >
        {enCours ? "…" : t("enregistrer")}
      </button>
    </form>
  );
}
