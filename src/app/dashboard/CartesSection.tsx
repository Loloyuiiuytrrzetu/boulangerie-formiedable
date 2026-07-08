"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ajouterRecompense,
  creerCarte,
  mettreAJourCarte,
  mettreAJourImageRecompense,
  retirerImageRecompense,
  supprimerCarte,
  supprimerRecompense,
} from "./actions";
import { TAMPON_ICONES, iconeEmoji } from "@/lib/icons";
import type { Carte, Recompense } from "@/lib/types";

const classesInput =
  "w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200";

// --- Champs communs création / édition d'une carte ---
function ChampsCarte({ carte }: { carte?: Carte }) {
  const [icone, setIcone] = useState(carte?.tampon_icone ?? "cafe");

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">
          Titre de la carte
        </label>
        <input
          name="titre"
          required
          maxLength={60}
          defaultValue={carte?.titre ?? ""}
          placeholder="Ex : Carte café, Carte midi…"
          className={classesInput}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-stone-700">Icône du tampon</span>
        <input type="hidden" name="tampon_icone" value={icone} />
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(TAMPON_ICONES).map(([cle, { emoji, label }]) => (
            <button
              key={cle}
              type="button"
              title={label}
              onClick={() => setIcone(cle)}
              className={`flex h-11 items-center justify-center rounded-xl border text-xl transition ${
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">
            Nombre de tampons <span className="text-stone-400">(1 à 20)</span>
          </label>
          <input
            name="nombre_tampons_requis"
            type="number"
            min={1}
            max={20}
            required
            defaultValue={carte?.nombre_tampons_requis ?? 10}
            className={classesInput}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">
            Date d&apos;expiration <span className="text-stone-400">(optionnel)</span>
          </label>
          <input
            name="date_expiration"
            type="date"
            defaultValue={carte?.date_expiration ?? ""}
            className={classesInput}
          />
          <p className="mt-1 text-xs text-stone-400">
            Vide = pas d&apos;expiration. La carte disparaît toute seule le lendemain.
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">
          Petit texte en bas de la carte <span className="text-stone-400">(optionnel)</span>
        </label>
        <input
          name="texte_bas"
          maxLength={120}
          defaultValue={carte?.texte_bas ?? ""}
          placeholder="Ex : Valable uniquement le midi, hors week-end…"
          className={classesInput}
        />
      </div>
    </div>
  );
}

// --- Ligne d'une récompense existante avec bouton image ---
function LigneRecompense({ recompense }: { recompense: Recompense }) {
  const router = useRouter();
  const formImage = useRef<HTMLFormElement>(null);
  const [enCours, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  function changerImage(formData: FormData) {
    setErreur(null);
    startTransition(async () => {
      const r = await mettreAJourImageRecompense(recompense.id, formData);
      if (r?.erreur) setErreur(r.erreur);
      else {
        formImage.current?.reset();
        router.refresh();
      }
    });
  }

  function retirerImage() {
    startTransition(async () => {
      const r = await retirerImageRecompense(recompense.id);
      if (r?.erreur) setErreur(r.erreur);
      else router.refresh();
    });
  }

  function retirer() {
    startTransition(async () => {
      const r = await supprimerRecompense(recompense.id);
      if (r?.erreur) setErreur(r.erreur);
      else router.refresh();
    });
  }

  return (
    <li className="rounded-lg border border-stone-200 bg-white p-3">
      <div className="flex items-center gap-3">
        {recompense.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recompense.image_url}
            alt=""
            className="h-14 w-14 shrink-0 rounded-lg border border-stone-100 object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-bordeaux-50 text-2xl">
            🎁
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800">
          {recompense.texte}
        </span>
        <button
          type="button"
          onClick={retirer}
          disabled={enCours}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
        >
          Retirer
        </button>
      </div>

      <form
        ref={formImage}
        action={changerImage}
        className="mt-2 flex flex-wrap items-center gap-2"
      >
        <input
          name="image"
          type="file"
          accept="image/*"
          className="block flex-1 text-xs text-stone-500 file:mr-2 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-bordeaux-800"
        />
        <button
          type="submit"
          disabled={enCours}
          className="rounded-lg bg-bordeaux-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
        >
          {recompense.image_url ? "Remplacer l'image" : "Ajouter une image"}
        </button>
        {recompense.image_url && (
          <button
            type="button"
            onClick={retirerImage}
            disabled={enCours}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100"
          >
            Retirer l&apos;image
          </button>
        )}
      </form>
      {erreur && <p className="mt-2 text-xs text-red-600">{erreur}</p>}
    </li>
  );
}

// --- Une carte existante : édition, récompenses, suppression ---
function BlocCarte({
  carte,
  recompenses,
}: {
  carte: Carte;
  recompenses: Recompense[];
}) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [enCours, startTransition] = useTransition();
  const formRecompense = useRef<HTMLFormElement>(null);

  function enregistrer(formData: FormData) {
    setErreur(null);
    setSucces(false);
    startTransition(async () => {
      const r = await mettreAJourCarte(carte.id, formData);
      if (r?.erreur) setErreur(r.erreur);
      else {
        setSucces(true);
        router.refresh();
      }
    });
  }

  function supprimer() {
    if (
      !window.confirm(
        `Supprimer la carte « ${carte.titre} » ?\n\nSes récompenses et les tampons accumulés par vos clients sur cette carte seront effacés.`
      )
    )
      return;
    startTransition(async () => {
      const r = await supprimerCarte(carte.id);
      if (r?.erreur) setErreur(r.erreur);
      else router.refresh();
    });
  }

  function nouvelleRecompense(formData: FormData) {
    setErreur(null);
    startTransition(async () => {
      const r = await ajouterRecompense(carte.id, formData);
      if (r?.erreur) setErreur(r.erreur);
      else {
        formRecompense.current?.reset();
        router.refresh();
      }
    });
  }

  const expiree =
    carte.date_expiration !== null &&
    carte.date_expiration < new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{iconeEmoji(carte.tampon_icone)}</span>
          <div>
            <p className="font-semibold text-stone-900">{carte.titre}</p>
            <p className="text-xs text-stone-500">
              {carte.nombre_tampons_requis} tampons · {recompenses.length} récompense
              {recompenses.length > 1 ? "s" : ""}
              {carte.date_expiration &&
                ` · expire le ${new Date(carte.date_expiration + "T00:00:00").toLocaleDateString("fr-FR")}`}
              {expiree && " ⚠️ expirée"}
            </p>
          </div>
        </div>
        <span className="text-stone-400">{ouvert ? "▲" : "▼"}</span>
      </button>

      {ouvert && (
        <div className="border-t border-stone-100 px-5 py-5">
          <form key={carte.id + carte.tampon_icone} action={enregistrer}>
            <ChampsCarte carte={carte} />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={enCours}
                className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
              >
                Enregistrer la carte
              </button>
              <button
                type="button"
                onClick={supprimer}
                disabled={enCours}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                Supprimer
              </button>
              {succes && <span className="text-sm text-green-600">Enregistré ✓</span>}
            </div>
          </form>

          {/* ----- Récompenses de la carte ----- */}
          <div className="mt-6 rounded-xl bg-stone-50 p-4">
            <h4 className="text-sm font-bold text-stone-900">
              🎁 Récompenses de cette carte
            </h4>
            <p className="mt-0.5 text-xs text-stone-500">
              Si plusieurs récompenses, le client choisit celle qu&apos;il veut
              (ce n&apos;est pas cumulé).
            </p>

            {recompenses.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">
                Aucune récompense pour l&apos;instant — ajoutez-en une ci-dessous.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {recompenses.map((r) => (
                  <LigneRecompense key={r.id} recompense={r} />
                ))}
              </ul>
            )}

            <form ref={formRecompense} action={nouvelleRecompense} className="mt-3 space-y-2">
              <input
                name="texte"
                required
                maxLength={120}
                placeholder="Ex : 1 café offert"
                className={classesInput}
              />
              <div className="flex flex-wrap items-center gap-2">
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="block flex-1 text-xs text-stone-500 file:mr-2 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-bordeaux-800"
                />
                <button
                  type="submit"
                  disabled={enCours}
                  className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
                >
                  Ajouter
                </button>
              </div>
              <p className="text-xs text-stone-400">
                Image optionnelle (4 Mo max) — vous pourrez la changer plus tard.
              </p>
            </form>
          </div>

          {erreur && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
          )}
        </div>
      )}
    </div>
  );
}

// --- Section complète : liste des cartes + création ---
export function CartesSection({
  cartes,
  recompenses,
}: {
  cartes: Carte[];
  recompenses: Recompense[];
}) {
  const router = useRouter();
  const [creation, setCreation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  function creer(formData: FormData) {
    setErreur(null);
    startTransition(async () => {
      const r = await creerCarte(formData);
      if (r?.erreur) setErreur(r.erreur);
      else {
        setCreation(false);
        router.refresh();
      }
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Mes cartes de fidélité</h2>
          <p className="text-sm text-stone-500">
            Vos clients les voient toutes sur votre page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreation(!creation)}
          className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700"
        >
          {creation ? "Annuler" : "+ Nouvelle carte"}
        </button>
      </div>

      {creation && (
        <form action={creer} className="rounded-2xl border-2 border-dashed border-bordeaux-200 bg-white p-5">
          <ChampsCarte />
          {erreur && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
          )}
          <button
            type="submit"
            disabled={enCours}
            className="mt-4 rounded-lg bg-bordeaux-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
          >
            {enCours ? "Création…" : "Créer la carte"}
          </button>
          <p className="mt-2 text-xs text-stone-400">
            Vous pourrez ajouter ses récompenses juste après la création.
          </p>
        </form>
      )}

      {cartes.length === 0 && !creation ? (
        <p className="rounded-2xl border border-stone-200 bg-white px-5 py-6 text-sm text-stone-500">
          Aucune carte pour l&apos;instant. Cliquez sur « + Nouvelle carte » pour créer la première.
        </p>
      ) : (
        cartes.map((carte) => (
          <BlocCarte
            key={carte.id}
            carte={carte}
            recompenses={recompenses.filter((r) => r.carte_id === carte.id)}
          />
        ))
      )}
    </section>
  );
}
