"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/langue";

// Événement Android/Chrome d'installation de PWA.
type BipEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// État déplié/replié mémorisé : le client peut masquer le guide et le
// réafficher quand il veut (le bloc reste toujours présent dans l'onglet Info).
const CLE_OUVERT = "walletiz_android_guide_ouvert";

// Bloc d'installation ANDROID (Chrome / Samsung Internet) — placé dans
// l'onglet Info. Deux chemins : bouton natif « Installer » (quand le
// navigateur le propose) + guide manuel de secours. Repliable / dépliable.
export function InstallationAndroid({
  couleur,
  nomCommerce,
}: {
  couleur: string;
  nomCommerce: string;
}) {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const [ouvert, setOuvert] = useState(true);
  const [dispo, setDispo] = useState(false);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isAndroid = /Android/.test(ua);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    // Android uniquement, et pas quand l'app est déjà installée.
    if (!isAndroid || isStandalone) return;
    setOuvert(localStorage.getItem(CLE_OUVERT) !== "0"); // ouvert par défaut
    setVisible(true);

    // Enregistre le service worker : condition (avec le manifeste) pour qu'Android
    // considère la page « installable » et déclenche `beforeinstallprompt`.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const win = window as unknown as { __walletizBip?: BipEvent | null };
    const maj = () => setDispo(Boolean(win.__walletizBip));
    maj();
    window.addEventListener("walletiz-bip", maj);
    window.addEventListener("walletiz-installed", () => setVisible(false));
    return () => window.removeEventListener("walletiz-bip", maj);
  }, []);

  function basculer() {
    const v = !ouvert;
    setOuvert(v);
    try {
      localStorage.setItem(CLE_OUVERT, v ? "1" : "0");
    } catch {
      // sans importance
    }
  }

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

  if (!visible) return null;

  const etapes = [
    t("android_install_etape_1"),
    t("android_install_etape_2"),
    t("android_install_etape_3"),
  ];

  return (
    <div className="mt-8 border-t border-stone-100 pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-stone-800">
          📲 {t("ajouter_a_ecran_titre", { nom: nomCommerce })}
        </p>
        <button
          type="button"
          onClick={basculer}
          className="shrink-0 text-xs font-medium underline"
          style={{ color: couleur }}
        >
          {ouvert ? t("masquer") : t("afficher_instructions")}
        </button>
      </div>

      {ouvert && (
        <div
          className="mt-3 rounded-2xl border p-4"
          style={{ borderColor: `${couleur}55`, backgroundColor: `${couleur}0d` }}
        >
          <p className="text-xs text-stone-600">
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
        </div>
      )}
    </div>
  );
}
