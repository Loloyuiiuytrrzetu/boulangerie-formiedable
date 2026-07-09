"use client";

import { useState } from "react";
import { AnimationRecompense } from "@/app/c/[slug]/Animation";

// Petit bouton "Voir l'aperçu" à côté du sélecteur d'animation dans le dashboard.
// Écoute l'attribut value du <select> voisin pour choisir l'animation à jouer.
export function ApercuAnimation({ selectId }: { selectId: string }) {
  const [animation, setAnimation] = useState<string | null>(null);

  function lancer() {
    if (typeof document === "undefined") return;
    const select = document.getElementById(selectId) as HTMLSelectElement | null;
    const type = select?.value ?? "confettis";
    if (type === "aucune") {
      alert("« Aucune animation » sélectionnée — rien à prévisualiser.");
      return;
    }
    setAnimation(type);
  }

  return (
    <>
      <button
        type="button"
        onClick={lancer}
        className="mt-2 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-100"
      >
        👁️ Voir l&apos;aperçu
      </button>
      {animation && (
        <AnimationRecompense type={animation} onEnd={() => setAnimation(null)} />
      )}
    </>
  );
}
