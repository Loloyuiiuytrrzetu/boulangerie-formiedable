// Liste prédéfinie d'icônes de tampon proposées au restaurateur
export const TAMPON_ICONES: Record<string, { emoji: string; label: string }> = {
  cafe: { emoji: "☕", label: "Café" },
  pizza: { emoji: "🍕", label: "Pizza" },
  croissant: { emoji: "🥐", label: "Croissant" },
  baguette: { emoji: "🥖", label: "Baguette" },
  burger: { emoji: "🍔", label: "Burger" },
  sushi: { emoji: "🍣", label: "Sushi" },
  glace: { emoji: "🍦", label: "Glace" },
  gateau: { emoji: "🍰", label: "Gâteau" },
  cocktail: { emoji: "🍸", label: "Cocktail" },
  sandwich: { emoji: "🥪", label: "Sandwich" },
  salade: { emoji: "🥗", label: "Salade" },
  the: { emoji: "🍵", label: "Thé" },
};

export function iconeEmoji(cle: string): string {
  return TAMPON_ICONES[cle]?.emoji ?? "⭐";
}
