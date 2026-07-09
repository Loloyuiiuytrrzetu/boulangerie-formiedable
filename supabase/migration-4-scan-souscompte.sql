-- ============================================================
-- WALLETIZ — Migration n°4 : scan strict, sous-compte, animations,
--   récompenses en attente. À exécuter APRÈS migration-3.
-- ============================================================

-- 1. Options restaurateur : 1 tampon par carte ou par visite, animation
alter table public.restaurants
  add column if not exists tampon_par_carte boolean not null default true;

alter table public.restaurants
  add column if not exists animation_recompense text not null default 'confettis'
  check (animation_recompense in ('confettis', 'coeurs', 'etoiles', 'feux'));

-- 2. Rôle "sous_compte" autorisé pour les profils
alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('restaurateur', 'super_admin', 'sous_compte'));

-- 3. Table sous_comptes : 1 seul sous-compte par restaurant
create table if not exists public.sous_comptes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  restaurant_id uuid not null unique references public.restaurants (id) on delete cascade,
  nom text not null,
  email text not null,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists sous_comptes_restaurant_idx on public.sous_comptes (restaurant_id);

alter table public.sous_comptes enable row level security;

drop policy if exists "sous_comptes: lecture par le proprietaire" on public.sous_comptes;
create policy "sous_comptes: lecture par le proprietaire"
  on public.sous_comptes for select
  using (
    user_id = auth.uid()
    or public.is_super_admin()
    or exists (select 1 from public.restaurants r
               where r.id = restaurant_id and r.owner_id = auth.uid())
  );

-- 4. Récompenses gagnées : le client accumule des récompenses en attente
create table if not exists public.recompenses_gagnees (
  id uuid primary key default gen_random_uuid(),
  carte_id uuid not null references public.cartes (id) on delete cascade,
  client_id uuid not null references public.clients_fidelite (id) on delete cascade,
  recompense_id uuid references public.recompenses (id) on delete set null,
  texte_recompense text not null,      -- copié à la création (si la récompense disparaît)
  image_url text,                       -- copié à la création
  date_gagnee timestamptz not null default now(),
  date_utilisee timestamptz             -- null = disponible ; renseigné = utilisée
);
create index if not exists recompenses_gagnees_client_idx on public.recompenses_gagnees (client_id);
create index if not exists recompenses_gagnees_carte_idx on public.recompenses_gagnees (carte_id);

alter table public.recompenses_gagnees enable row level security;

drop policy if exists "recompenses_gagnees: lecture proprietaire" on public.recompenses_gagnees;
create policy "recompenses_gagnees: lecture proprietaire"
  on public.recompenses_gagnees for select
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.cartes c
      join public.restaurants r on r.id = c.restaurant_id
      where c.id = carte_id and r.owner_id = auth.uid()
    )
  );

-- 5. Helper : à quel restaurant appartient l'utilisateur courant
--    (comme restaurateur ou comme sous-compte) ? -- pour /scanner
create or replace function public.restaurant_de_user()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select id from public.restaurants where owner_id = auth.uid() limit 1),
    (select restaurant_id from public.sous_comptes
     where user_id = auth.uid() and actif = true limit 1)
  );
$$;
