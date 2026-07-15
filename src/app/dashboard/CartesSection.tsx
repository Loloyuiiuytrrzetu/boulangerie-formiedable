"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ajouterRecompense,
  creerCarte,
  mettreAJourCarte,
  mettreAJourImageRecompense,
  retirerImageRecompense,
  retirerImageTampon,
  supprimerCarte,
  supprimerRecompense,
} from "./actions";
import { TAMPON_ICONES, iconeEmoji } from "@/lib/icons";
import type { Carte, Recompense } from "@/lib/types";
import { compresserChampsImage } from "@/lib/compresser-image";
import { useTDash } from "@/lib/langue-dashboard";

const classesInput =
  "w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200";

// --- Champs communs création / édition d'une carte ---
// Aperçu SVG d'une forme (utilisé dans le sélecteur)
function ApercuForme({ forme, actif }: { forme: string; actif: boolean }) {
  const stroke = actif ? "#7A1E2E" : "#a8a29e";
  const fill = actif ? "#7A1E2E" : "transparent";
  return (
    <svg viewBox="0 0 100 100" className="h-8 w-8">
      {forme === "carre" && (
        <rect x="10" y="10" width="80" height="80" rx="18" fill={fill} stroke={stroke} strokeWidth="4" />
      )}
      {forme === "cercle" && (
        <circle cx="50" cy="50" r="42" fill={fill} stroke={stroke} strokeWidth="4" />
      )}
      {forme === "hexagone" && (
        <polygon points="50,8 88,29 88,71 50,92 12,71 12,29" fill={fill} stroke={stroke} strokeWidth="4" />
      )}
      {forme === "etoile" && (
        <polygon points="50,5 61,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 39,38" fill={fill} stroke={stroke} strokeWidth="4" />
      )}
    </svg>
  );
}

// Formes du tampon. Le libellé est traduit via useTDash au moment du rendu.
const FORMES: { cle: "carre" | "cercle" | "hexagone" | "etoile" }[] = [
  { cle: "carre" },
  { cle: "cercle" },
  { cle: "hexagone" },
  { cle: "etoile" },
];

