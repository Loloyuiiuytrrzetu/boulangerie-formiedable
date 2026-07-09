-- ============================================================
-- WALLETIZ — Migration n°5 : sections personnalisables + QR client
-- À exécuter APRÈS migration-4.
-- ============================================================

-- 1. Table sections (onglets sous le hero)
create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  type text not null default 'personnalisee'
    check (type in ('cartes', 'info', 'personnalisee')),
  titre text not null,
  texte text,
  lien_url text,
  lien_libelle text,
  ordre int not null default 0,
  supprimable boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists sections_restaurant_idx on public.sections (restaurant_id, ordre);

alter table public.sections enable row level security;

drop policy if exists "sections: lecture publique" on public.sections;
create policy "sections: lecture publique"
  on public.sections for select using (true);

drop policy if exists "sections: gestion" on public.sections;
create policy "sections: gestion"
  on public.sections for all
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

-- 2. Sections par défaut pour tous les commerces existants
insert into public.sections (restaurant_id, type, titre, ordre, supprimable)
select r.id, 'cartes', 'Cartes de fidélité', 0, false
from public.restaurants r
where not exists (
  select 1 from public.sections s where s.restaurant_id = r.id and s.type = 'cartes'
);

insert into public.sections (restaurant_id, type, titre, texte, ordre, supprimable)
select r.id, 'info',
       'Info',
       'Présentez ce QR code au commerçant à chaque passage pour recevoir vos tampons.',
       100, false
from public.restaurants r
where not exists (
  select 1 from public.sections s where s.restaurant_id = r.id and s.type = 'info'
);

-- 3. Token public de chaque client pour son QR code personnel (scan par le
--    restaurateur). Contrairement à token_cookie (httpOnly), celui-ci est
--    partagé en public — il ne sert qu'à identifier le client depuis un scan.
alter table public.clients_fidelite
  add column if not exists token_public text unique;
update public.clients_fidelite
  set token_public = replace(gen_random_uuid()::text, '-', '')
  where token_public is null;
alter table public.clients_fidelite
  alter column token_public set default replace(gen_random_uuid()::text, '-', '');

-- 4. Animation "aucune" pour restaurateur qui ne veut pas d'effet
alter table public.restaurants
  drop constraint if exists restaurants_animation_recompense_check;
alter table public.restaurants
  add constraint restaurants_animation_recompense_check
  check (animation_recompense in ('aucune', 'confettis', 'coeurs', 'etoiles', 'feux'));
