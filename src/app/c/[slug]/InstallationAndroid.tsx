"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/langue";

// Événement Android/Chrome d'installation de PWA.
type BipEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Bannière d'installation pour ANDROID (Chrome / Samsung Internet).
//
// Contrairement à iOS (étapes manuelles), Android propose une installation
// native en un seul geste via l'événement `beforeinstallprompt`. Une fois la
// PWA installée, les notifications sont attribuées à l'app du commerce → logo
// à gauche + nom, sans l'icône du navigateur ni l'adresse « www.walletiz.fr ».
//
// L'événement est capté très tôt dans le layout (window.__walletizBip) car il
// peut se déclencher avant le montage de React ; ici on ne fait que l'afficher
// et le rejouer au clic.
export function InstallationAndroid({
  couleur,
  nomCommerce,
}: {
  couleur: string;
  nomCommerce: string;
}) {
  const t = useT();
  const [dispo, setDispo] = useState(false);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isAndroid = /Android/.test(ua);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (!isAndroid || isStandalone) return;

    // Enregistre le service worker : c'est une condition (avec le manifeste)
    // pour qu'Android considère la page « installable » et déclenche
    // `beforeinstallprompt`. Sans lui, aucune invite n'apparaît.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const win = window as unknown as { __walletizBip?: BipEvent | null };
    const maj = () => setDispo(Boolean(win.__walletizBip));
    maj(); // l'événement a pu se déclencher avant le montage
    window.addEventListener("walletiz-bip", maj);
    window.addEventListener("walletiz-installed", maj);
    return () => {
      window.removeEventListener("walletiz-bip", maj);
      window.removeEventListener("walletiz-installed", maj);
    };
  }, []);

  async function installer() {
    const win = window as unknown as { __walletizBip?: BipEvent | null };
    const e = win.__walletizBip;
    if (!e) return;
    setEnCours(true);
    try {
      await e.prompt();
      await e.userChoice;
      win.__walletizBip = null;
      setDispo(false);
    } catch {
      // l'utilisateur a annulé : on laisse la bannière disparaître
      setDispo(false);
    } finally {
      setEnCours(false);
    }
  }

  if (!dispo) return null;

  return (
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
            {t("ajouter_a_ecran_titre", { nom: nomCommerce })}
          </p>
          <p className="mt-1 text-xs text-stone-600">
            {t("ajouter_a_ecran_desc_court")}
          </p>
          <button
            type="button"
            onClick={installer}
            disabled={enCours}
            className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: couleur }}
          >
            {enCours ? t("activation_en_cours") : `📲 ${t("installer_app")}`}
          </button>
        </div>
      </div>
    </div>
  );
}
