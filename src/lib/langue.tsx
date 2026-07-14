"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { LANGUES_RTL, type Langue, t } from "./i18n";

const LangueContext = createContext<{
  langue: Langue;
  setLangue: (l: Langue) => void;
}>({
  langue: "fr",
  setLangue: () => {},
});

export function LangueProvider({ children }: { children: React.ReactNode }) {
  const [langue, setLangueState] = useState<Langue>("fr");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sauvegardee = localStorage.getItem("walletiz_langue") as Langue | null;
    if (sauvegardee) {
      setLangueState(sauvegardee);
      appliquerDirection(sauvegardee);
    } else {
      // Auto-détection depuis la langue du navigateur
      const nav = navigator.language.slice(0, 2).toLowerCase() as Langue;
      const supportees: Langue[] = ["fr", "en", "es", "de", "zh", "ar", "ru"];
      if (supportees.includes(nav)) {
        setLangueState(nav);
        appliquerDirection(nav);
      }
    }
  }, []);

  function setLangue(l: Langue) {
    setLangueState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("walletiz_langue", l);
      appliquerDirection(l);
    }
  }

  return (
    <LangueContext.Provider value={{ langue, setLangue }}>
      {children}
    </LangueContext.Provider>
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

export function useLangue() {
  return useContext(LangueContext);
}

// Hook pratique : renvoie une fonction t(clef) qui utilise la langue courante.
export function useT() {
  const { langue } = useLangue();
  return (
    cle: Parameters<typeof t>[0],
    vars?: Parameters<typeof t>[2]
  ) => t(cle, langue, vars);
}
