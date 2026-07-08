"use client";

import { useState } from "react";
import { PALETTE } from "@/lib/palette";

// Palette de 24 couleurs atypiques + roue de couleur libre.
// La valeur choisie est envoyée via un input caché nommé `name`.
export function SelecteurCouleur({
  name,
  initial,
  label,
  description,
}: {
  name: string;
  initial: string;
  label: string;
  description?: string;
}) {
  const [couleur, setCouleur] = useState(initial);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-stone-700">{label}</label>
      {description && <p className="mb-2 text-xs text-stone-400">{description}</p>}
      <input type="hidden" name={name} value={couleur} />

      <div className="grid grid-cols-8 gap-1.5">
        {PALETTE.map((p) => (
          <button
            key={p.hex}
            type="button"
            title={p.nom}
            onClick={() => setCouleur(p.hex)}
            aria-label={`Choisir ${p.nom}`}
            className={`h-8 w-8 rounded-full border-2 transition ${
              couleur.toLowerCase() === p.hex.toLowerCase()
                ? "border-stone-900 ring-2 ring-offset-2 ring-offset-white ring-stone-300 scale-110"
                : "border-white shadow-sm hover:scale-105"
            }`}
            style={{ backgroundColor: p.hex }}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-lg border border-stone-200 px-3 py-2">
        <input
          type="color"
          aria-label="Couleur personnalisée"
          value={couleur}
          onChange={(e) => setCouleur(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-stone-200 bg-white p-0.5"
        />
        <span className="font-mono text-sm text-stone-600">{couleur.toUpperCase()}</span>
        <span className="ml-auto text-xs text-stone-400">ou choisissez la vôtre</span>
      </div>
    </div>
  );
}
