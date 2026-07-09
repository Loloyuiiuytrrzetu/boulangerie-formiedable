"use client";

import { useRef, useState, useTransition } from "react";
import { attribuerTampons } from "../actions";
import { iconeEmoji } from "@/lib/icons";
import type { Carte } from "@/lib/types";

export function ScannerForm({
  cartes,
  telephonePrecharge = "",
}: {
  cartes: Carte[];
  telephonePrecharge?: string;
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

  return (
    <form ref={formRef} action={envoyer} className="mt-6 space-y-4">
      <div>
        <label htmlFor="telephone" className="mb-1.5 block text-sm font-medium text-stone-700">
          Téléphone du client
        </label>
        <input
          id="telephone"
          name="telephone"
          type="tel"
          inputMode="tel"
          required
          defaultValue={telephonePrecharge}
          placeholder="06 12 34 56 78"
          className={classesInput}
        />
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

      {erreur && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
      )}
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
    </form>
  );
}
