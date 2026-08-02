-- =====================================================================
-- WALLETIZ — Régénérer la liste « Derniers tampons donnés » du resto DÉMO
--
-- Recrée ~90 attributions INDIVIDUELLES (une ligne = un client, une heure)
-- pour que la liste « Derniers tampons donnés » du scanner soit bien remplie
-- et réaliste. Efface d'abord les anciennes lignes individuelles (dont tes
-- tampons de test) SANS toucher aux lignes agrégées qui alimentent les
-- graphiques (mois / semaine) — celles-ci ont un « nombre » élevé.
--
-- À lancer autant de fois que tu veux (idempotent : il nettoie puis recrée).
-- =====================================================================
do $$
declare
  v_slug   text := 'cafe-d-or';   -- slug du resto démo (Top Burger)
  v_resto  uuid;
  v_carte  uuid;
  v_fin    date;
  v_client uuid;
  v_ids    uuid[];
  i        int;
begin
  select id into v_resto from public.restaurants where slug = v_slug;
  if v_resto is null then
    raise exception 'Resto introuvable (slug "%").', v_slug;
  end if;

  select id into v_carte
  from public.cartes
  where restaurant_id = v_resto and actif = true
  order by created_at asc limit 1;
  if v_carte is null then
    raise exception 'Aucune carte de fidélité active sur ce resto.';
  end if;

  -- Dernier jour du mois précédent : on date les tampons sur juillet pour que
  -- le mois en cours (août) reste à 0 dans le graphique.
  v_fin := date_trunc('month', current_date)::date - 1;

  -- Clients démo de ce resto
  select array_agg(id) into v_ids
  from public.clients_fidelite
  where restaurant_id = v_resto and token_cookie like 'demo-%';
  if v_ids is null then
    raise exception 'Aucun client démo. Lance d''abord le script de remplissage.';
  end if;

  -- Nettoie les lignes INDIVIDUELLES (nombre = 1) : anciennes + tampons de
  -- test. Les lignes agrégées des graphiques (nombre >= 2) sont conservées.
  delete from public.tampons_historique
  where restaurant_id = v_resto and nombre = 1;

  -- Recrée ~90 attributions individuelles, heures réalistes (7h → 18h).
  for i in 1..90 loop
    v_client := v_ids[1 + (random() * (array_length(v_ids, 1) - 1))::int];
    insert into public.tampons_historique
      (restaurant_id, carte_id, client_id, nombre, date_attribution, created_at)
    values
      (v_resto, v_carte, v_client, 1, v_fin,
       v_fin::timestamptz + interval '7 hours' + (random() * interval '11 hours'));
  end loop;

  raise notice 'Liste « Derniers tampons donnés » régénérée : 90 attributions.';
end $$;
