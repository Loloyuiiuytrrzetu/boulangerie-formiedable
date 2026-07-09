"use client";

import { useState } from "react";
import { PALETTE } from "@/lib/palette";

// Palette de 24 couleurs atypiques + roue de couleur libre.
// Affichée en barre coulissante horizontale pour ne pas envahir l'écran.
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

      <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-2">
        <span
          className="h-9 w-9 shrink-0 rounded-lg border border-stone-200"
          style={{ backgroundColor: couleur }}
          aria-label="Couleur choisie"
        />
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="flex gap-1.5">
            {PALETTE.map((p) => (
              <button
                key={p.hex}
                type="button"
                title={p.nom}
                onClick={() => setCouleur(p.hex)}
                aria-label={`Choisir ${p.nom}`}
                className={`h-8 w-8 shrink-0 rounded-full border-2 transition ${
                  couleur.toLowerCase() === p.hex.toLowerCase()
                    ? "border-stone-900 scale-110"
                    : "border-white shadow-sm hover:scale-105"
                }`}
                style={{ backgroundColor: p.hex }}
              />
            ))}
          </div>
        </div>
        <label
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed border-stone-300 text-xs font-semibold text-stone-500 hover:bg-stone-50"
          title="Couleur personnalisée"
        >
          🎨
          <input
            type="color"
            aria-label="Couleur personnalisée"
            value={couleur}
            onChange={(e) => setCouleur(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>
      <p className="mt-1 text-xs text-stone-400">
        Glissez pour voir toutes les couleurs · 🎨 pour la vôtre · valeur : <span className="font-mono">{couleur.toUpperCase()}</span>
      </p>
    </div>
  );
}
