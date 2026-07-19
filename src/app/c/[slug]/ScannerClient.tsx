"use client";

import { useState, useTransition } from "react";
import { scannerEtAjouterTampon } from "./actions";
import { ScanCameraModal } from "./ScanCameraModal";
import type { CarteAffichee } from "./EspaceClient";
import { useT } from "@/lib/langue";
import { useAutoTraduitListe } from "@/lib/auto-traduction";

// Scanner accessible depuis l'onglet "Scan" côté client : le client scanne
// lui-même le QR code affiché en caisse du commerce. Si le QR correspond
// bien à ce commerce, on lui attribue 1 tampon automatiquement (règle du
// restaurateur : 1 tampon/jour, respect du mode manuel, etc.).
export function ScannerClient({
  slug,
  couleur,
  cartes,
  onAnimation,
}: {
  slug: string;
  couleur: string;
  cartes: CarteAffichee[];
  onAnimation: () => void;
}) {
  const t = useT();
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [carteId, setCarteId] = useState<string>(cartes[0]?.id ?? "");
  const [enCours, startTransition] = useTransition();
  const carteChoisie = cartes.find((c) => c.id === carteId) ?? cartes[0];
  // Noms de cartes traduits automatiquement dans la langue du client
  const titresTraduits = useAutoTraduitListe(cartes.map((c) => c.titre));

  function surDetecte() {
    setOuvert(false);
    startTransition(async () => {
      const r = await scannerEtAjouterTampon(slug, carteId);
      if (r?.erreur) setErreur(r.erreur);
      else if ("ok" in r && r.ok) {
        setSucces(t("tampon_ajoute"));
        if ("recompense" in r && r.recompense) {
          onAnimation();
        }
      }
    });
  }

  if (cartes.length === 0) {
    return (
      <div className="rounded-2xl bg-stone-50 p-6 text-center text-sm text-stone-500">
        {t("aucune_carte")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-stone-600">
        {t("scannez_pour_recevoir")}
      </p>

      {cartes.length > 1 && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-stone-600">
            {t("sur_quelle_carte")}
          </label>
          <select
            value={carteId}
            onChange={(e) => setCarteId(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:outline-none"
          >
            {cartes.map((c, i) => (
              <option key={c.id} value={c.id}>
                {titresTraduits[i] || c.titre} ({c.tampons_actuels}/{c.nombre_tampons_requis})
              </option>
            ))}
          </select>
        </div>
      )}

      {carteChoisie?.tampon_pris_aujourdhui ? (
        <div className="rounded-xl bg-stone-50 px-4 py-3 text-center text-sm text-stone-600">
          {t("tampon_deja_pris")}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setErreur(null);
            setSucces(null);
            setOuvert(true);
          }}
          disabled={enCours}
          className="w-full rounded-2xl px-6 py-6 text-lg font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: couleur }}
        >
          {enCours ? t("ajout_tampon_en_cours") : t("scanner_qr_commerce")}
        </button>
      )}

      {succes && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
          {succes}
        </p>
      )}
      {erreur && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {erreur}
        </p>
      )}

      {ouvert && (
        <ScanCameraModal
          slug={slug}
          onDetecte={surDetecte}
          onErreur={setErreur}
          onFermer={() => setOuvert(false)}
        />
      )}
    </div>
  );
}
