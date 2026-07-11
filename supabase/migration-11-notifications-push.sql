-- ============================================================
-- WALLETIZ — Migration n°11 : notifications push
-- À exécuter APRÈS migration-10.
-- ============================================================

-- Table des abonnements push par client (un client peut avoir
-- plusieurs appareils, chacun avec un endpoint unique).
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients_fidelite(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_restaurant_id_idx
  on public.push_subscriptions (restaurant_id);
create index if not exists push_subscriptions_client_id_idx
  on public.push_subscriptions (client_id);

-- Table des notifications envoyées / programmées par le restaurateur.
-- date_programmee = null pour un envoi immédiat déjà expédié.
-- envoyee_at = null tant que non expédiée (cas des programmées futures).
create table if not exists public.notifications_push (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  titre text not null,
  message text not null,
  date_programmee timestamptz,
  envoyee_at timestamptz,
  nb_envois integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists notifications_push_restaurant_idx
  on public.notifications_push (restaurant_id);
create index if not exists notifications_push_pending_idx
  on public.notifications_push (date_programmee)
  where envoyee_at is null and date_programmee is not null;

-- RLS : abonnements accessibles au restaurateur du commerce
alter table public.push_subscriptions enable row level security;
alter table public.notifications_push enable row level security;

drop policy if exists "push_subs_select_own" on public.push_subscriptions;
create policy "push_subs_select_own"
  on public.push_subscriptions for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = push_subscriptions.restaurant_id
        and (r.owner_id = auth.uid() or public.is_super_admin())
    )
  );

drop policy if exists "notifications_push_all_own" on public.notifications_push;
create policy "notifications_push_all_own"
  on public.notifications_push for all
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = notifications_push.restaurant_id
        and (r.owner_id = auth.uid() or public.is_super_admin())
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = notifications_push.restaurant_id
        and (r.owner_id = auth.uid() or public.is_super_admin())
    )
  );
