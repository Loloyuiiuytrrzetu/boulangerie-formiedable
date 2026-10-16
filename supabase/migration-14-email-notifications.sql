-- Passage des notifications PUSH aux notifications par EMAIL.
--
-- On ajoute l'email du client (collecté à l'inscription des NOUVEAUX clients ;
-- les anciens clients identifiés par téléphone restent intacts, email NULL) et
-- un indicateur d'abonnement aux emails (pour le lien « se désinscrire »,
-- obligatoire légalement). Par défaut un client reçoit les emails (true) ; le
-- lien de désinscription le passe à false.
alter table clients_fidelite
  add column if not exists email text;

alter table clients_fidelite
  add column if not exists emails_actif boolean not null default true;

create index if not exists idx_clients_email
  on clients_fidelite (restaurant_id, email);

-- Les NOUVEAUX clients s'inscrivent avec un email (plus de téléphone), donc le
-- numéro devient optionnel. Les clients existants gardent leur numéro intact.
alter table clients_fidelite
  alter column numero_telephone drop not null;
