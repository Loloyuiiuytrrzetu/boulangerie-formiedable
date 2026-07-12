// Liste prédéfinie d'icônes de tampon proposées au restaurateur
export const TAMPON_ICONES: Record<string, { emoji: string; label: string }> = {
  // Boissons chaudes
  cafe: { emoji: "☕", label: "Café" },
  the: { emoji: "🍵", label: "Thé" },
  // Boissons froides
  cocktail: { emoji: "🍸", label: "Cocktail" },
  biere: { emoji: "🍺", label: "Bière" },
  vin: { emoji: "🍷", label: "Vin" },
  jus: { emoji: "🧃", label: "Jus" },
  bubble: { emoji: "🧋", label: "Bubble tea" },
  champagne: { emoji: "🍾", label: "Champagne" },
  // Boulangerie / pâtisserie
  croissant: { emoji: "🥐", label: "Croissant" },
  baguette: { emoji: "🥖", label: "Baguette" },
  bagel: { emoji: "🥯", label: "Bagel" },
  gateau: { emoji: "🍰", label: "Gâteau" },
  cupcake: { emoji: "🧁", label: "Cupcake" },
  donut: { emoji: "🍩", label: "Donut" },
  biscuit: { emoji: "🍪", label: "Biscuit" },
  chocolat: { emoji: "🍫", label: "Chocolat" },
  bonbon: { emoji: "🍬", label: "Bonbon" },
  glace: { emoji: "🍦", label: "Glace" },
  flan: { emoji: "🍮", label: "Flan" },
  // Restauration
  pizza: { emoji: "🍕", label: "Pizza" },
  burger: { emoji: "🍔", label: "Burger" },
  sushi: { emoji: "🍣", label: "Sushi" },
  ramen: { emoji: "🍜", label: "Ramen" },
  tacos: { emoji: "🌮", label: "Tacos" },
};

export function iconeEmoji(cle: string): string {
  if (TAMPON_ICONES[cle]) return TAMPON_ICONES[cle].emoji;
  // Emoji personnalisé saisi par le restaurateur : stocké tel quel dans la
  // colonne tampon_icone (préfixé par "custom:" pour éviter les collisions
  // improbables avec une clé prédéfinie).
  if (cle.startsWith("custom:")) return cle.slice(7);
  return "⭐";
}
