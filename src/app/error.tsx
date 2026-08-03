"use client";

import { useEffect } from "react";

// Barrière d'erreur globale : au lieu d'un écran blanc « Application error »
// bloquant, on récupère automatiquement.
//
// Cas le plus fréquent : après un redéploiement, un onglet resté ouvert
// référence des fichiers JS (chunks) qui n'existent plus → « ChunkLoadError ».
// On recharge alors la page pour récupérer la nouvelle version. Un garde-fou
// temporel évite toute boucle de rechargement.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = `${error?.name ?? ""} ${error?.message ?? ""}`;
    const estChunk =
      /ChunkLoadError|Loading chunk|dynamically imported module|Importing a module script failed|Failed to fetch/i.test(
        msg
      );
    if (estChunk && typeof window !== "undefined") {
      try {
        const cle = "walletiz_dernier_reload";
        const dernier = Number(sessionStorage.getItem(cle) || 0);
        // On ne recharge au plus qu'une fois toutes les 8 s (anti-boucle).
        if (Date.now() - dernier > 8000) {
          sessionStorage.setItem(cle, String(Date.now()));
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 text-center">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-4xl">😕</p>
        <h1 className="mt-3 text-lg font-bold text-stone-900">
          Un petit souci est survenu
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          La page n&apos;a pas pu s&apos;afficher correctement. Réessaie — dans
          la plupart des cas, ça repart tout de suite.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-bordeaux-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-bordeaux-700"
          >
            Recharger la page
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}
