-- ============================================================
-- WALLETIZ — Migration n°10 : forme des tampons
-- À exécuter APRÈS migration-9.
-- ============================================================

alter table public.cartes
  add column if not exists tampon_forme text not null default 'carre'
  check (tampon_forme in ('carre', 'cercle', 'hexagone', 'etoile'));
