"use client";

import { useEffect, useRef, useState } from "react";
import { PALETTE } from "@/lib/palette";

// Sélecteur de couleur en menu déroulant :
//   - un bouton qui affiche la couleur choisie
//   - au clic, ouverture d'un menu qui liste les 24 pastilles + roue perso
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
  const [ouvert, setOuvert] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    if (!ouvert) return;
    function onClick(e: MouseEvent) {
      if (!conteneurRef.current?.contains(e.target as Node)) setOuvert(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [ouvert]);

  const nomCouleur =
    PALETTE.find((p) => p.hex.toLowerCase() === couleur.toLowerCase())?.nom ??
    "Personnalisée";

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-stone-700">{label}</label>
      {description && <p className="mb-2 text-xs text-stone-400">{description}</p>}
      <input type="hidden" name={name} value={couleur} />

      <div ref={conteneurRef} className="relative">
        <button
          type="button"
          onClick={() => setOuvert(!ouvert)}
          className="flex w-full items-center gap-3 rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-left transition hover:bg-stone-50"
        >
          <span
            className="h-6 w-6 shrink-0 rounded-full border border-stone-200"
            style={{ backgroundColor: couleur }}
          />
          <span className="flex-1 truncate text-sm font-medium text-stone-800">
            {nomCouleur}
          </span>
          <span className="font-mono text-xs text-stone-400">{couleur.toUpperCase()}</span>
          <span className="text-stone-400">{ouvert ? "▲" : "▼"}</span>
        </button>

        {ouvert && (
          <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-stone-200 bg-white p-4 shadow-lg">
            <p className="mb-2 text-xs font-semibold text-stone-500">
              Choisissez parmi 24 couleurs :
            </p>
            <div className="grid grid-cols-8 gap-2">
              {PALETTE.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  title={p.nom}
                  onClick={() => {
                    setCouleur(p.hex);
                    setOuvert(false);
                  }}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    couleur.toLowerCase() === p.hex.toLowerCase()
                      ? "border-stone-900 scale-110"
                      : "border-white shadow-sm hover:scale-105"
                  }`}
                  style={{ backgroundColor: p.hex }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 border-t border-stone-100 pt-3">
              <label
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 hover:bg-stone-50"
                title="Couleur personnalisée"
              >
                <span
                  className="h-5 w-5 rounded border border-stone-200"
                  style={{ backgroundColor: couleur }}
                />
                <span className="text-xs font-semibold text-stone-600">
                  🎨 Ma couleur
                </span>
                <input
                  type="color"
                  value={couleur}
                  onChange={(e) => setCouleur(e.target.value)}
                  className="sr-only"
                />
              </label>
              <span className="font-mono text-xs text-stone-500">
                {couleur.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
