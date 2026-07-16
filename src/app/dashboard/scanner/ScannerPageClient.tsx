"use client";

import Link from "next/link";
import { useTransition } from "react";
import type { Carte } from "@/lib/types";
import { LANGUES, type Langue } from "@/lib/i18n";
import {
  LangueDashboardProvider,
  useLangueDashboard,
  useTDash,
} from "@/lib/langue-dashboard";
import { changerLangue } from "../actions";
import { BoutonDeconnexion } from "../BoutonDeconnexion";
import { ScannerForm } from "./ScannerForm";
import { DerniersTampons, type TamponRecent } from "./DerniersTampons";

// Page scanner complète, montée dans un provider de langue pour que le
// sous-compte (ou le restaurateur) puisse choisir sa langue et TOUT voir
// traduit — sauf le nom du commerce. La liste des derniers tampons donnés
// est réductible.
export function ScannerPageClient(props: {
  langueInitiale: Langue;
  sousCompte: boolean;
  estRestaurateur: boolean;
  nomCommerce: string;
  timezone: string;
  cartes: Carte[];
  clientIdentifie: boolean;
  telephonePrecharge: string;
  identitePrecharge: string | null;
  recents: TamponRecent[];
}) {
  return (
    <LangueDashboardProvider langueInitiale={props.langueInitiale}>
      <Contenu {...props} />
    </LangueDashboardProvider>
  );
}

function Contenu({
  sousCompte,
  estRestaurateur,
  nomCommerce,
  timezone,
  cartes,
  clientIdentifie,
  telephonePrecharge,
  identitePrecharge,
  recents,
}: {
  langueInitiale: Langue;
  sousCompte: boolean;
  estRestaurateur: boolean;
  nomCommerce: string;
  timezone: string;
  cartes: Carte[];
  clientIdentifie: boolean;
  telephonePrecharge: string;
  identitePrecharge: string | null;
  recents: TamponRecent[];
}) {
  const t = useTDash();
  const { langue, setLangue } = useLangueDashboard();
  const [, startLangue] = useTransition();

  function changer(l: Langue) {
    setLangue(l); // instantané côté navigateur
    // Persiste aussi côté restaurateur (sans effet notable pour le sous-compte,
    // qui n'a de toute façon accès qu'à cette page).
    if (estRestaurateur) startLangue(async () => void changerLangue(l));
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="Walletiz"
              className="h-9 w-9 rounded-xl object-cover"
            />
            <div>
              <p className="font-bold text-bordeaux-800">Walletiz</p>
              <p className="text-xs text-stone-500">
                {sousCompte ? `${t("sous_compte")} — ` : ""}
                {nomCommerce}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={langue}
              onChange={(e) => changer(e.target.value as Langue)}
              aria-label={t("changer_langue")}
              className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm font-semibold text-stone-700"
            >
              {LANGUES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.drapeau}
                </option>
              ))}
            </select>
            {estRestaurateur && (
              <Link
                href="/dashboard"
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600 transition hover:bg-stone-100"
              >
                ← Dashboard
              </Link>
            )}
            <BoutonDeconnexion />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-lg sm:p-6">
          <h1 className="text-xl font-bold text-stone-900">
            {clientIdentifie
              ? "✅"
              : `📷 ${t("attribuer_tampons_client").replace("🎯 ", "")}`}
          </h1>

          <ScannerForm
            cartes={cartes}
            telephonePrecharge={telephonePrecharge}
            identitePrecharge={identitePrecharge}
          />
        </div>

        <DerniersTampons tampons={recents} timezone={timezone} />
      </div>
    </main>
  );
}
