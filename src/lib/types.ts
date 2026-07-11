export type Restaurant = {
  id: string;
  owner_id: string;
  nom: string;
  slug: string;
  logo_url: string | null;
  fond_url: string | null;
  couleur: string;
  couleur_qr: string;
  timezone: string;
  tampon_par_carte: boolean;
  animation_recompense: "confettis" | "coeurs" | "etoiles" | "feux";
  tampon_icone: string;
  nombre_tampons_requis: number;
  texte_recompense: string;
  actif: boolean;
  created_at: string;
};

export type Carte = {
  id: string;
  restaurant_id: string;
  titre: string;
  tampon_icone: string;
  tampon_image_url: string | null;
  tampon_forme: "carre" | "cercle" | "hexagone" | "etoile";
  nombre_tampons_requis: number;
  texte_bas: string | null;
  date_expiration: string | null;
  actif: boolean;
  created_at: string;
};

export type Recompense = {
  id: string;
  carte_id: string;
  restaurant_id: string;
  texte: string;
  image_url: string | null;
  created_at: string;
};

export type CarteClient = {
  id: string;
  carte_id: string;
  client_id: string;
  tampons_actuels: number;
  tampons_total: number;
  recompenses_reclamees: number;
  date_dernier_tampon: string | null;
  created_at: string;
};

export type ClientFidelite = {
  id: string;
  restaurant_id: string;
  numero_telephone: string;
  identite: string | null;
  tampons_actuels: number;
  tampons_total: number;
  recompenses_reclamees: number;
  date_dernier_tampon: string | null;
  token_cookie: string;
  token_public: string | null;
  notifications_push_actif: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  role: "restaurateur" | "super_admin" | "sous_compte";
  created_at: string;
};

export type SousCompte = {
  id: string;
  user_id: string;
  restaurant_id: string;
  nom: string;
  email: string;
  actif: boolean;
  created_at: string;
};

export type TamponHistorique = {
  id: string;
  restaurant_id: string;
  carte_id: string | null;
  client_id: string | null;
  nombre: number;
  date_attribution: string; // YYYY-MM-DD
  created_at: string;
};

export type Section = {
  id: string;
  restaurant_id: string;
  type: "cartes" | "info" | "personnalisee";
  titre: string;
  texte: string | null;
  lien_url: string | null;
  lien_libelle: string | null;
  ordre: number;
  supprimable: boolean;
  created_at: string;
};

export type RecompenseGagnee = {
  id: string;
  carte_id: string;
  client_id: string;
  recompense_id: string | null;
  texte_recompense: string;
  image_url: string | null;
  date_gagnee: string;
  date_utilisee: string | null;
};
