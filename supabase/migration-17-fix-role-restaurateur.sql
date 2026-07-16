-- Répare les profils dont le rôle est incorrect : tout utilisateur qui
-- possède un restaurant (owner_id) doit avoir role = 'restaurateur'.
-- Ce cas se produit quand un utilisateur avait d'abord été créé comme
-- sous-compte puis réutilisé par le super-admin pour un restaurant :
-- le trigger on_auth_user_created ne se déclenche que sur INSERT auth.users,
-- donc la ligne profiles gardait son ancien rôle 'sous_compte' et le
-- middleware redirigeait vers /dashboard/scanner à la connexion.

update public.profiles p
set role = 'restaurateur'
where role <> 'restaurateur'
  and exists (
    select 1 from public.restaurants r where r.owner_id = p.id
  );
