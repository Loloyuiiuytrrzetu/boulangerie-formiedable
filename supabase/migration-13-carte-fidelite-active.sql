-- Interrupteur « carte de fidélité » par commerce.
-- Quand la valeur est FALSE, tout ce qui touche à la fidélité disparaît côté
-- client (onglet Cartes, onglet Scan, QR code personnel, récompenses) : le
-- commerce devient une simple page « suivez-nous » (Instagram/TikTok, Info,
-- sections personnalisées). Rien n'est supprimé en base : remettre TRUE
-- rétablit tout à l'identique.
alter table restaurants
  add column if not exists carte_fidelite_active boolean not null default true;
