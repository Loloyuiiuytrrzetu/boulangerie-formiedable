-- Migration 15 : type d'abonnement (mensuel / annuel)
--
-- Chaque restaurant choisi un plan à l'inscription. Ce champ est utilisé
-- par le dashboard super admin pour calculer les revenus récurrents (MRR
-- et ARR) et pour afficher le plan de chaque client.
--
-- 'mensuel' : 64€/mois
-- 'annuel'  : 614€/an (soit 51€/mois, -20%)

alter table public.restaurants
  add column if not exists abonnement_type text
    check (abonnement_type in ('mensuel', 'annuel'));
