"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  creerSection,
  modifierSection,
  reordonnerSections,
  supprimerSection,
} from "./actions";
import type { Section } from "@/lib/types";
import { useTDash } from "@/lib/langue-dashboard";
import { useConfirmation } from "@/components/useConfirmation";

const classesInput =
  "w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200";

function ChampsSection({ section }: { section?: Partial<Section> }) {
  const t = useTDash();
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">{t("titre_section")}</label>
        <input
          name="titre"
          required
          maxLength={30}
          defaultValue={section?.titre ?? ""}
          placeholder=""
          className={classesInput}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          {t("texte_section")}
        </label>
        <textarea
          name="texte"
          rows={3}
          defaultValue={section?.texte ?? ""}
          className={classesInput}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            {t("lien_url")}
          </label>
          <input
            name="lien_url"
            type="url"
            defaultValue={section?.lien_url ?? ""}
            placeholder="https://…"
            className={classesInput}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            {t("lien_libelle")}
          </label>
          <input
            name="lien_libelle"
            maxLength={30}
            defaultValue={section?.lien_libelle ?? ""}
            placeholder=""
            className={classesInput}
          />
        </div>
      </div>
    </div>
  );
}

function BlocSection({
  section,
  estPremier,
  estDernier,
  onMonter,
  onDescendre,
  reordEnCours,
}: {
  section: Section;
  estPremier: boolean;
  estDernier: boolean;
  onMonter: () => void;
  onDescendre: () => void;
  reordEnCours: boolean;
}) {
  const t = useTDash();
  const { confirmer, confirmationUI } = useConfirmation();
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [enCours, startTransition] = useTransition();

  function enregistrer(formData: FormData) {
    setErreur(null); setSucces(false);
    startTransition(async () => {
      const r = await modifierSection(section.id, formData);
      if (r?.erreur) setErreur(r.erreur);
      else { setSucces(true); router.refresh(); }
    });
  }

  async function supprimer() {
    if (
      !(await confirmer({
        message: t("supprimer") + " ?",
        confirmer: t("supprimer"),
        annuler: t("annuler"),
      }))
    )
      return;
    startTransition(async () => {
      const r = await supprimerSection(section.id);
      if (r?.erreur) setErreur(r.erreur);
      else router.refresh();
    });
  }

  const badgeType =
    section.type === "cartes"
      ? `💳 ${t("cartes_de_fidelite")}`
      : section.type === "info"
        ? `ℹ️ ${t("info_qr")}`
        : `📝 ${t("personnalisee")}`;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white">
      {confirmationUI}
      <div className="flex items-center gap-1 px-2 py-2 sm:gap-2 sm:px-3">
        {/* Flèches de réordonnancement : montent / descendent la section.
            Le changement est instantané à l'écran puis sauvegardé en base. */}
        <div className="flex shrink-0 flex-col">
          <button
            type="button"
            onClick={onMonter}
            disabled={estPremier || reordEnCours}
            aria-label={t("monter")}
            title={t("monter")}
            className="flex h-6 w-8 items-center justify-center rounded text-stone-500 transition hover:bg-stone-100 hover:text-bordeaux-700 disabled:opacity-25"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={onDescendre}
            disabled={estDernier || reordEnCours}
            aria-label={t("descendre")}
            title={t("descendre")}
            className="flex h-6 w-8 items-center justify-center rounded text-stone-500 transition hover:bg-stone-100 hover:text-bordeaux-700 disabled:opacity-25"
          >
            ▼
          </button>
        </div>
        <button
          type="button"
          onClick={() => setOuvert(!ouvert)}
          className="flex min-w-0 flex-1 items-center justify-between py-2 pr-3 text-left"
        >
          <div className="min-w-0">
            <p className="truncate font-semibold text-stone-900">
              {section.type === "cartes"
                ? t("cartes_de_fidelite")
                : section.type === "info"
                  ? t("info_qr")
                  : section.titre}
            </p>
            <p className="truncate text-xs text-stone-500">
              {badgeType}
              {!section.supprimable && ` · ${t("non_supprimable")}`}
            </p>
          </div>
          <span className="ml-2 shrink-0 text-stone-400">{ouvert ? "▲" : "▼"}</span>
        </button>
      </div>

      {ouvert && (
        <div className="border-t border-stone-100 px-5 py-5">
          {section.type === "cartes" ? (
            <form id={`form-section-${section.id}`} action={enregistrer} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  {t("titre_section")}
                </label>
                <input
                  name="titre"
                  required
                  maxLength={30}
                  defaultValue={section.titre}
                  className={classesInput}
                />
              </div>
              <p className="text-xs text-stone-500">
                {t("vous_pouvez_seulement_changer_titre")}
              </p>
            </form>
          ) : section.type === "info" ? (
            <form id={`form-section-${section.id}`} action={enregistrer} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  {t("titre_section")}
                </label>
                <input
                  name="titre"
                  required
                  maxLength={30}
                  defaultValue={section.titre}
                  className={classesInput}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  {t("texte_section")}
                </label>
                <textarea
                  name="texte"
                  rows={3}
                  defaultValue={section.texte ?? ""}
                  className={classesInput}
                />
              </div>
              <input type="hidden" name="lien_url" value="" />
              <input type="hidden" name="lien_libelle" value="" />
              <p className="text-xs text-stone-500">
                {t("vous_pouvez_seulement_changer_titre")}
              </p>
            </form>
          ) : (
            <form id={`form-section-${section.id}`} action={enregistrer}>
              <ChampsSection section={section} />
            </form>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              disabled={enCours}
              onClick={() => {
                // Soumission FIABLE par id (le bouton est hors du <form>) :
                // requestSubmit déclenche l'action serveur, sur mobile ET
                // ordinateur. L'ancienne version cherchait le form au mauvais
                // endroit du DOM → rien ne se passait sur téléphone.
                const form = document.getElementById(
                  `form-section-${section.id}`
                ) as HTMLFormElement | null;
                form?.requestSubmit();
              }}
              className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
            >
              {t("enregistrer")}
            </button>
            {section.supprimable && (
              <button
                type="button"
                onClick={supprimer}
                disabled={enCours}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                {t("supprimer")}
              </button>
            )}
            {succes && <span className="text-sm text-green-600">{t("enregistre")}</span>}
          </div>

          {erreur && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function SectionsSection({ sections }: { sections: Section[] }) {
  const t = useTDash();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [creation, setCreation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  // Ordre affiché géré localement pour un réordonnancement INSTANTANÉ (avant
  // même la réponse serveur). On resynchronise dès que la liste venant du
  // serveur change — non seulement l'ORDRE ou le nombre de sections, mais
  // AUSSI le CONTENU (titre, texte, liens). Sans le contenu dans la
  // signature, modifier une section ne rafraîchissait pas l'affichage (le
  // titre restait figé) tant qu'un ajout/suppression ne forçait pas la
  // resynchro — ce qui donnait l'impression que l'enregistrement était perdu.
  const [ordreLocal, setOrdreLocal] = useState<Section[]>(sections);
  const [reordEnCours, startReord] = useTransition();
  const signature = sections
    .map(
      (s) =>
        `${s.id}:${s.ordre}:${s.titre}:${s.texte ?? ""}:${s.lien_url ?? ""}:${s.lien_libelle ?? ""}`
    )
    .join("|");
  useEffect(() => {
    setOrdreLocal(sections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  function deplacer(index: number, sens: -1 | 1) {
    const cible = index + sens;
    if (cible < 0 || cible >= ordreLocal.length) return;
    const nouvel = [...ordreLocal];
    [nouvel[index], nouvel[cible]] = [nouvel[cible], nouvel[index]];
    setOrdreLocal(nouvel); // instantané à l'écran
    const ids = nouvel.map((s) => s.id);
    startReord(async () => {
      const r = await reordonnerSections(ids);
      if (r?.erreur) {
        setErreur(r.erreur);
        setOrdreLocal(sections); // on annule visuellement en cas d'échec
      } else {
        router.refresh();
      }
    });
  }

  function creer(formData: FormData) {
    setErreur(null);
    startTransition(async () => {
      const r = await creerSection(formData);
      if (r?.erreur) setErreur(r.erreur);
      else {
        setCreation(false);
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">{t("sections_de_ma_page")}</h2>
          <p className="text-sm text-stone-500">
            {t("sections_desc")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreation(!creation)}
          className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700"
        >
          {creation ? t("annuler") : t("nouvelle_section")}
        </button>
      </div>

      {creation && (
        <form ref={formRef} action={creer} className="rounded-2xl border-2 border-dashed border-bordeaux-200 bg-white p-5">
          <ChampsSection />
          {erreur && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
          )}
          <button
            type="submit"
            disabled={enCours}
            className="mt-4 rounded-lg bg-bordeaux-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
          >
            {enCours ? "…" : t("creer")}
          </button>
        </form>
      )}

      {ordreLocal.map((s, index) => (
        <BlocSection
          key={s.id}
          section={s}
          estPremier={index === 0}
          estDernier={index === ordreLocal.length - 1}
          onMonter={() => deplacer(index, -1)}
          onDescendre={() => deplacer(index, 1)}
          reordEnCours={reordEnCours}
        />
      ))}
    </section>
  );
}
