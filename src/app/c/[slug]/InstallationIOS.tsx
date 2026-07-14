"use client";

import { useEffect, useState } from "react";

// S'affiche automatiquement en plein écran après l'inscription pour les
// clients iPhone qui utilisent Safari SANS avoir installé la PWA. Apple
// n'autorise pas à déclencher la popup « Sur l'écran d'accueil » par
// JavaScript — on fait donc le meilleur onboarding possible : instructions
// visuelles claires, plein écran, difficile à rater.
export function InstallationIOS({
  couleur,
  nomCommerce,
}: {
  couleur: string;
  nomCommerce: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    const dejaVu = localStorage.getItem("walletiz_ios_install_seen") === "1";
    // Sur iOS sans PWA installée, on affiche l'onboarding sauf si l'utilisateur
    // l'a déjà refusé une fois.
    if (isIOS && !isStandalone && !dejaVu) {
      // Petit délai pour laisser la page finir de se charger sereinement
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function fermer() {
    localStorage.setItem("walletiz_ios_install_seen", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={fermer}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
          aria-label="Fermer"
        >
          ✕
        </button>

        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl text-white"
          style={{ backgroundColor: couleur }}
        >
          📱
        </div>

        <h2 className="mt-4 text-center text-lg font-extrabold text-stone-900">
          Ajoutez {nomCommerce} à votre écran d&apos;accueil
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          Pour recevoir nos promotions et alertes de récompenses par
          notification, ajoutez cette page comme une application (2 clics
          suffisent).
        </p>

        <ol className="mt-5 space-y-4 text-sm text-stone-800">
          <li className="flex items-start gap-3">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: couleur }}
            >
              1
            </span>
            <span>
              Appuyez sur le bouton <strong>Partager</strong>{" "}
              <span
                aria-hidden="true"
                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-stone-300 align-middle text-base"
                style={{ color: couleur }}
              >
                ⬆︎
              </span>{" "}
              de Safari ou Chrome
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: couleur }}
            >
              2
            </span>
            <span>
              Cliquez sur <strong>« En voir plus »</strong>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: couleur }}
            >
              3
            </span>
            <span>
              Faites défiler et cliquez sur{" "}
              <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: couleur }}
            >
              4
            </span>
            <span>
              Ouvrez l&apos;app {nomCommerce} depuis l&apos;icône apparue sur
              votre écran d&apos;accueil
            </span>
          </li>
        </ol>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={fermer}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            style={{ backgroundColor: couleur }}
          >
            J&apos;ai compris
          </button>
          <button
            type="button"
            onClick={fermer}
            className="text-center text-xs font-medium text-stone-500 hover:text-stone-700"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
