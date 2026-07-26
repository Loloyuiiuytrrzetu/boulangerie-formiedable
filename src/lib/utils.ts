import { randomBytes } from "crypto";

// Date du jour (AAAA-MM-JJ) dans le fuseau horaire donné.
// Sert à calculer "aujourd'hui" côté commerce, où qu'il soit.
export function dateDuJour(timezone: string = "Europe/Paris"): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Ancien nom conservé pour compatibilité (mappé sur le nouveau)
export function dateDuJourParis(): string {
  return dateDuJour("Europe/Paris");
}

// Génère un token opaque pour le cookie de reconnaissance du client
export function genererToken(): string {
  return randomBytes(32).toString("hex");
}

// Transforme un nom de commerce en slug d'URL : "Chez Léa" -> "chez-lea"
export function slugify(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

// Garantit une couleur de QR code réellement SCANNABLE partout.
//
// Le piège : une couleur de marque même « foncée » à l'œil (rouge vif,
// violet, bleu saturé…) peut avoir un contraste insuffisant une fois l'image
// convertie en niveaux de gris — ce que font la plupart des scanners. Un
// iPhone corrige, mais l'appareil photo d'un Samsung/Android échoue à
// détecter le QR. On calcule donc le VRAI ratio de contraste (norme WCAG) de
// la couleur sur fond blanc ; s'il est insuffisant (< 7:1), on force un
// quasi-noir. Une couleur déjà bien foncée (bordeaux sombre, etc.) est
// conservée telle quelle.
export function couleurQrLisible(hex: string): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec((hex ?? "").trim());
  if (!m) return "#1c1917";
  const int = parseInt(m[1], 16);
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const L =
    0.2126 * canal((int >> 16) & 255) +
    0.7152 * canal((int >> 8) & 255) +
    0.0722 * canal(int & 255);
  // Ratio de contraste avec le blanc (luminance 1.0) : (1.0 + 0.05)/(L + 0.05)
  const contraste = 1.05 / (L + 0.05);
  // < 7:1 → pas assez sûr pour un scan fiable partout → quasi-noir.
  return contraste >= 7 ? `#${m[1]}` : "#1c1917";
}

// Normalise un numéro de téléphone FR : espaces/points retirés,
// +33 converti en 0. Retourne null si invalide.
export function normaliserTelephone(brut: string): string | null {
  let n = brut.replace(/[\s.\-()]/g, "");
  if (n.startsWith("+33")) n = "0" + n.slice(3);
  if (n.startsWith("0033")) n = "0" + n.slice(4);
  if (!/^0[1-9]\d{8}$/.test(n)) return null;
  return n;
}
