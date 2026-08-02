-- =====================================================================
-- WALLETIZ — Guide d'utilisation en vidéo (côté restaurateur)
--
-- Un ensemble de vidéos tutoriels, gérées par le SUPER ADMIN, affichées en
-- bas du dashboard de TOUS les restaurateurs (« Guide d'utilisation »).
-- Les fichiers vidéo sont stockés dans un bucket Storage public « guides ».
-- L'upload se fait en direct du navigateur vers Supabase (pas via le serveur
-- Next) pour ne pas être bridé par la taille des requêtes.
-- =====================================================================

-- ---- Table des vidéos ----
create table if not exists public.guides_video (
  id         uuid primary key default gen_random_uuid(),
  titre      text not null,
  video_url  text not null,          -- URL publique du fichier dans le bucket
  chemin     text,                    -- chemin dans le bucket (pour suppression)
  ordre      int  not null default 0, -- ordre d'affichage
  created_at timestamptz not null default now()
);

alter table public.guides_video enable row level security;

-- Lecture : tout utilisateur connecté (restaurateur, sous-compte, admin).
drop policy if exists "guides_video: lecture" on public.guides_video;
create policy "guides_video: lecture"
  on public.guides_video for select
  to authenticated
  using (true);

-- Écriture : réservée au super admin (les Server Actions passent par la clé
-- service_role qui contourne RLS ; cette policy sécurise tout accès direct).
drop policy if exists "guides_video: ecriture super admin" on public.guides_video;
create policy "guides_video: ecriture super admin"
  on public.guides_video for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ---- Bucket de stockage (public en lecture) ----
insert into storage.buckets (id, name, public)
values ('guides', 'guides', true)
on conflict (id) do nothing;

-- Lecture publique des fichiers du bucket (nécessaire pour lire les vidéos).
drop policy if exists "guides: lecture publique" on storage.objects;
create policy "guides: lecture publique"
  on storage.objects for select
  using (bucket_id = 'guides');

-- Upload / mise à jour / suppression : super admin uniquement. C'est ce qui
-- autorise l'upload DIRECT depuis le navigateur du super admin.
drop policy if exists "guides: upload super admin" on storage.objects;
create policy "guides: upload super admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'guides' and public.is_super_admin());

drop policy if exists "guides: maj super admin" on storage.objects;
create policy "guides: maj super admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'guides' and public.is_super_admin());

drop policy if exists "guides: suppression super admin" on storage.objects;
create policy "guides: suppression super admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'guides' and public.is_super_admin());
