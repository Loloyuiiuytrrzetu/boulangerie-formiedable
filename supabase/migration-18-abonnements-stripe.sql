-- ============================================================
-- WALLETIZ — Migration n°18 : table tampon des abonnements Stripe
-- ============================================================
--
-- Le client paie sur Stripe AVANT que le super-admin ne crée son compte.
-- Le webhook Stripe enregistre donc l'état du paiement ici, indexé par
-- l'email utilisé pour payer. Quand le super-admin crée ensuite le compte
-- restaurateur avec le même email, on retrouve l'abonnement et on le relie
-- automatiquement au restaurant.
--
-- Cette table est écrite/lue UNIQUEMENT par le serveur (clé service_role) :
-- webhook Stripe + action de création côté super-admin.

create table if not exists public.abonnements_stripe (
  stripe_customer_id text primary key,
  email text not null,
  stripe_subscription_id text,
  statut text,                       -- active, trialing, past_due, canceled, unpaid…
  prochaine_facture_le timestamptz,
  annule_a_la_fin boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists abonnements_stripe_email_idx
  on public.abonnements_stripe (lower(email));

-- RLS activée sans policy : personne côté anon ne peut lire/écrire.
-- Le service_role (serveur) contourne la RLS.
alter table public.abonnements_stripe enable row level security;
