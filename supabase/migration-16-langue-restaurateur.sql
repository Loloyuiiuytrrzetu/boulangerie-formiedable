-- Migration 16 : langue du dashboard restaurateur
--
-- Chaque restaurateur choisit sa langue à la création. Le dashboard,
-- les emails et toute l'interface administrateur s'affichent dans cette
-- langue. Peut être changée à tout moment depuis la sidebar du dashboard.
--
-- Langues supportées : fr, en, es, de, zh, ar, ru
-- Par défaut : français.

alter table public.restaurants
  add column if not exists langue text not null default 'fr'
    check (langue in ('fr', 'en', 'es', 'de', 'zh', 'ar', 'ru'));
