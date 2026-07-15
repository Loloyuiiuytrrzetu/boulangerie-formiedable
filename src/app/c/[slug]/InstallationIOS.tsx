"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// PWA sur iPhone — onboarding en 3 temps :
//
// 1. Popup plein écran immédiat (après inscription) → poussée fort pour ne
//    pas passer inaperçu.
// 2. Après « J'ai compris » / « Plus tard » → la popup disparaît mais un
//    bandeau reste visible dans l'onglet Info, avec un bouton
//    « Comment faire ? » qui rouvre la popup.
// 3. Le client peut masquer définitivement le bandeau depuis Info.
//
// État stocké dans localStorage sous la clé PWA_STATE_KEY :
//   null (jamais vu)  → popup visible
//   "modal_ok"        → popup masquée, bandeau Info visible
//   "banner_ok"       → tout masqué (le client a cliqué "Ne plus afficher")
// ---------------------------------------------------------------------------

const PWA_STATE_KEY = "walletiz_pwa_prompt_state";

type EtatPwa = null | "modal_ok" | "banner_ok";

function detecterIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function detecterStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Sur iOS, si le user-agent ne contient pas CriOS/FxiOS/OPiOS, c'est Safari.
// C'est important pour les instructions : Safari n'a pas d'étape « En voir
// plus » — l'option « Ajouter à l'écran d'accueil » apparaît directement
// dans la feuille de partage.
function estSafariIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua)
  );
}

function lireEtat(): EtatPwa {
  if (typeof localStorage === "undefined") return null;
  const v = localStorage.getItem(PWA_STATE_KEY);
  if (v === "modal_ok" || v === "banner_ok") return v;
  // Rétrocompatibilité : ancienne clé
  if (localStorage.getItem("walletiz_ios_install_seen") === "1")
    return "modal_ok";
  return null;
}

function ecrireEtat(e: EtatPwa) {
  if (typeof localStorage === "undefined") return;
  if (e === null) localStorage.removeItem(PWA_STATE_KEY);
  else localStorage.setItem(PWA_STATE_KEY, e);
}

// ---------------------------------------------------------------------------
// POPUP plein écran — s'affiche uniquement si l'utilisateur n'a JAMAIS vu
// l'onboarding, sur iOS et pas en mode standalone.
// ---------------------------------------------------------------------------
export function InstallationIOS({
  couleur,
  nomCommerce,
}: {
  couleur: string;
  nomCommerce: string;
}) {
  const [visible, setVisible] = useState(false);
  const [safari, setSafari] = useState(false);

  useEffect(() => {
    if (!detecterIOS() || detecterStandalone()) return;
    if (lireEtat() !== null) return; // déjà vue
    setSafari(estSafariIOS());
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  function fermer() {
    ecrireEtat("modal_ok");
    setVisible(false);
    // Prévenir la bannière Info qu'elle peut s'afficher tout de suite
    window.dispatchEvent(new Event("walletiz-pwa-state"));
  }

  if (!visible) return null;

  return (
    <ModalInstallation
      couleur={couleur}
      nomCommerce={nomCommerce}
      safari={safari}
      onClose={fermer}
    />
  );
}

// ---------------------------------------------------------------------------
// BANNIÈRE dans l'onglet Info — visible tant que le client n'a pas installé
// la PWA ni cliqué « Ne plus afficher ». Contient un bouton qui rouvre la
// modal pour revoir les étapes.
// ---------------------------------------------------------------------------
export function BanniereInstallationIOS({
  couleur,
  nomCommerce,
}: {
  couleur: string;
  nomCommerce: string;
}) {
  const [visible, setVisible] = useState(false);
  const [modalOuverte, setModalOuverte] = useState(false);
  const [safari, setSafari] = useState(false);

  useEffect(() => {
    function verifier() {
      if (!detecterIOS() || detecterStandalone()) {
        setVisible(false);
        return;
      }
      const etat = lireEtat();
      setSafari(estSafariIOS());
      // Bannière visible SEULEMENT après que la modale a été vue
      // et tant que le client ne l'a pas masquée.
      setVisible(etat === "modal_ok");
    }
    verifier();
    window.addEventListener("walletiz-pwa-state", verifier);
    return () => window.removeEventListener("walletiz-pwa-state", verifier);
  }, []);

  function masquer() {
    ecrireEtat("banner_ok");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      <div
        className="rounded-2xl border p-4"
        style={{ borderColor: `${couleur}55`, backgroundColor: `${couleur}0d` }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl text-white"
            style={{ backgroundColor: couleur }}
          >
            📱
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-stone-900">
              Ajoutez {nomCommerce} à votre écran d&apos;accueil
            </p>
            <p className="mt-1 text-xs text-stone-600">
              Pour recevoir nos promotions et alertes de récompenses par
              notification.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setModalOuverte(true)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                style={{ backgroundColor: couleur }}
              >
                Comment faire ?
              </button>
              <button
                type="button"
                onClick={masquer}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100"
              >
                Ne plus afficher
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalOuverte && (
        <ModalInstallation
          couleur={couleur}
          nomCommerce={nomCommerce}
          safari={safari}
          onClose={() => setModalOuverte(false)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Modale visuelle partagée entre la popup initiale et le bouton « Comment
// faire ? » du bandeau. Adapte les étapes selon Safari vs Chrome iOS.
// ---------------------------------------------------------------------------
function ModalInstallation({
  couleur,
  nomCommerce,
  safari,
  onClose,
}: {
  couleur: string;
  nomCommerce: string;
  safari: boolean;
  onClose: () => void;
}) {
  const etapes = safari
    ? [
        <>
          Appuyez sur le bouton <strong>Partager</strong>{" "}
          <IconePartage couleur={couleur} /> de Safari
        </>,
        <>
          Faites défiler et cliquez sur{" "}
          <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>
        </>,
        <>
          Ouvrez l&apos;app {nomCommerce} depuis l&apos;icône apparue sur votre
          écran d&apos;accueil
        </>,
      ]
    : [
        <>
          Appuyez sur le bouton <strong>Partager</strong>{" "}
          <IconePartage couleur={couleur} /> de Chrome
        </>,
        <>
          Cliquez sur <strong>« En voir plus »</strong>
        </>,
        <>
          Faites défiler et cliquez sur{" "}
          <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>
        </>,
        <>
          Ouvrez l&apos;app {nomCommerce} depuis l&apos;icône apparue sur votre
          écran d&apos;accueil
        </>,
      ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
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
          notification, ajoutez cette page comme une application ({safari ? 2 : 3} clics
          suffisent).
        </p>

        <ol className="mt-5 space-y-4 text-sm text-stone-800">
          {etapes.map((contenu, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: couleur }}
              >
                {i + 1}
              </span>
              <span>{contenu}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            style={{ backgroundColor: couleur }}
          >
            J&apos;ai compris
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-center text-xs font-medium text-stone-500 hover:text-stone-700"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}

function IconePartage({ couleur }: { couleur: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-stone-300 align-middle text-base"
      style={{ color: couleur }}
    >
      ⬆︎
    </span>
  );
}
