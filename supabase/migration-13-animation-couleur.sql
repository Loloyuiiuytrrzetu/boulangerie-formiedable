-- ============================================================
-- WALLETIZ — Migration n°13 : couleur de l'animation de récompense
-- Permet au restaurateur de choisir une couleur indépendante de la
-- couleur principale de son commerce. Par défaut : jaune brillant.
-- ============================================================

alter table public.restaurants
  add column if not exists animation_couleur text not null default '#FFD700';

-- Nouveau défaut : rayons éclatants (au lieu de confettis pour les
-- nouveaux commerces, quand la colonne accepte encore la valeur).
alter table public.restaurants
  alter column animation_recompense set default 'rayons';
