"use client";

import { useRef, useState, useTransition } from "react";
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
  const [saisieManuelle, setSaisieManuelle] = useState(false);
  const [enCours, startTransition] = useTransition();

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
          <label htmlFor="carte_id" className="mb-1.5 block text-sm font-medium text-stone-700">
            Carte
          </label>
          <select id="carte_id" name="carte_id" required className={classesInput}>
            {cartes.map((c) => (
              <option key={c.id} value={c.id}>
                {iconeEmoji(c.tampon_icone)} {c.titre} ({c.nombre_tampons_requis} tampons)
              </option>
            ))}
          </select>
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
          disabled={enCours}
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
