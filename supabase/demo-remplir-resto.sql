-- =====================================================================
-- WALLETIZ — Remplir un resto DÉMO (clients + tampons + notifications)
--
-- But : donner à un resto existant l'allure d'un commerce qui CARTONNE,
-- pour le montrer en démo aux prospects (beaux graphiques, gros compteur
-- de tampons du jour, base de clients fournie, historique de notifications).
--
-- Mode d'emploi :
--   1. Supabase → SQL Editor → New query.
--   2. Colle tout ce fichier.
--   3. Mets le SLUG de ton resto démo dans « v_slug » ci-dessous
--      (le slug = ce qui apparaît dans /c/xxxx, visible sur ton dashboard).
--   4. Exécute. À lancer UNE SEULE FOIS (relancer ajoute encore des données).
--
-- Cohérence :
--   - beaucoup de clients (base réaliste) ;
--   - une PARTIE des clients a activé les notifications, l'autre non
--     (≈ 70 % activés) → l'icône 🔔/🔕 de « Mes clients » est variée ;
--   - chaque notification est « envoyée à » un nombre cohérent = le nombre
--     d'abonnés (légèrement croissant dans le temps), pas des chiffres au
--     hasard.
--
-- Sécurité : n'insère QUE dans le resto choisi. Clients démo repérables
-- (token « demo-... ») avec de vrais numéros français réalistes (06/07).
-- =====================================================================
do $$
declare
  v_slug        text := 'cafe-d-or';  -- <<< slug de Top Burger (page /c/cafe-d-or)
  v_nb_clients  int  := 320;  -- nombre de clients démo (base réaliste)
  v_nb_jours    int  := 90;   -- profondeur de l'historique (jours)

  v_resto   uuid;
  v_carte   uuid;
  v_requis  int;
  v_client  uuid;
  v_jour    date;
  v_debut   date;
  v_fin     date;
  v_rows    int;
  i         int;
  j         int;
  v_total   int;
  v_actif   boolean;
  v_abonnes int;
  v_env     int;
  v_reco_id  uuid;
  v_reco_txt text;
  v_reco_img text;
  v_ids     uuid[] := '{}';
  v_prenoms text[] := array[
    'Léa','Hugo','Emma','Gabriel','Jade','Louis','Alice','Raphaël','Chloé','Adam',
    'Manon','Nathan','Camille','Lucas','Sarah','Enzo','Inès','Tom','Zoé','Noah',
    'Lina','Ethan','Anna','Théo','Maya','Nolan','Rose','Sacha','Iris','Timéo',
    'Ambre','Aaron','Alba','Isaac','Lou','Marius','Nina','Eden','Romy','Kylian',
    'Elsa','Milo','Lise','Axel','Jeanne','Yanis','Clara','Marc','Sofia','Karim'
  ];
  v_noms text[] := array[
    'Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau',
    'Simon','Laurent','Michel','Garcia','David','Bertrand','Roux','Fontaine','Vincent','Fournier',
    'Girard','Bonnet','Lambert','Rousseau','Blanc','Guerin','Muller','Henry','Roussel','Nicolas',
    'Perrin','Morel','Gauthier','Marchand','Duval','Denis','Joly','Roy','Meyer','Barbier',
    'Faure','Renaud','Colin','Brun','Lopez','Da Silva','Benali','Nguyen','Cohen','Traoré'
  ];
  v_titres text[] := array[
    'Bienvenue chez nous 👋','Offre du week-end 🎉','Nouveauté à la carte 🍰',
    'Votre menu préféré vous attend 🍔','Happy hour ce soir 🍹',
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

  -- Fenêtre des données : les 5 mois COMPLETS précédant le mois en cours.
  -- Le mois en cours (ex. août) reste à 0 tampon, comme un mois qui démarre.
  v_fin   := date_trunc('month', current_date)::date - 1;   -- dernier jour du mois précédent
  v_debut := (date_trunc('month', current_date) - interval '5 months')::date; -- 1er jour, 5 mois avant

  -- ---- 1) Clients démo (+ progression). ~70 % ont activé les notifs. ----
  for i in 1..v_nb_clients loop
    v_client := null;
    v_total  := 4 + (random() * 90)::int;
    v_actif  := random() < 0.7;   -- 70 % activent les notifications, 30 % non
    insert into public.clients_fidelite
      (restaurant_id, numero_telephone, identite, tampons_actuels, tampons_total,
       date_dernier_tampon, token_cookie, notifications_push_actif, created_at)
    values
      (v_resto,
       -- Vrai numéro français réaliste (06/07), unique par client.
       '0' || (case when i % 2 = 0 then '6' else '7' end)
            || lpad(((i * 73421 + 10007) % 100000000)::text, 8, '0'),
       v_prenoms[1 + (random() * (array_length(v_prenoms, 1) - 1))::int]
         || ' ' ||
       v_noms[1 + (random() * (array_length(v_noms, 1) - 1))::int],
       (random() * (v_requis - 1))::int,
       v_total,
       v_fin - (random() * 20)::int,
       'demo-' || gen_random_uuid()::text,
       v_actif,
       (v_fin - (random() * 150)::int)::timestamptz)
    on conflict (restaurant_id, numero_telephone) do nothing
    returning id into v_client;

    if v_client is not null then
      v_ids := array_append(v_ids, v_client);
      insert into public.cartes_clients
        (carte_id, client_id, tampons_actuels, tampons_total,
         recompenses_reclamees, date_dernier_tampon)
      values
        (v_carte, v_client, (random() * (v_requis - 1))::int, v_total,
         (random() * 5)::int, v_fin - (random() * 20)::int)
      on conflict (carte_id, client_id) do nothing;
    end if;
  end loop;

  -- Si les clients existaient déjà (2e exécution), on récupère la liste
  if array_length(v_ids, 1) is null then
    select array_agg(id) into v_ids
    from public.clients_fidelite where restaurant_id = v_resto;
  end if;

  -- Nombre d'abonnés (clients ayant activé les notifs) — sert à donner un
  -- nombre d'envois COHÉRENT aux notifications ci-dessous.
  select count(*) into v_abonnes
  from public.clients_fidelite
  where restaurant_id = v_resto and notifications_push_actif = true;

  -- ---- 2) Historique des tampons (tendance croissante + week-ends forts) ----
  -- Volume modéré (~700 tampons, sous le plafond de lecture de Supabase),
  -- réparti sur chaque jour des 5 mois complets (mars → juillet). Le mois en
  -- cours (août) ne reçoit AUCUN tampon → il reste à 0, comme un mois qui
  -- vient de commencer.
  for v_jour in
    select gs::date
    from generate_series(v_debut::timestamp, v_fin::timestamp, interval '1 day') gs
  loop
    v_rows := 3
            + (case when extract(dow from v_jour) in (0, 6) then 2 else 0 end)  -- bonus week-end
            + (random() * 4)::int;
    for i in 1..v_rows loop
      v_client := v_ids[1 + (random() * (array_length(v_ids, 1) - 1))::int];
      insert into public.tampons_historique
        (restaurant_id, carte_id, client_id, nombre, date_attribution, created_at)
      values
        (v_resto, v_carte, v_client, 1, v_jour, v_jour + (random() * interval '12 hours'));
    end loop;
  end loop;

  -- ---- 2 bis) Récompenses gagnées (en attente) pour du réalisme côté client ----
  select id, texte, image_url into v_reco_id, v_reco_txt, v_reco_img
  from public.recompenses where carte_id = v_carte order by created_at asc limit 1;
  if v_reco_id is not null and array_length(v_ids, 1) is not null then
    for i in 1..25 loop
      v_client := v_ids[1 + (random() * (array_length(v_ids, 1) - 1))::int];
      insert into public.recompenses_gagnees
        (carte_id, client_id, recompense_id, texte_recompense, image_url, date_gagnee)
      values
        (v_carte, v_client, v_reco_id, v_reco_txt, v_reco_img,
         (v_fin - (random() * 40)::int)::timestamptz);
    end loop;
  end if;

  -- ---- 3) Notifications déjà envoyées (nombre d'envois COHÉRENT) ----
  -- Chaque notification part vers ≈ le nombre d'abonnés, légèrement croissant
  -- dans le temps (i=1 = la plus récente = base d'abonnés la plus large).
  for i in 1..array_length(v_titres, 1) loop
    v_env := greatest(5, v_abonnes - (i - 1) * 5);
    insert into public.notifications_push
      (restaurant_id, titre, message, date_programmee, envoyee_at, nb_envois, created_at)
    values
      (v_resto, v_titres[i], v_msgs[i], null,
       (v_fin - (i * 3))::timestamptz,
       v_env,
       (v_fin - (i * 3))::timestamptz);
  end loop;

  raise notice 'Resto démo rempli : % clients (dont % abonnés), % notifications.',
    array_length(v_ids, 1), v_abonnes, array_length(v_titres, 1);
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
--   select id into v_resto from public.restaurants where slug = 'cafe-d-or';
--   delete from public.notifications_push where restaurant_id = v_resto;
--   delete from public.tampons_historique where restaurant_id = v_resto;
--   delete from public.clients_fidelite
--     where restaurant_id = v_resto and token_cookie like 'demo-%';
-- end $$;
