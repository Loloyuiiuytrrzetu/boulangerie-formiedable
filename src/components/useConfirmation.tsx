"use client";

import { useCallback, useRef, useState } from "react";

// Confirmation intégrée à la page (remplace window.confirm, qui est bloqué
// silencieusement sur beaucoup de navigateurs mobiles → « ça marche sur
// ordinateur mais pas sur téléphone »). Fonctionne partout, identiquement.
//
// Utilisation :
//   const { confirmer, confirmationUI } = useConfirmation();
//   ...
//   if (!(await confirmer({ message, confirmer: "Supprimer", annuler: "Annuler" }))) return;
//   ...
//   return (<>{confirmationUI} ...</>);
export function useConfirmation() {
  const [etat, setEtat] = useState<{
    message: string;
    confirmer: string;
    annuler: string;
    danger: boolean;
  } | null>(null);
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  const confirmer = useCallback(
    (opts: {
      message: string;
      confirmer?: string;
      annuler?: string;
      danger?: boolean;
    }) => {
      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
        setEtat({
          message: opts.message,
          confirmer: opts.confirmer ?? "OK",
          annuler: opts.annuler ?? "Annuler",
          danger: opts.danger ?? true,
        });
      });
    },
    []
  );

  const repondre = useCallback((v: boolean) => {
    const r = resolveRef.current;
    resolveRef.current = null;
    setEtat(null);
    r?.(v);
  }, []);

  const confirmationUI = etat ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={() => repondre(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-stone-800">{etat.message}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => repondre(false)}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
          >
            {etat.annuler}
          </button>
          <button
            type="button"
            onClick={() => repondre(true)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
              etat.danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-bordeaux-800 hover:bg-bordeaux-700"
            }`}
          >
            {etat.confirmer}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirmer, confirmationUI };
}
