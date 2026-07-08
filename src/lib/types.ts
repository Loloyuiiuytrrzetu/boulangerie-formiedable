export type Restaurant = {
  id: string;
  owner_id: string;
  nom: string;
  slug: string;
  logo_url: string | null;
  couleur: string;
  tampon_icone: string;
  nombre_tampons_requis: number;
  texte_recompense: string;
  actif: boolean;
  created_at: string;
};

export type ClientFidelite = {
  id: string;
  restaurant_id: string;
  numero_telephone: string;
  tampons_actuels: number;
  tampons_total: number;
  recompenses_reclamees: number;
  date_dernier_tampon: string | null;
  token_cookie: string;
  notifications_push_actif: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  role: "restaurateur" | "super_admin";
  created_at: string;
};
