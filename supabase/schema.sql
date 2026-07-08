-- ============================================================
-- FIDELIO — Schéma Supabase complet
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLE profiles : rôle de chaque utilisateur authentifié
--    (restaurateur ou super_admin), liée à auth.users
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'restaurateur'
    check (role in ('restaurateur', 'super_admin')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. TABLE restaurants : configuration de chaque commerce
-- ------------------------------------------------------------
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  nom text not null,
  slug text not null unique,
  logo_url text,
  couleur text not null default '#7A1E2E',
  tampon_icone text not null default 'cafe',
  nombre_tampons_requis int not null default 10
    check (nombre_tampons_requis between 1 and 30),
  texte_recompense text not null default '1 café offert',
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists restaurants_owner_idx on public.restaurants (owner_id);
create index if not exists restaurants_slug_idx on public.restaurants (slug);

-- ------------------------------------------------------------
-- 3. TABLE clients_fidelite : une fiche par client et par commerce
-- ------------------------------------------------------------
create table if not exists public.clients_fidelite (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  numero_telephone text not null,
  tampons_actuels int not null default 0,
  tampons_total int not null default 0,          -- cumul (stats super admin)
  recompenses_reclamees int not null default 0,  -- cumul (stats)
  date_dernier_tampon date,                      -- anti "2 tampons le même jour"
  token_cookie text not null unique,             -- reconnaissance auto via cookie
  notifications_push_actif boolean not null default false,
  created_at timestamptz not null default now(),
  unique (restaurant_id, numero_telephone)
);

create index if not exists clients_restaurant_idx on public.clients_fidelite (restaurant_id);
create index if not exists clients_token_idx on public.clients_fidelite (token_cookie);

-- ------------------------------------------------------------
-- 4. Fonction utilitaire : l'utilisateur courant est-il super admin ?
--    SECURITY DEFINER pour éviter la récursion RLS sur profiles.
-- ------------------------------------------------------------
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- ------------------------------------------------------------
-- 5. Trigger : création automatique du profil à l'inscription
--    (rôle par défaut : restaurateur)
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, coalesce(new.raw_app_meta_data->>'role', 'restaurateur'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.clients_fidelite enable row level security;

-- ---- profiles ----
drop policy if exists "profiles: lecture de son propre profil" on public.profiles;
create policy "profiles: lecture de son propre profil"
  on public.profiles for select
  using (id = auth.uid() or public.is_super_admin());

-- ---- restaurants ----
-- Lecture publique (page client /c/[slug]) : uniquement les commerces actifs
drop policy if exists "restaurants: lecture publique des commerces actifs" on public.restaurants;
create policy "restaurants: lecture publique des commerces actifs"
  on public.restaurants for select
  using (actif = true or owner_id = auth.uid() or public.is_super_admin());

-- Le restaurateur modifie UNIQUEMENT son propre commerce ; le super admin, tout
drop policy if exists "restaurants: modification par le proprietaire" on public.restaurants;
create policy "restaurants: modification par le proprietaire"
  on public.restaurants for update
  using (owner_id = auth.uid() or public.is_super_admin())
  with check (owner_id = auth.uid() or public.is_super_admin());

drop policy if exists "restaurants: insertion par le proprietaire" on public.restaurants;
create policy "restaurants: insertion par le proprietaire"
  on public.restaurants for insert
  with check (owner_id = auth.uid() or public.is_super_admin());

drop policy if exists "restaurants: suppression super admin" on public.restaurants;
create policy "restaurants: suppression super admin"
  on public.restaurants for delete
  using (public.is_super_admin());

-- ---- clients_fidelite ----
-- Les clients finaux ne sont PAS authentifiés : toutes leurs opérations
-- passent par le serveur Next.js avec la clé service_role (qui contourne RLS).
-- Côté clé anon, seuls le restaurateur propriétaire et le super admin
-- peuvent LIRE les fiches (stats du dashboard).
drop policy if exists "clients: lecture par le proprietaire du restaurant" on public.clients_fidelite;
create policy "clients: lecture par le proprietaire du restaurant"
  on public.clients_fidelite for select
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 7. STORAGE : bucket public pour les logos des commerces
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

drop policy if exists "logos: lecture publique" on storage.objects;
create policy "logos: lecture publique"
  on storage.objects for select
  using (bucket_id = 'logos');

-- Upload/remplacement par les utilisateurs authentifiés (le fichier est
-- rangé dans un dossier portant l'id de leur restaurant, vérifié côté serveur)
drop policy if exists "logos: upload authentifie" on storage.objects;
create policy "logos: upload authentifie"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.role() = 'authenticated');

drop policy if exists "logos: remplacement authentifie" on storage.objects;
create policy "logos: remplacement authentifie"
  on storage.objects for update
  using (bucket_id = 'logos' and auth.role() = 'authenticated');

-- ============================================================
-- 8. APRÈS AVOIR EXÉCUTÉ CE SCRIPT :
--
-- a) Créez votre compte SUPER ADMIN :
--    - Dashboard Supabase > Authentication > Users > Add user
--      (email + mot de passe, cochez "Auto Confirm User")
--    - Puis exécutez :
--      update public.profiles set role = 'super_admin'
--      where id = (select id from auth.users where email = 'VOTRE_EMAIL');
--
-- b) Les comptes restaurateurs se créent ensuite depuis /super-admin.
-- ============================================================
