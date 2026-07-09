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
  burrito: { emoji: "🌯", label: "Burrito" },
  hotdog: { emoji: "🌭", label: "Hot-dog" },
  sandwich: { emoji: "🥪", label: "Sandwich" },
  salade: { emoji: "🥗", label: "Salade" },
  brochette: { emoji: "🍢", label: "Brochette" },
  poulet: { emoji: "🍗", label: "Poulet" },
  // Fruits
  pomme: { emoji: "🍎", label: "Pomme" },
  fraise: { emoji: "🍓", label: "Fraise" },
  orange: { emoji: "🍊", label: "Orange" },
  banane: { emoji: "🍌", label: "Banane" },
};

export function iconeEmoji(cle: string): string {
  return TAMPON_ICONES[cle]?.emoji ?? "⭐";
}
