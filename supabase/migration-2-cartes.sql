-- ============================================================
-- FIDELIO — Migration n°2 : cartes multiples + récompenses
-- À exécuter dans Supabase > SQL Editor APRÈS schema.sql.
-- Sans danger pour les données existantes : la configuration
-- actuelle de chaque restaurant devient sa première carte.
-- ============================================================

-- 1. Image de fond du commerce (en plus du logo)
alter table public.restaurants add column if not exists fond_url text;

-- 2. TABLE cartes : une carte de fidélité configurable
create table if not exists public.cartes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  titre text not null default 'Carte de fidélité',
  tampon_icone text not null default 'cafe',
  nombre_tampons_requis int not null default 10
    check (nombre_tampons_requis between 1 and 30),
  texte_bas text,          -- petit texte optionnel en bas de la carte
  date_expiration date,    -- null = pas d'expiration
  actif boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists cartes_restaurant_idx on public.cartes (restaurant_id);

-- 3. TABLE recompenses : les récompenses d'une carte (image optionnelle)
create table if not exists public.recompenses (
  id uuid primary key default gen_random_uuid(),
  carte_id uuid not null references public.cartes (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  texte text not null,
  image_url text,
  created_at timestamptz not null default now()
);
create index if not exists recompenses_carte_idx on public.recompenses (carte_id);
create index if not exists recompenses_restaurant_idx on public.recompenses (restaurant_id);

-- 4. TABLE cartes_clients : progression d'un client sur UNE carte
create table if not exists public.cartes_clients (
  id uuid primary key default gen_random_uuid(),
  carte_id uuid not null references public.cartes (id) on delete cascade,
  client_id uuid not null references public.clients_fidelite (id) on delete cascade,
  tampons_actuels int not null default 0,
  tampons_total int not null default 0,
  recompenses_reclamees int not null default 0,
  date_dernier_tampon date,
  created_at timestamptz not null default now(),
  unique (carte_id, client_id)
);
create index if not exists cartes_clients_carte_idx on public.cartes_clients (carte_id);
create index if not exists cartes_clients_client_idx on public.cartes_clients (client_id);

-- 5. RLS
alter table public.cartes enable row level security;
alter table public.recompenses enable row level security;
alter table public.cartes_clients enable row level security;

-- cartes : lecture publique (page client), gestion par le propriétaire
drop policy if exists "cartes: lecture publique" on public.cartes;
create policy "cartes: lecture publique"
  on public.cartes for select
  using (true);

drop policy if exists "cartes: gestion par le proprietaire" on public.cartes;
create policy "cartes: gestion par le proprietaire"
  on public.cartes for all
  using (
    public.is_super_admin()
    or exists (select 1 from public.restaurants r
               where r.id = restaurant_id and r.owner_id = auth.uid())
  )
  with check (
    public.is_super_admin()
    or exists (select 1 from public.restaurants r
               where r.id = restaurant_id and r.owner_id = auth.uid())
  );

-- recompenses : lecture publique, gestion par le propriétaire
drop policy if exists "recompenses: lecture publique" on public.recompenses;
create policy "recompenses: lecture publique"
  on public.recompenses for select
  using (true);

drop policy if exists "recompenses: gestion par le proprietaire" on public.recompenses;
create policy "recompenses: gestion par le proprietaire"
  on public.recompenses for all
  using (
    public.is_super_admin()
    or exists (select 1 from public.restaurants r
               where r.id = restaurant_id and r.owner_id = auth.uid())
  )
  with check (
    public.is_super_admin()
    or exists (select 1 from public.restaurants r
               where r.id = restaurant_id and r.owner_id = auth.uid())
  );

-- cartes_clients : lecture par le propriétaire du restaurant / super admin
-- (les clients anonymes passent par le serveur avec la clé service_role)
drop policy if exists "cartes_clients: lecture proprietaire" on public.cartes_clients;
create policy "cartes_clients: lecture proprietaire"
  on public.cartes_clients for select
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.cartes c
      join public.restaurants r on r.id = c.restaurant_id
      where c.id = carte_id and r.owner_id = auth.uid()
    )
  );

-- 6. MIGRATION DES DONNÉES EXISTANTES
-- a) chaque restaurant reçoit une carte reprenant sa config actuelle
insert into public.cartes (restaurant_id, titre, tampon_icone, nombre_tampons_requis)
select r.id, 'Carte de fidélité', r.tampon_icone, r.nombre_tampons_requis
from public.restaurants r
where not exists (select 1 from public.cartes c where c.restaurant_id = r.id);

-- b) la récompense actuelle du restaurant devient la récompense de cette carte
insert into public.recompenses (carte_id, restaurant_id, texte)
select c.id, c.restaurant_id, r.texte_recompense
from public.cartes c
join public.restaurants r on r.id = c.restaurant_id
where not exists (select 1 from public.recompenses x where x.carte_id = c.id);

-- c) les tampons déjà accumulés par les clients sont reportés sur cette carte
insert into public.cartes_clients
  (carte_id, client_id, tampons_actuels, tampons_total, recompenses_reclamees, date_dernier_tampon)
select c.id, cf.id, cf.tampons_actuels, cf.tampons_total, cf.recompenses_reclamees, cf.date_dernier_tampon
from public.clients_fidelite cf
join public.cartes c on c.restaurant_id = cf.restaurant_id
on conflict (carte_id, client_id) do nothing;
