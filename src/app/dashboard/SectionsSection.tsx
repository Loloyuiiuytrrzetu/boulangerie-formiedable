"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { creerSection, modifierSection, supprimerSection } from "./actions";
import type { Section } from "@/lib/types";

const classesInput =
  "w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200";

function ChampsSection({ section }: { section?: Partial<Section> }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Titre de la section</label>
        <input
          name="titre"
          required
          maxLength={30}
          defaultValue={section?.titre ?? ""}
          placeholder="Ex : Avis, Menu, News, E-shop…"
          className={classesInput}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          Texte <span className="text-stone-400">(optionnel)</span>
        </label>
        <textarea
          name="texte"
          rows={3}
          defaultValue={section?.texte ?? ""}
          placeholder="Ex : Laissez-nous un avis sur votre passage."
          className={classesInput}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Lien URL <span className="text-stone-400">(optionnel)</span>
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
            Libellé du bouton
          </label>
          <input
            name="lien_libelle"
            maxLength={30}
            defaultValue={section?.lien_libelle ?? ""}
            placeholder="Ex : Laisser un avis"
            className={classesInput}
          />
        </div>
      </div>
    </div>
  );
}

function BlocSection({ section }: { section: Section }) {
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

  function supprimer() {
    if (!window.confirm(`Supprimer la section « ${section.titre} » ?`)) return;
    startTransition(async () => {
      const r = await supprimerSection(section.id);
      if (r?.erreur) setErreur(r.erreur);
      else router.refresh();
    });
  }

  const badgeType =
    section.type === "cartes"
      ? "💳 Cartes"
      : section.type === "info"
        ? "ℹ️ Info + QR code"
        : "📝 Personnalisée";

  return (
    <div className="rounded-2xl border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="font-semibold text-stone-900">{section.titre}</p>
          <p className="text-xs text-stone-500">
            {badgeType}
            {!section.supprimable && " · non supprimable"}
          </p>
        </div>
        <span className="text-stone-400">{ouvert ? "▲" : "▼"}</span>
      </button>

      {ouvert && (
        <div className="border-t border-stone-100 px-5 py-5">
          {section.type === "cartes" ? (
            <form action={enregistrer} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Titre de la section
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
                Cette section affiche automatiquement toutes vos cartes de fidélité — le
                contenu se met à jour tout seul. Vous pouvez seulement en changer le titre.
              </p>
            </form>
          ) : section.type === "info" ? (
            <form action={enregistrer} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  Titre de la section
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
                  Texte affiché avec le QR code du client
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
                Le QR code personnel du client s&apos;affiche automatiquement dans cette
                section. Vous ou votre sous-compte le scannez pour attribuer des tampons.
              </p>
            </form>
          ) : (
            <form action={enregistrer}>
              <ChampsSection section={section} />
            </form>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              form={undefined}
              type="submit"
              disabled={enCours}
              onClick={(e) => {
                const form = (e.currentTarget as HTMLButtonElement).closest("div")?.querySelector("form");
                if (form) (form as HTMLFormElement).requestSubmit();
              }}
              className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
            >
              Enregistrer
            </button>
            {section.supprimable && (
              <button
                type="button"
                onClick={supprimer}
                disabled={enCours}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                Supprimer
              </button>
            )}
            {succes && <span className="text-sm text-green-600">Enregistré ✓</span>}
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
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [creation, setCreation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

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
          <h2 className="text-lg font-bold text-stone-900">Sections de ma page</h2>
          <p className="text-sm text-stone-500">
            Rajouter des onglets à la page d&apos;accueil de vos clients pour
            faire passer une information ou annoncer un événement.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreation(!creation)}
          className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700"
        >
          {creation ? "Annuler" : "+ Nouvelle section"}
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
            {enCours ? "Création…" : "Créer la section"}
          </button>
        </form>
      )}

      {sections.map((s) => (
        <BlocSection key={s.id} section={s} />
      ))}
    </section>
  );
}
