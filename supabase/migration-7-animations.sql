-- ============================================================
-- WALLETIZ — Migration n°7 : refonte des animations (retrait emojis)
-- À exécuter APRÈS migration-6.
-- ============================================================

-- Les anciens types confettis / coeurs / feux basculent vers "etoiles"
update public.restaurants
  set animation_recompense = 'etoiles'
  where animation_recompense in ('confettis', 'coeurs', 'feux');

-- Nouvelle contrainte : aucune / etoiles / ondes / rayons / vague
alter table public.restaurants
  drop constraint if exists restaurants_animation_recompense_check;
alter table public.restaurants
  add constraint restaurants_animation_recompense_check
  check (animation_recompense in ('aucune', 'etoiles', 'ondes', 'rayons', 'vague'));
