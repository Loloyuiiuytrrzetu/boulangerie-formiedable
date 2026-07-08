-- ============================================================
-- FIDELIO — Migration n°3 : améliorations
-- À exécuter dans Supabase > SQL Editor APRÈS migration-2.
-- ============================================================

-- 1. Le maximum de tampons passe de 30 à 20
alter table public.cartes
  drop constraint if exists cartes_nombre_tampons_requis_check;
alter table public.cartes
  add constraint cartes_nombre_tampons_requis_check
  check (nombre_tampons_requis between 1 and 20);

alter table public.restaurants
  drop constraint if exists restaurants_nombre_tampons_requis_check;
alter table public.restaurants
  add constraint restaurants_nombre_tampons_requis_check
  check (nombre_tampons_requis between 1 and 20);

-- 2. Couleur du QR code (choisie par le restaurateur)
alter table public.restaurants
  add column if not exists couleur_qr text not null default '#380b15';
