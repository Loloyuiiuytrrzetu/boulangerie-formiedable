"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { attribuerTampons } from "../actions";
import { iconeEmoji } from "@/lib/icons";
import type { Carte } from "@/lib/types";
import { ScannerCamera } from "./ScannerCamera";

// Deux modes :
//   1. Client déjà identifié (arrivé via ?c=<token>) → formulaire de tampons
//   2. Sinon → gros bouton "Scanner le QR code du client" + option cachée
//      pour saisir le téléphone à la main (rare)
export function ScannerForm({
  cartes,
  telephonePrecharge = "",
  identitePrecharge = null,
}: {
  cartes: Carte[];
  telephonePrecharge?: string;
  identitePrecharge?: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<null | {
    tampons: number;
    nouveaux_actuels: number;
    requis: number;
    recompenses_creees: number;
  }>(null);
  const [enCours, startTransition] = useTransition();
  const [carteChoisie, setCarteChoisie] = useState<Carte | null>(cartes[0] ?? null);

  useEffect(() => {
    // Si la liste des cartes change (nouvelle carte créée), on resynchronise
    // la sélection sur la première carte disponible.
    if (!cartes.find((c) => c.id === carteChoisie?.id)) {
      setCarteChoisie(cartes[0] ?? null);
    }
  }, [cartes, carteChoisie]);

  function envoyer(formData: FormData) {
    setErreur(null);
    setSucces(null);
    startTransition(async () => {
      const r = await attribuerTampons(formData);
      if (r?.erreur) setErreur(r.erreur);
      else if (r?.ok) {
        setSucces({
          tampons: r.tampons,
          nouveaux_actuels: r.nouveaux_actuels,
          requis: r.requis,
          recompenses_creees: r.recompenses_creees,
        });
        formRef.current?.reset();
      }
    });
  }

  const classesInput =
    "w-full rounded-lg border border-stone-300 px-3.5 py-3 text-base outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200";

  // Mode 1 : client identifié, formulaire d'attribution
  if (telephonePrecharge) {
    return (
      <form ref={formRef} action={envoyer} className="mt-6 space-y-4">
        <input type="hidden" name="telephone" value={telephonePrecharge} />
        <input type="hidden" name="carte_id" value={carteChoisie?.id ?? ""} />
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm">
          <p className="font-semibold text-green-800">✅ Client identifié</p>
          {identitePrecharge && (
            <p className="mt-0.5 text-sm font-semibold text-green-900">
              {identitePrecharge}
            </p>
          )}
          <p className="mt-0.5 font-mono text-xs text-green-700">
            {telephonePrecharge}
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">
            Carte
          </label>
          {/* Dropdown custom pour pouvoir afficher les images uploadées
              (l'élément natif <option> ne rend jamais d'images). */}
          <SelecteurCarte
            cartes={cartes}
            valeur={carteChoisie}
            onChange={setCarteChoisie}
          />
        </div>

        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-stone-700">
            Nombre de tampons à attribuer
          </label>
          <input
            id="nombre"
            name="nombre"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            required
            className={classesInput}
          />
        </div>

        {erreur && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}
        {succes && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            ✅ <strong>{succes.tampons} tampon{succes.tampons > 1 ? "s" : ""} attribué
            {succes.tampons > 1 ? "s" : ""}.</strong>
            <br />
            Carte : {succes.nouveaux_actuels} / {succes.requis}
            {succes.recompenses_creees > 0 && (
              <>
                <br />
                🎁 {succes.recompenses_creees} récompense
                {succes.recompenses_creees > 1 ? "s" : ""} créditée
                {succes.recompenses_creees > 1 ? "s" : ""} dans le compte du client !
              </>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={enCours || !carteChoisie}
          className="w-full rounded-xl bg-bordeaux-800 px-6 py-3 font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
        >
          {enCours ? "Attribution…" : "🎯 Attribuer les tampons"}
        </button>

        <a
          href="/dashboard/scanner"
          className="block text-center text-sm text-stone-500 hover:text-bordeaux-700"
        >
          ← Scanner un autre client
        </a>
      </form>
    );
  }

  // Mode 2 : pas de client encore identifié — scan par caméra
  return (
    <div className="mt-6 space-y-6">
      <ScannerCamera />
    </div>
  );
}

// Dropdown custom : identique visuellement à un <select> mais capable de
// rendre l'image de tampon uploadée par le restaurateur (vignette 32×32).
// Si la carte utilise juste une icône emoji, on affiche l'emoji.
function SelecteurCarte({
  cartes,
  valeur,
  onChange,
}: {
  cartes: Carte[];
  valeur: Carte | null;
  onChange: (c: Carte) => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [ouvert]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-left text-base outline-none transition hover:border-bordeaux-400 focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200"
      >
        {valeur ? (
          <VignetteEtLibelle carte={valeur} />
        ) : (
          <span className="text-stone-500">—</span>
        )}
        <span className="shrink-0 text-stone-400">{ouvert ? "▲" : "▼"}</span>
      </button>

      {ouvert && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-xl"
        >
          {cartes.map((c) => {
            const actif = c.id === valeur?.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setOuvert(false);
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                    actif
                      ? "bg-bordeaux-50 text-bordeaux-900"
                      : "hover:bg-stone-50"
                  }`}
                >
                  <VignetteEtLibelle carte={c} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Vignette 32×32 (image uploadée si présente, sinon emoji) + titre + tampons.
function VignetteEtLibelle({ carte }: { carte: Carte }) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-3">
      {carte.tampon_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={carte.tampon_image_url}
          alt=""
          className="h-8 w-8 shrink-0 rounded-md border border-stone-200 object-cover"
        />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-stone-100 text-lg">
          {iconeEmoji(carte.tampon_icone)}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-900">
        {carte.titre}
      </span>
      <span className="shrink-0 text-xs font-semibold text-stone-500">
        {carte.nombre_tampons_requis} tampons
      </span>
    </span>
  );
}
