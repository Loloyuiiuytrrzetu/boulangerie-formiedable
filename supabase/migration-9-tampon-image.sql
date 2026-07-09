-- ============================================================
-- WALLETIZ — Migration n°9 : image de tampon personnalisée par carte
-- À exécuter APRÈS migration-8.
-- ============================================================

alter table public.cartes
  add column if not exists tampon_image_url text;
