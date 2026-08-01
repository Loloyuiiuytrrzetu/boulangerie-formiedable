-- =====================================================================
-- WALLETIZ — Remplir un resto DÉMO (clients + tampons + notifications)
--
-- But : donner à un resto existant l'allure d'un commerce qui CARTONNE,
-- pour le montrer en démo aux prospects (beaux graphiques, gros compteur
-- de tampons du jour, liste de clients, historique de notifications).
--
-- Mode d'emploi :
--   1. Supabase → SQL Editor → New query.
--   2. Colle tout ce fichier.
--   3. Mets le SLUG de ton resto démo dans « v_slug » ci-dessous
--      (le slug = ce qui apparaît dans /c/xxxx, visible sur ton dashboard).
--   4. Exécute. À lancer UNE SEULE FOIS (relancer ajoute encore des données).
--
-- Sécurité : n'insère QUE dans le resto choisi. Les clients démo ont un
-- token « demo-... » (repérables/supprimables) et de vrais numéros français
-- (06/07) réalistes.
-- =====================================================================
do $$
declare
  v_slug        text := 'METS-TON-SLUG-ICI';  -- <<< À MODIFIER
  v_nb_clients  int  := 45;   -- nombre de clients démo à créer
  v_nb_jours    int  := 90;   -- profondeur de l'historique (en jours)

  v_resto  uuid;
  v_carte  uuid;
  v_requis int;
  v_client uuid;
  v_jour   date;
  v_rows   int;
  i        int;
  j        int;
  v_total  int;
  v_reco_id  uuid;
  v_reco_txt text;
  v_reco_img text;
  v_ids    uuid[] := '{}';
  v_noms   text[] := array[
    'Léa Martin','Hugo Bernard','Emma Dubois','Gabriel Thomas','Jade Robert',
    'Louis Richard','Alice Petit','Raphaël Durand','Chloé Leroy','Adam Moreau',
    'Manon Simon','Nathan Laurent','Camille Michel','Lucas Garcia','Sarah David',
    'Enzo Bertrand','Inès Roux','Tom Fontaine','Zoé Vincent','Noah Fournier',
    'Lina Girard','Ethan Bonnet','Anna Lambert','Théo Rousseau','Maya Blanc',
    'Nolan Guerin','Rose Muller','Sacha Henry','Iris Roussel','Timéo Nicolas',
    'Ambre Perrin','Aaron Morel','Alba Gauthier','Isaac Marchand','Lou Duval',
    'Marius Denis','Nina Joly','Eden Roy','Romy Meyer','Kylian Barbier',
    'Elsa Lucas','Milo Renaud','Lise Colin','Axel Brun','Jeanne Faure'
  ];
  v_titres text[] := array[
    'Bienvenue chez nous 👋','Offre du week-end 🎉','Nouveauté à la carte 🍰',
    'Votre café préféré vous attend ☕','Happy hour ce soir 🍹',
    'Merci pour votre fidélité ❤️','Promo -20% aujourd''hui',
    'Événement spécial ce samedi 🎶'
  ];
  v_msgs text[] := array[
    'Passez nous voir, une surprise vous attend !',
    'Ce week-end, une récompense offerte pour 3 tampons.',
    'Découvrez notre nouvelle recette, à goûter absolument.',
    'Un petit creux ? On vous attend !',
    'De 17h à 19h, profitez de nos offres.',
    'Vous êtes au top, merci de votre fidélité !',
    'Aujourd''hui seulement : -20% sur place.',
    'Ambiance musicale et gourmandises ce samedi soir.'
  ];
