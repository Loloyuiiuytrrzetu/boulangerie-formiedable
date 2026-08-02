"use client";

// Page d'erreur du dashboard : affiche le message et la pile d'appels réels
// (au lieu du texte générique « client-side exception »), pour diagnostiquer
// rapidement un plantage côté client.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl p-6 font-mono text-sm text-stone-800">
      <h2 className="text-lg font-bold text-red-700">Une erreur est survenue</h2>
      <p className="mt-3">
        <span className="font-bold">Message :</span>{" "}
        {error?.message || "(vide)"}
      </p>
      {error?.digest && (
        <p className="mt-1">
          <span className="font-bold">Digest :</span> {error.digest}
        </p>
      )}
      {error?.stack && (
        <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-stone-100 p-3 text-xs">
          {error.stack}
        </pre>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white"
      >
        Réessayer
      </button>
    </div>
  );
}
