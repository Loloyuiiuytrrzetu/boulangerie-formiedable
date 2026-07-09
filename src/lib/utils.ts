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

// Normalise un numéro de téléphone FR : espaces/points retirés,
// +33 converti en 0. Retourne null si invalide.
export function normaliserTelephone(brut: string): string | null {
  let n = brut.replace(/[\s.\-()]/g, "");
  if (n.startsWith("+33")) n = "0" + n.slice(3);
  if (n.startsWith("0033")) n = "0" + n.slice(4);
  if (!/^0[1-9]\d{8}$/.test(n)) return null;
  return n;
}
