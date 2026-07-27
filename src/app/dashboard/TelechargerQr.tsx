"use client";

import { useState } from "react";
import { useTDash } from "@/lib/langue-dashboard";

// Bouton de téléchargement du QR code, fiable sur mobile.
//
// Problème : un lien <a download> avec une data-URL ne fait RIEN sur Safari
// iOS (le download n'est pas supporté pour les data:URL). On gère donc à la
// main : sur mobile on ouvre la feuille de partage native (« Enregistrer
// l'image » / « Enregistrer dans Fichiers »), sur ordinateur on télécharge.
export function TelechargerQr({
  dataUrl,
  filename,
}: {
  dataUrl: string;
  filename: string;
}) {
  const t = useTDash();
  const [enCours, setEnCours] = useState(false);

  async function telecharger() {
    setEnCours(true);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: "image/png" });

      // Mobile : partage natif (permet d'enregistrer dans Photos / Fichiers).
      const nav = navigator as Navigator & {
        canShare?: (data?: { files?: File[] }) => boolean;
        share?: (data?: { files?: File[]; title?: string }) => Promise<void>;
      };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        try {
          await nav.share({ files: [file], title: filename });
        } catch {
          // L'utilisateur a annulé le partage : on ne fait rien de plus.
        }
        return;
      }

      // Ordinateur : téléchargement classique via un object URL.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // Dernier recours : ouvrir l'image dans un nouvel onglet
      // (le client peut faire « appui long → Enregistrer l'image »).
      window.open(dataUrl, "_blank");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <button
      type="button"
      onClick={telecharger}
      disabled={enCours}
      className="mt-4 inline-block rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
    >
      {enCours ? "…" : t("telecharger_qr")}
    </button>
  );
}
