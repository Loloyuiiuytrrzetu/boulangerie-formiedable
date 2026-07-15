"use client";

import { useEffect, useState } from "react";
import { useLangue } from "./langue";
import type { Langue } from "./i18n";

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

async function traduire(texte: string, cible: Langue): Promise<string> {
  const cleaned = texte.trim();
  if (!cleaned) return texte;

  const cacheKey = `${cible}::${cleaned}`;
  if (memCache.has(cacheKey)) return memCache.get(cacheKey)!;

  if (typeof localStorage !== "undefined") {
    const cached = localStorage.getItem(CACHE_PREFIX + cacheKey);
    if (cached) {
      memCache.set(cacheKey, cached);
      return cached;
    }
  }

  // On demande à MyMemory de deviner la langue source. Pour la plupart des
  // paires, MyMemory renvoie le texte original si source = cible.
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      cleaned
    )}&langpair=auto|${codeLangue(cible)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };
    const trad = data?.responseData?.translatedText;
    if (!trad || typeof trad !== "string") return texte;

    // MyMemory renvoie parfois le texte tel quel entre guillemets ; on nettoie.
    let out = trad;
    // Décode les entités HTML basiques.
    out = out.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

    memCache.set(cacheKey, out);
    try {
      localStorage.setItem(CACHE_PREFIX + cacheKey, out);
    } catch {
      // Quota localStorage dépassé — pas grave, on garde en RAM.
    }
    return out;
  } catch {
    return texte; // En cas d'erreur réseau, on affiche le texte original.
  }
}

// Composant : affiche `texte` traduit dans la langue courante du contexte.
// Le texte original est affiché instantanément puis remplacé par la
// traduction dès qu'elle arrive.
export function AutoTraduit({ texte }: { texte: string | null | undefined }) {
  const { langue } = useLangue();
  const [affiche, setAffiche] = useState(texte ?? "");

  useEffect(() => {
    if (!texte) {
      setAffiche("");
      return;
    }
    let annule = false;
    // Si la langue courante est le français (langue par défaut d'entrée en
    // pratique), pas d'appel — on renvoie directement le texte original.
    if (langue === "fr") {
      setAffiche(texte);
      return;
    }
    setAffiche(texte); // fallback instantané pendant que la traduction charge
    traduire(texte, langue).then((tr) => {
      if (!annule) setAffiche(tr);
    });
    return () => {
      annule = true;
    };
  }, [texte, langue]);

  return <>{affiche}</>;
}
