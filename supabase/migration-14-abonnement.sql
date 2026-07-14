-- ============================================================
-- WALLETIZ — Migration n°14 : abonnement Pro + essai 7 jours
-- ============================================================

alter table public.restaurants
  add column if not exists abonnement_statut text not null default 'essai'
    check (abonnement_statut in ('essai', 'actif', 'annule', 'expire')),
  add column if not exists essai_fin_le timestamptz default (now() + interval '7 days'),
  add column if not exists abonnement_debut_le timestamptz,
  add column if not exists abonnement_prochaine_facture_le timestamptz,
  add column if not exists abonnement_annule_le timestamptz,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

-- Index pour retrouver rapidement les essais qui se terminent
create index if not exists restaurants_essai_fin_idx
  on public.restaurants (essai_fin_le)
  where abonnement_statut = 'essai';

-- Index pour retrouver rapidement les abonnements annulés à ne plus
-- renouveler
create index if not exists restaurants_annule_idx
  on public.restaurants (abonnement_prochaine_facture_le)
  where abonnement_statut = 'annule';
