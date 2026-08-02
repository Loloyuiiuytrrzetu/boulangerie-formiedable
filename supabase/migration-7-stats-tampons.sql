-- =====================================================================
-- WALLETIZ — Statistiques de tampons EXACTES, quel que soit le volume
--
-- Problème : les graphiques lisaient les lignes brutes de tampons_historique
-- et les additionnaient côté navigateur. Supabase plafonnant chaque requête
-- à ~1000 lignes, un commerce à très gros volume voyait ses mois anciens
-- sous-comptés à l'affichage.
--
-- Solution : cette fonction fait l'addition DANS la base (sum()), qui n'a
-- aucune limite de lignes. Elle renvoie :
--   • par_mois : total EXACT par (année, mois) sur TOUT l'historique
--                (résultat minuscule : au plus ~12 lignes par année) ;
--   • par_jour : total par jour sur les 45 derniers jours (assez pour le
--                graphique « 7 derniers jours » et le compteur du jour).
--
-- Les totaux sont donc parfaitement justes à l'infini, sans jamais dépendre
-- du nombre de lignes lues.
-- =====================================================================
create or replace function public.stats_tampons(p_restaurant uuid)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'par_mois', coalesce((
      select jsonb_agg(row_to_json(m))
      from (
        select extract(year  from date_attribution)::int as annee,
               extract(month from date_attribution)::int as mois,
               sum(nombre)::bigint                        as total
        from public.tampons_historique
        where restaurant_id = p_restaurant
        group by 1, 2
        order by 1, 2
      ) m
    ), '[]'::jsonb),
    'par_jour', coalesce((
      select jsonb_agg(row_to_json(j))
      from (
        select to_char(date_attribution, 'YYYY-MM-DD') as jour,
               sum(nombre)::bigint                      as total
        from public.tampons_historique
        where restaurant_id = p_restaurant
          and date_attribution >= (current_date - 45)
        group by date_attribution
        order by date_attribution
      ) j
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.stats_tampons(uuid) to anon, authenticated, service_role;