function ChampsCarte({
  carte,
  titreDefaut,
}: {
  carte?: Carte;
  titreDefaut?: string;
}) {
  const t = useTDash();
  const [icone, setIcone] = useState(carte?.tampon_icone ?? "cafe");
  const [emojiCustom, setEmojiCustom] = useState(
    carte?.tampon_icone?.startsWith("custom:") ? carte.tampon_icone.slice(7) : ""
  );
  const [forme, setForme] = useState<"carre" | "cercle" | "hexagone" | "etoile">(
    carte?.tampon_forme ?? "carre"
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">
          {t("titre_carte")}
        </label>
        <input
          name="titre"
          required
          maxLength={60}
          defaultValue={carte?.titre ?? titreDefaut ?? ""}
          className={classesInput}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-stone-700">
          {t("icone_tampon")}
        </span>
        <input type="hidden" name="tampon_icone" value={icone} />
        {carte?.tampon_image_url && (
          <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Vous avez une image personnalisée active — les icônes ci-dessous
            sont ignorées. Retirez l&apos;image en bas du formulaire pour
            revenir aux icônes.
          </p>
        )}
        {/* Palette d'icônes prédéfinies (scrollable) */}
        <div
          className={`max-h-56 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-2 ${
            carte?.tampon_image_url ? "pointer-events-none opacity-40" : ""
          }`}
        >
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
            {Object.entries(TAMPON_ICONES).map(([cle, { emoji, label }]) => (
              <button
                key={cle}
                type="button"
                title={label}
                onClick={() => {
                  setIcone(cle);
                  setEmojiCustom("");
                }}
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

        {/* Emoji personnalisé — n'importe quel emoji que le clavier permet */}
        <div className="mt-3 rounded-xl border border-stone-200 bg-white p-3">
          <p className="text-xs font-semibold text-stone-700">
            Ou utilisez un autre emoji
          </p>
          <p className="mt-0.5 text-xs text-stone-400">
            Tapez ou collez un emoji ci-dessous (🍔, 🎂, 🐶, ⭐…).
          </p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              maxLength={4}
              value={emojiCustom}
              onChange={(e) => {
                const val = e.target.value;
                setEmojiCustom(val);
                if (val.trim()) setIcone(`custom:${val.trim()}`);
              }}
              placeholder="🍔"
              className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-center text-xl focus:border-bordeaux-500 focus:outline-none"
            />
            {emojiCustom.trim() && (
              <span
                className={`flex h-11 items-center justify-center rounded-xl border px-3 text-xl ${
                  icone === `custom:${emojiCustom.trim()}`
                    ? "border-bordeaux-700 bg-bordeaux-50 ring-2 ring-bordeaux-200"
                    : "border-stone-200 bg-white"
                }`}
              >
                {emojiCustom}
              </span>
            )}
          </div>
        </div>

        {/* Image personnalisée (remplace l'icône si présente) */}
        <div className="mt-3 rounded-xl border border-dashed border-stone-300 bg-white p-3">
          <p className="text-xs font-semibold text-stone-700">
            Ou importez votre propre image de tampon
          </p>
          <p className="mt-0.5 text-xs text-stone-400">
            Elle apparaîtra en gris pâle quand la case est vide, en couleur
            quand le tampon est obtenu. Fond transparent (PNG) recommandé.
          </p>
          {carte?.tampon_image_url && (
            <div className="mt-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={carte.tampon_image_url}
                alt="Tampon actuel"
                className="h-14 w-14 rounded-lg border border-stone-200 object-cover"
              />
              <span className="text-xs text-stone-500">Image active</span>
            </div>
          )}
          <input
            name="tampon_image"
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-xs text-stone-500 file:mr-2 file:rounded-lg file:border-0 file:bg-bordeaux-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-bordeaux-800 hover:file:bg-bordeaux-100"
          />
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-stone-700">
          {t("forme_tampon")}
        </span>
        <input type="hidden" name="tampon_forme" value={forme} />
        <div className="grid grid-cols-4 gap-2">
          {FORMES.map((f) => (
            <button
              key={f.cle}
              type="button"
              onClick={() => setForme(f.cle)}
              className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-xs font-medium transition ${
                forme === f.cle
                  ? "border-bordeaux-700 bg-bordeaux-50 text-bordeaux-800 ring-2 ring-bordeaux-200"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              }`}
            >
              <ApercuForme forme={f.cle} actif={forme === f.cle} />
              <span>{t(f.cle)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">
            {t("nombre_tampons_requis")} <span className="text-stone-400">(1-20)</span>
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
            {t("date_expiration")}
          </label>
          <input
            name="date_expiration"
            type="date"
            defaultValue={carte?.date_expiration ?? ""}
            className={classesInput}
          />
          <p className="mt-1 text-xs text-stone-400">
            Laissez vide pour une carte permanente. Si vous mettez une date,
            la carte disparaîtra automatiquement le lendemain de cette date.
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">
          {t("texte_bas_carte")}
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
  const t = useTDash();
  const router = useRouter();
  const formImage = useRef<HTMLFormElement>(null);
  const [enCours, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  function changerImage(formData: FormData) {
    setErreur(null);
    startTransition(async () => {
      await compresserChampsImage(formData, ["image"]);
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
          {t("supprimer")}
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
          {t("image_recompense")}
        </button>
        {recompense.image_url && (
          <button
            type="button"
            onClick={retirerImage}
            disabled={enCours}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100"
          >
            {t("supprimer")}
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
  aujourdHui,
}: {
  carte: Carte;
  recompenses: Recompense[];
  aujourdHui: string;
}) {
  const t = useTDash();
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
      await compresserChampsImage(formData, ["tampon_image"]);
      const r = await mettreAJourCarte(carte.id, formData);
      if (r?.erreur) setErreur(r.erreur);
      else {
        setSucces(true);
        router.refresh();
      }
    });
  }

  function supprimer() {
    if (!window.confirm(t("confirmer_suppression_carte"))) return;
    startTransition(async () => {
      const r = await supprimerCarte(carte.id);
      if (r?.erreur) setErreur(r.erreur);
      else router.refresh();
    });
  }

  function retirerTampon() {
    if (!window.confirm("Retirer l'image de tampon ? Vous reviendrez à l'icône choisie.")) return;
    startTransition(async () => {
      const r = await retirerImageTampon(carte.id);
      if (r?.erreur) setErreur(r.erreur);
      else router.refresh();
    });
  }

  function nouvelleRecompense(formData: FormData) {
    setErreur(null);
    startTransition(async () => {
      await compresserChampsImage(formData, ["image"]);
      const r = await ajouterRecompense(carte.id, formData);
      if (r?.erreur) setErreur(r.erreur);
      else {
        formRecompense.current?.reset();
        router.refresh();
      }
    });
  }

  // "Expirée" = calculé côté fuseau du commerce (jamais côté navigateur),
  // sinon une carte peut apparaître expirée un jour avant/après selon
  // l'endroit d'où on consulte.
  const expiree =
    carte.date_expiration !== null && carte.date_expiration < aujourdHui;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          {carte.tampon_image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={carte.tampon_image_url}
              alt=""
              className="h-8 w-8 rounded-lg object-cover"
            />
          ) : (
            <span className="text-2xl">{iconeEmoji(carte.tampon_icone)}</span>
          )}
          <div>
            <p className="font-semibold text-stone-900">{carte.titre}</p>
            <p className="text-xs text-stone-500">
              {carte.nombre_tampons_requis} · {recompenses.length} {t("recompenses").toLowerCase()}
              {carte.date_expiration &&
                ` · ${t("expire_le")} ${new Date(carte.date_expiration + "T00:00:00").toLocaleDateString()}`}
              {expiree && ` ${t("expiree")}`}
            </p>
          </div>
        </div>
        <span className="text-stone-400">{ouvert ? "▲" : "▼"}</span>
      </button>

      {ouvert && (
        <div className="border-t border-stone-100 px-5 py-5">
          <form key={`${carte.id}-${carte.tampon_icone}-${carte.tampon_forme}`} action={enregistrer}>
            <ChampsCarte carte={carte} />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={enCours}
                className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
              >
                {t("enregistrer")}
              </button>
              {carte.tampon_image_url && (
                <button
                  type="button"
                  onClick={retirerTampon}
                  disabled={enCours}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 disabled:opacity-60"
                >
                  {t("supprimer")}
                </button>
              )}
              <button
                type="button"
                onClick={supprimer}
                disabled={enCours}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                {t("supprimer")}
              </button>
              {succes && <span className="text-sm text-green-600">{t("enregistre")}</span>}
            </div>
          </form>

          {/* ----- Récompenses de la carte ----- */}
          <div className="mt-6 rounded-xl bg-stone-50 p-4">
            <h4 className="text-sm font-bold text-stone-900">
              🎁 {t("recompenses")}
            </h4>

            {recompenses.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">
                —
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
                  {t("ajouter_recompense")}
                </button>
              </div>
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
  nomCommerce,
  aujourdHui,
}: {
  cartes: Carte[];
  recompenses: Recompense[];
  nomCommerce: string;
  aujourdHui: string;
}) {
  const t = useTDash();
  const router = useRouter();
  const [creation, setCreation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  function creer(formData: FormData) {
    setErreur(null);
    startTransition(async () => {
      await compresserChampsImage(formData, ["tampon_image"]);
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
          <h2 className="text-lg font-bold text-stone-900">{t("cartes_de_fidelite")}</h2>
        </div>
        <button
          type="button"
          onClick={() => setCreation(!creation)}
          className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700"
        >
          {creation ? t("annuler") : t("nouvelle_carte")}
        </button>
      </div>

      {creation && (
        <form action={creer} className="rounded-2xl border-2 border-dashed border-bordeaux-200 bg-white p-5">
          <ChampsCarte titreDefaut={`Carte de fidélité ${nomCommerce}`} />
          {erreur && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
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

      {cartes.length === 0 && !creation ? (
        <p className="rounded-2xl border border-stone-200 bg-white px-5 py-6 text-sm text-stone-500">
          {t("aucune_carte_creee")}
        </p>
      ) : (
        cartes.map((carte) => (
          <BlocCarte
            key={carte.id}
            carte={carte}
            recompenses={recompenses.filter((r) => r.carte_id === carte.id)}
            aujourdHui={aujourdHui}
          />
        ))
      )}
    </section>
  );
}
