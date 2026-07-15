"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { LANGUES_RTL, type Langue } from "./i18n";
import { tDash } from "./i18n-dashboard";

// Provider séparé pour le dashboard restaurateur : la langue initiale
// vient de restaurant.langue (choisie à la création par le super admin).
// Le restaurateur peut la changer depuis la sidebar — le choix persiste
// en localStorage et écrase temporairement la valeur en base pour ce
// navigateur (l'action serveur sauvegarde en même temps).

const CLE_STORAGE = "walletiz_dashboard_langue";

const LangueDashContext = createContext<{
  langue: Langue;
  setLangue: (l: Langue) => void;
}>({
  langue: "fr",
  setLangue: () => {},
});

export function LangueDashboardProvider({
  langueInitiale,
  children,
}: {
  langueInitiale: Langue;
  children: React.ReactNode;
}) {
  const [langue, setLangueState] = useState<Langue>(langueInitiale);

  // Au mount, si le navigateur a déjà une valeur en localStorage plus
  // récente (le restaurateur vient de changer, avant que le refresh du
  // serveur ne rende la nouvelle valeur), on l'utilise.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sauvegardee = localStorage.getItem(CLE_STORAGE) as Langue | null;
    if (sauvegardee && sauvegardee !== langueInitiale) {
      setLangueState(sauvegardee);
    }
    appliquerDirection(langue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setLangue(l: Langue) {
    setLangueState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem(CLE_STORAGE, l);
      appliquerDirection(l);
    }
  }

  return (
    <LangueDashContext.Provider value={{ langue, setLangue }}>
      {children}
    </LangueDashContext.Provider>
  );
}

function appliquerDirection(l: Langue) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("lang", l);
  document.documentElement.setAttribute(
    "dir",
    LANGUES_RTL.includes(l) ? "rtl" : "ltr"
  );
}

export function useLangueDashboard() {
  return useContext(LangueDashContext);
}

// Hook pratique : renvoie une fonction t(clef, vars?) déjà bindée à la
// langue courante du dashboard.
export function useTDash() {
  const { langue } = useLangueDashboard();
  return (
    cle: Parameters<typeof tDash>[0],
    vars?: Parameters<typeof tDash>[2]
  ) => tDash(cle, langue, vars);
}
