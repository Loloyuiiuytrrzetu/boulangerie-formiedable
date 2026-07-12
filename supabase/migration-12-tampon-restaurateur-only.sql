-- ============================================================
-- WALLETIZ — Migration n°12 : mode "restaurateur uniquement"
-- Quand ce mode est activé, seul le restaurateur (ou son sous-compte)
-- peut attribuer des tampons via le scanner. Le bouton client
-- "Prendre mon tampon" disparaît.
-- ============================================================

alter table public.restaurants
  add column if not exists tampon_restaurateur_only boolean not null default false;
