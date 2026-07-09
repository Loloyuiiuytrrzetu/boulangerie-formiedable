-- ============================================================
-- WALLETIZ — Migration n°8 : nom/prénom du client
-- À exécuter APRÈS migration-7.
-- ============================================================

alter table public.clients_fidelite
  add column if not exists identite text;
