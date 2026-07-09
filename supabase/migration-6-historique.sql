-- ============================================================
-- WALLETIZ — Migration n°6 : historique des tampons + fuseau horaire
-- À exécuter APRÈS migration-5.
-- ============================================================

-- 1. Historique complet des tampons pour les graphiques
create table if not exists public.tampons_historique (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  carte_id uuid references public.cartes (id) on delete set null,
  client_id uuid references public.clients_fidelite (id) on delete set null,
  nombre int not null default 1,
  date_attribution date not null,
  created_at timestamptz not null default now()
);
create index if not exists tampons_historique_restaurant_date_idx
  on public.tampons_historique (restaurant_id, date_attribution);

alter table public.tampons_historique enable row level security;

drop policy if exists "tampons_historique: lecture proprietaire" on public.tampons_historique;
create policy "tampons_historique: lecture proprietaire"
  on public.tampons_historique for select
  using (
    public.is_super_admin()
    or exists (select 1 from public.restaurants r
               where r.id = restaurant_id and r.owner_id = auth.uid())
  );

-- 2. Fuseau horaire du commerce (défini par le super admin à la création)
alter table public.restaurants
  add column if not exists timezone text not null default 'Europe/Paris';

-- NOTE : pas de backfill des anciens tampons. Les graphiques comptent
-- uniquement les tampons attribués à partir de maintenant. C'est la
-- garantie que les chiffres affichés sont exacts.