begin
  -- ---- Resto + carte ----
  select id into v_resto from public.restaurants where slug = v_slug;
  if v_resto is null then
    raise exception 'Aucun resto avec le slug "%". Vérifie le slug.', v_slug;
  end if;

  select id, nombre_tampons_requis into v_carte, v_requis
  from public.cartes
  where restaurant_id = v_resto and actif = true
  order by created_at asc limit 1;
  if v_carte is null then
    raise exception 'Ce resto n''a aucune carte de fidélité active. Crée une carte d''abord.';
  end if;

  -- ---- 1) Clients démo (+ progression sur la carte) ----
  for i in 1..v_nb_clients loop
    v_client := null;
    v_total  := 8 + (random() * 70)::int;
    insert into public.clients_fidelite
      (restaurant_id, numero_telephone, identite, tampons_actuels, tampons_total,
       date_dernier_tampon, token_cookie, notifications_push_actif, created_at)
    values
      (v_resto,
       -- Vrai numéro français réaliste (06/07), unique par client.
       '0' || (case when i % 2 = 0 then '6' else '7' end)
            || lpad(((i * 73421 + 10007) % 100000000)::text, 8, '0'),
       v_noms[1 + ((i - 1) % array_length(v_noms, 1))],
       (random() * (v_requis - 1))::int,
       v_total,
       current_date - (random() * 5)::int,
       'demo-' || gen_random_uuid()::text,
       true,
       now() - ((random() * v_nb_jours)::int || ' days')::interval)
    on conflict (restaurant_id, numero_telephone) do nothing
    returning id into v_client;

    if v_client is not null then
      v_ids := array_append(v_ids, v_client);
      insert into public.cartes_clients
        (carte_id, client_id, tampons_actuels, tampons_total,
         recompenses_reclamees, date_dernier_tampon)
      values
        (v_carte, v_client, (random() * (v_requis - 1))::int, v_total,
         (random() * 4)::int, current_date - (random() * 5)::int)
      on conflict (carte_id, client_id) do nothing;
    end if;
  end loop;

  -- Si les clients existaient déjà (2e exécution), on récupère la liste
  if array_length(v_ids, 1) is null then
    select array_agg(id) into v_ids
    from public.clients_fidelite where restaurant_id = v_resto;
  end if;

  -- ---- 2) Historique des tampons (tendance croissante + week-ends forts) ----
  for j in 0..v_nb_jours loop
    v_jour := current_date - j;
    v_rows := 3
            + ((v_nb_jours - j) / 12)                                   -- plus récent = plus de tampons
            + (case when extract(dow from v_jour) in (0, 6) then 5 else 0 end)  -- bonus week-end
            + (random() * 4)::int;
    for i in 1..v_rows loop
      v_client := v_ids[1 + (random() * (array_length(v_ids, 1) - 1))::int];
      insert into public.tampons_historique
        (restaurant_id, carte_id, client_id, nombre, date_attribution, created_at)
      values
        (v_resto, v_carte, v_client, 1, v_jour, v_jour + (random() * interval '12 hours'));
    end loop;
  end loop;

  -- Pic AUJOURD'HUI (pour le compteur « Tampons distribués aujourd'hui »)
  for i in 1..28 loop
    v_client := v_ids[1 + (random() * (array_length(v_ids, 1) - 1))::int];
    insert into public.tampons_historique
      (restaurant_id, carte_id, client_id, nombre, date_attribution, created_at)
    values
      (v_resto, v_carte, v_client, 1, current_date, now() - (random() * interval '8 hours'));
  end loop;

  -- ---- 2 bis) Récompenses gagnées (en attente) pour du réalisme côté client ----
  select id, texte, image_url into v_reco_id, v_reco_txt, v_reco_img
  from public.recompenses where carte_id = v_carte order by created_at asc limit 1;
  if v_reco_id is not null and array_length(v_ids, 1) is not null then
    for i in 1..10 loop
      v_client := v_ids[1 + (random() * (array_length(v_ids, 1) - 1))::int];
      insert into public.recompenses_gagnees
        (carte_id, client_id, recompense_id, texte_recompense, image_url, date_gagnee)
      values
        (v_carte, v_client, v_reco_id, v_reco_txt, v_reco_img,
         now() - ((random() * 30)::int || ' days')::interval);
    end loop;
  end if;

  -- ---- 3) Notifications déjà envoyées (historique du dashboard) ----
  for i in 1..array_length(v_titres, 1) loop
    insert into public.notifications_push
      (restaurant_id, titre, message, date_programmee, envoyee_at, nb_envois, created_at)
    values
      (v_resto, v_titres[i], v_msgs[i], null,
       now() - ((i * 4) || ' days')::interval,
       20 + (random() * 25)::int,
       now() - ((i * 4) || ' days')::interval);
  end loop;

  raise notice 'Resto démo rempli : % clients, historique sur % jours, % notifications.',
    array_length(v_ids, 1), v_nb_jours, array_length(v_titres, 1);
end $$;

-- =====================================================================
-- POUR REMETTRE À ZÉRO CE RESTO DÉMO (optionnel) — décommente et exécute
-- en remplaçant le slug. Supprime les clients démo (token « demo-... »,
-- ce qui supprime en cascade leurs cartes_clients / récompenses gagnées /
-- historique lié), plus tout l'historique et toutes les notifications du resto.
-- =====================================================================
-- do $$
-- declare v_resto uuid;
-- begin
--   select id into v_resto from public.restaurants where slug = 'METS-TON-SLUG-ICI';
--   delete from public.notifications_push where restaurant_id = v_resto;
--   delete from public.tampons_historique where restaurant_id = v_resto;
--   delete from public.clients_fidelite
--     where restaurant_id = v_resto and token_cookie like 'demo-%';
-- end $$;
