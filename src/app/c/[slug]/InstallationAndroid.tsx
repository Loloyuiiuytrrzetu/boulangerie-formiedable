"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/langue";

// Événement Android/Chrome d'installation de PWA.
type BipEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const CLE_MASQUE = "walletiz_android_install_hide";

// Bloc d'installation pour ANDROID (Chrome / Samsung Internet).
//
// Deux chemins proposés :
//  1. Bouton natif « Installer » en un geste, quand le navigateur le propose
//     (événement `beforeinstallprompt`, capté tôt dans le layout).
//  2. Un GUIDE manuel de secours (toujours affiché) : sur Samsung Internet
//     l'invite native n'apparaît pas toujours, donc on montre les étapes.
//
// Une fois la PWA installée, les notifications sont attribuées à l'app du
// commerce → logo à gauche + nom, sans l'icône du navigateur ni l'adresse
// « www.walletiz.fr ».
export function InstallationAndroid({
  couleur,
  nomCommerce,
}: {
  couleur: string;
  nomCommerce: string;
}) {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const [dispo, setDispo] = useState(false);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isAndroid = /Android/.test(ua);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    // Uniquement Android, hors app déjà installée, et si non masqué.
    if (!isAndroid || isStandalone) return;
    if (localStorage.getItem(CLE_MASQUE) === "1") return;
    setVisible(true);

    // Enregistre le service worker : condition (avec le manifeste) pour qu'Android
    // considère la page « installable » et déclenche `beforeinstallprompt`.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const win = window as unknown as { __walletizBip?: BipEvent | null };
    const maj = () => setDispo(Boolean(win.__walletizBip));
    maj(); // l'événement a pu se déclencher avant le montage
    window.addEventListener("walletiz-bip", maj);
    window.addEventListener("walletiz-installed", () => setVisible(false));
    return () => {
      window.removeEventListener("walletiz-bip", maj);
    };
  }, []);

  async function installer() {
    const win = window as unknown as { __walletizBip?: BipEvent | null };
    const e = win.__walletizBip;
    if (!e) return;
    setEnCours(true);
    try {
      await e.prompt();
      const choix = await e.userChoice;
      win.__walletizBip = null;
      setDispo(false);
      if (choix.outcome === "accepted") setVisible(false);
    } catch {
      setDispo(false);
    } finally {
      setEnCours(false);
    }
  }

  function masquer() {
    try {
      localStorage.setItem(CLE_MASQUE, "1");
    } catch {
      // sans importance
    }
    setVisible(false);
  }

  if (!visible) return null;

  const etapes = [
    t("android_install_etape_1"),
    t("android_install_etape_2"),
    t("android_install_etape_3"),
  ];

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

          {/* Chemin 1 : bouton natif en un geste (si proposé par le navigateur) */}
          {dispo && (
            <button
              type="button"
              onClick={installer}
              disabled={enCours}
              className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: couleur }}
            >
              {enCours ? t("activation_en_cours") : `📲 ${t("installer_app")}`}
            </button>
          )}

          {/* Chemin 2 : guide manuel (toujours affiché en secours) */}
          <div className="mt-3">
            <p className="text-xs font-semibold text-stone-700">
              {t("android_install_comment")}
            </p>
            <ol className="mt-2 space-y-2 text-xs text-stone-700">
              {etapes.map((etape, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: couleur }}
                  >
                    {i + 1}
                  </span>
                  <span>{etape}</span>
                </li>
              ))}
            </ol>
          </div>

          <button
            type="button"
            onClick={masquer}
            className="mt-3 text-xs font-medium text-stone-500 underline hover:text-stone-700"
          >
            {t("ne_plus_afficher")}
          </button>
        </div>
      </div>
    </div>
  );
}
