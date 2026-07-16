"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useLangue } from "./langue";
import type { Langue } from "./i18n";

// Contexte qui rend la langue SOURCE du contenu (celle dans laquelle le
// restaurateur a saisi ses cartes) disponible aux composants <AutoTraduit>
// sans avoir à passer la prop partout.
const LangueSourceContext = createContext<Langue>("fr");

export function LangueSourceProvider({
  langue,
  children,
}: {
  langue: Langue;
  children: React.ReactNode;
}) {
  return (
    <LangueSourceContext.Provider value={langue}>
      {children}
    </LangueSourceContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// AUTO-TRADUCTION pour les contenus saisis librement par le restaurateur :
// noms de cartes de fidélité, descriptions de récompenses, etc.
//
// On utilise l'API gratuite MyMemory (https://mymemory.translated.net/doc/spec.php)
// — pas de clé, quota généreux pour un site indépendant. Chaque traduction
// est mise en cache dans localStorage : après la 1ère consultation, tout est
// instantané et hors-ligne.
//
// Convention : si la langue du client est identique à la langue source
// détectée (ex. carte "Coffee card" affichée en anglais), on retourne le
// texte original sans appeler l'API.
// ---------------------------------------------------------------------------

const CACHE_PREFIX = "walletiz_tr_";

// Mémoire (Map) pour éviter les hits localStorage répétés dans la même vue.
const memCache = new Map<string, string>();

// Correspondance vers les codes MyMemory (identiques à nos codes internes).
function codeLangue(l: Langue): string {
  return l;
}

async function traduire(
  texte: string,
  cible: Langue,
  source: Langue
): Promise<string> {
  const cleaned = texte.trim();
  if (!cleaned) return texte;
  if (source === cible) return texte;

  const cacheKey = `${source}>${cible}::${cleaned}`;
  if (memCache.has(cacheKey)) return memCache.get(cacheKey)!;

  if (typeof localStorage !== "undefined") {
    const cached = localStorage.getItem(CACHE_PREFIX + cacheKey);
    if (cached) {
      memCache.set(cacheKey, cached);
      return cached;
    }
  }

  try {
    // MyMemory exige une langue source explicite (2 lettres ISO). On prend
    // celle du commerce, transmise via prop → contexte (français par défaut).
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      cleaned
    )}&langpair=${codeLangue(source)}|${codeLangue(cible)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };
    const trad = data?.responseData?.translatedText;
    if (!trad || typeof trad !== "string") return texte;

    // Filtre : si l'API renvoie un message d'erreur en majuscules
    // (ex : "'AUTO' IS AN INVALID SOURCE LANGUAGE"), on retombe sur le
    // texte original plutôt que d'afficher l'erreur au client.
    const semble_erreur =
      trad === trad.toUpperCase() && trad.length > 30 && /INVALID|ERROR|EXAMPLE:/.test(trad);
    if (semble_erreur) return texte;

    let out = trad;
    out = out.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

    memCache.set(cacheKey, out);
    try {
      localStorage.setItem(CACHE_PREFIX + cacheKey, out);
    } catch {
      // Quota localStorage dépassé — pas grave, on garde en RAM.
    }
    return out;
  } catch {
    return texte;
  }
}

// Hook : traduit un tableau de chaînes (utile là où on ne peut pas monter
// un composant, ex. le libellé d'une <option>). Renvoie les textes traduits
// dans le même ordre ; fallback instantané sur l'original pendant le chargement.
export function useAutoTraduitListe(textes: (string | null | undefined)[]): string[] {
  const { langue } = useLangue();
  const source = useContext(LangueSourceContext);
  const cle = textes.join("");
  const [affiches, setAffiches] = useState<string[]>(() =>
    textes.map((t) => t ?? "")
  );

  useEffect(() => {
    const base = textes.map((t) => t ?? "");
    if (langue === source) {
      setAffiches(base);
      return;
    }
    let annule = false;
    setAffiches(base); // fallback instantané
    Promise.all(base.map((t) => (t ? traduire(t, langue, source) : Promise.resolve(t)))).then(
      (res) => {
        if (!annule) setAffiches(res);
      }
    );
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle, langue, source]);

  return affiches;
}

// Composant : affiche `texte` traduit de la langue source du contenu
// (LangueSourceProvider) vers la langue courante du client.
export function AutoTraduit({ texte }: { texte: string | null | undefined }) {
  const { langue } = useLangue();
  const source = useContext(LangueSourceContext);
  const [affiche, setAffiche] = useState(texte ?? "");

  useEffect(() => {
    if (!texte) {
      setAffiche("");
      return;
    }
    let annule = false;
    if (langue === source) {
      setAffiche(texte);
      return;
    }
    setAffiche(texte); // fallback instantané pendant que la traduction charge
    traduire(texte, langue, source).then((tr) => {
      if (!annule) setAffiche(tr);
    });
    return () => {
      annule = true;
    };
  }, [texte, langue, source]);

  return <>{affiche}</>;
}
