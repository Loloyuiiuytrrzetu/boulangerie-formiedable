// ---------------------------------------------------------------------------
// Traductions pour le DASHBOARD RESTAURATEUR.
//
// Séparé de l'i18n client pour ne pas mélanger les deux vocabulaires
// (le client parle de "tampons", le dashboard parle aussi de "sections",
// "notifications programmées", "abonnement", "sous-compte" etc.).
//
// Toutes les langues supportées : fr, en, es, de, zh, ar, ru.
// ---------------------------------------------------------------------------

import type { Langue } from "./i18n";

type CleDash =
  // Sidebar / navigation
  | "graphiques"
  | "mon_commerce"
  | "cartes_de_fidelite"
  | "sections_de_ma_page"
  | "sous_compte"
  | "notifications_push"
  | "mon_abonnement"
  | "qr_code"
  | "connecte"
  | "se_deconnecter"
  | "langue_dashboard"
  | "changer_langue"
  // Stats en haut
  | "clients_fidelises"
  | "tampons_distribues_aujourdhui"
  | "votre_page_client"
  | "attribuer_tampons_client"
  // Mon commerce (ConfigForm)
  | "identite_visuelle"
  | "nom_du_commerce"
  | "logo"
  | "image_de_fond"
  | "couleur_principale"
  | "couleur_qr"
  | "un_tampon_par_carte"
  | "un_tampon_par_carte_desc"
  | "tampon_manuel_uniquement"
  | "tampon_manuel_uniquement_desc"
  | "animation_recompense"
  | "animation_recompense_desc"
  | "couleur_animation"
  | "voir_apercu"
  | "enregistrer"
  | "enregistre"
  | "annuler"
  | "modifier"
  | "supprimer"
  | "creer"
  // Cartes
  | "aucune_carte_creee"
  | "nouvelle_carte"
  | "titre_carte"
  | "nombre_tampons_requis"
  | "date_expiration"
  | "texte_bas_carte"
  | "forme_tampon"
  | "icone_tampon"
  | "image_tampon"
  | "recompenses"
  | "ajouter_recompense"
  | "texte_recompense"
  | "image_recompense"
  | "recompense"
  | "carre"
  | "cercle"
  | "hexagone"
  | "etoile"
  | "confirmer_suppression_carte"
  | "confirmer_suppression_recompense"
  | "expiree"
  | "expire_le"
  | "valable_jusqu_au"
  | "aucun"
  | "aucune_animation"
  | "etoiles_scintillantes"
  | "ondes_lumineuses"
  | "rayons_eclatants"
  | "vague_coloree"
  // Sections
  | "sections_desc"
  | "nouvelle_section"
  | "type_section"
  | "info_qr"
  | "personnalisee"
  | "titre_section"
  | "texte_section"
  | "lien_url"
  | "lien_libelle"
  | "non_supprimable"
  // Sous-compte
  | "sous_compte_desc"
  | "email_employe"
  | "email_employe_desc"
  | "mot_de_passe_initial"
  | "creer_sous_compte"
  | "supprimer_sous_compte"
  | "activer_sous_compte"
  | "desactiver_sous_compte"
  | "aucun_sous_compte"
  // Notifications push
  | "notifications_push_desc"
  | "envoyer_message"
  | "envoyer_maintenant"
  | "programmer_envoi"
  | "date_envoi"
  | "titre_notif"
  | "corps_notif"
  | "envoye_le"
  | "programme_pour"
  | "aucune_notification_envoyee"
  | "voir_anciennes_notifications"
  | "cacher_anciennes_notifications"
  | "aucun_abonne"
  | "nb_abonnes"
  | "annuler_envoi_programme"
  // Abonnement
  | "abonnement_desc"
  | "statut_actuel"
  | "essai_gratuit"
  | "plan_pro"
  | "plan_pro_annuel"
  | "annule"
  | "expire"
  | "prochaine_facture"
  | "fin_essai"
  | "annuler_abonnement"
  | "reactiver_abonnement"
  | "confirmer_annulation_abonnement"
  | "annulation_abonnement_desc"
  // QR code
  | "qr_code_titre"
  | "qr_code_desc"
  | "telecharger_qr"
  // Graphiques
  | "tampons_cette_semaine"
  | "tampons_par_mois"
  | "sept_derniers_jours"
  | "historique_conserve"
  | "total"
  // Commerce désactivé
  | "commerce_desactive"
  // Impersonation
  | "vous_voyez_commerce"
  | "revenir_super_admin"
  // Onglets internes ConfigForm
  | "personnalisation"
  | "regles_tampon"
  | "animation"
  | "choisir_fichier"
  | "aucun_fichier"
  | "images_max_taille"
  | "couleur_personnalisee"
  | "choisissez_parmi_couleurs"
  | "hex_libelle"
  | "aper_carte_expiree"
  | "date_valide_jusqu"
  | "nb_recompenses"
  | "vous_pouvez_seulement_changer_titre";

type Traductions = Record<CleDash, string>;

const FR: Traductions = {
  graphiques: "Graphiques",
  mon_commerce: "Mon commerce",
  cartes_de_fidelite: "Cartes de fidélité",
  sections_de_ma_page: "Sections de ma page",
  sous_compte: "Sous-compte",
  notifications_push: "Notifications push",
  mon_abonnement: "Mon abonnement",
  qr_code: "QR code",
  connecte: "Connecté",
  se_deconnecter: "Se déconnecter",
  langue_dashboard: "Langue du dashboard",
  changer_langue: "Changer la langue",
  clients_fidelises: "Clients fidélisés",
  tampons_distribues_aujourdhui: "Tampons distribués aujourd'hui",
  votre_page_client: "Votre page client",
  attribuer_tampons_client: "🎯 Attribuer des tampons à un client",
  identite_visuelle: "L'identité visuelle de votre page client.",
  nom_du_commerce: "Nom du commerce",
  logo: "Logo",
  image_de_fond: "Image de fond",
  couleur_principale: "Couleur principale",
  couleur_qr: "Couleur du QR code",
  un_tampon_par_carte: "1 tampon par carte, chaque jour",
  un_tampon_par_carte_desc:
    "Si activé : le client peut prendre 1 tampon par carte par jour. Si désactivé : 1 tampon par jour toutes cartes confondues.",
  tampon_manuel_uniquement: "Système manuel (tampon donné uniquement par vous)",
  tampon_manuel_uniquement_desc:
    "Seul moi (ou mon sous-compte) peux attribuer les tampons. Le bouton « Prendre mon tampon » disparaît côté client.",
  animation_recompense: "Animation à la récompense",
  animation_recompense_desc:
    "L'effet qui s'affiche quand le client choisit sa récompense.",
  couleur_animation: "Couleur de l'animation",
  voir_apercu: "Voir l'aperçu",
  enregistrer: "Enregistrer",
  enregistre: "Enregistré ✓",
  annuler: "Annuler",
  modifier: "Modifier",
  supprimer: "Supprimer",
  creer: "Créer",
  aucune_carte_creee: "Aucune carte créée pour l'instant.",
  nouvelle_carte: "+ Nouvelle carte",
  titre_carte: "Titre de la carte",
  nombre_tampons_requis: "Nombre de tampons requis",
  date_expiration: "Date d'expiration (facultatif)",
  texte_bas_carte: "Texte en bas de carte (facultatif)",
  forme_tampon: "Forme du tampon",
  icone_tampon: "Icône du tampon",
  image_tampon: "Image du tampon (optionnelle, remplace l'icône)",
  recompenses: "Récompenses",
  ajouter_recompense: "+ Ajouter une récompense",
  texte_recompense: "Description de la récompense",
  image_recompense: "Image (facultative)",
  recompense: "Récompense",
  carre: "Carré",
  cercle: "Cercle",
  hexagone: "Hexagone",
  etoile: "Étoile",
  confirmer_suppression_carte: "Supprimer cette carte ? Tous les tampons et récompenses associés seront perdus.",
  confirmer_suppression_recompense: "Supprimer cette récompense ?",
  expiree: "⚠️ expirée",
  expire_le: "expire le",
  valable_jusqu_au: "Valable jusqu'au",
  aucun: "Aucun",
  aucune_animation: "Aucune animation",
  etoiles_scintillantes: "Étoiles scintillantes",
  ondes_lumineuses: "Ondes lumineuses",
  rayons_eclatants: "Rayons éclatants",
  vague_coloree: "Vague colorée",
  sections_desc: "Rajouter des onglets à la page d'accueil de vos clients pour faire passer une information ou annoncer un événement.",
  nouvelle_section: "+ Nouvelle section",
  type_section: "Type de section",
  info_qr: "Info + QR code",
  personnalisee: "Personnalisée",
  titre_section: "Titre",
  texte_section: "Texte",
  lien_url: "URL du lien (facultatif)",
  lien_libelle: "Libellé du bouton (facultatif)",
  non_supprimable: "non supprimable",
  sous_compte_desc:
    "Un employé peut avoir un accès limité qui sert uniquement à attribuer des tampons aux clients — pas à modifier votre configuration.",
  email_employe: "Email de l'employé",
  email_employe_desc: "Il servira à se connecter et à récupérer son mot de passe.",
  mot_de_passe_initial: "Mot de passe initial",
  creer_sous_compte: "Créer le sous-compte",
  supprimer_sous_compte: "Supprimer le sous-compte",
  activer_sous_compte: "Activer",
  desactiver_sous_compte: "Désactiver",
  aucun_sous_compte: "Aucun sous-compte pour l'instant.",
  notifications_push_desc:
    "Envoyez un message à tous vos clients abonnés — il apparaîtra comme une notification sur leur téléphone avec le logo de votre commerce.",
  envoyer_message: "Envoyer un message",
  envoyer_maintenant: "Envoyer maintenant",
  programmer_envoi: "Programmer l'envoi",
  date_envoi: "Date et heure d'envoi",
  titre_notif: "Titre",
  corps_notif: "Message",
  envoye_le: "envoyé le",
  programme_pour: "programmé pour le",
  aucune_notification_envoyee: "Aucune notification envoyée pour l'instant.",
  voir_anciennes_notifications: "Voir les anciennes notifications",
  cacher_anciennes_notifications: "Cacher les anciennes notifications",
  aucun_abonne: "Aucun client abonné aux notifications pour l'instant.",
  nb_abonnes: "abonnés",
  annuler_envoi_programme: "Annuler l'envoi",
  abonnement_desc: "Gérez votre abonnement Walletiz.",
  statut_actuel: "Statut actuel",
  essai_gratuit: "Essai gratuit",
  plan_pro: "Plan Pro",
  plan_pro_annuel: "Plan Pro annuel",
  annule: "Annulé",
  expire: "Expiré",
  prochaine_facture: "Prochaine facture le",
  fin_essai: "Fin de l'essai le",
  annuler_abonnement: "Annuler mon abonnement",
  reactiver_abonnement: "Réactiver mon abonnement",
  confirmer_annulation_abonnement: "Annuler l'abonnement ?",
  annulation_abonnement_desc:
    "Votre commerce reste actif jusqu'à la fin de la période payée. Aucun remboursement n'est effectué pour la période en cours.",
  qr_code_titre: "Votre QR code",
  qr_code_desc:
    "Imprimez-le et affichez-le en caisse : vos clients le scannent pour ouvrir leurs cartes de fidélité.",
  telecharger_qr: "Télécharger le QR code",
  tampons_cette_semaine: "Tampons cette semaine",
  tampons_par_mois: "Tampons par mois",
  sept_derniers_jours: "Les 7 derniers jours (aujourd'hui à droite).",
  historique_conserve: "Historique conservé — vous pouvez revenir sur les années précédentes.",
  total: "Total",
  commerce_desactive:
    "Votre commerce est actuellement désactivé : la page client n'est plus accessible. Contactez l'équipe Walletiz.",
  vous_voyez_commerce: "Vous voyez le commerce",
  revenir_super_admin: "Revenir au super admin",
  personnalisation: "Personnalisation",
  regles_tampon: "Règles du tampon",
  animation: "Animation",
  choisir_fichier: "Choisir un fichier",
  aucun_fichier: "Aucun fichier choisi",
  images_max_taille:
    "Images, 4 Mo maximum chacune. Si une image de fond est chargée, elle remplace la couleur principale.",
  couleur_personnalisee: "Personnalisée",
  choisissez_parmi_couleurs: "Choisissez parmi 24 couleurs :",
  hex_libelle: "Code hex",
  aper_carte_expiree: "Carte expirée",
  date_valide_jusqu: "Valable jusqu'au",
  nb_recompenses: "récompenses",
  vous_pouvez_seulement_changer_titre: "Vous pouvez seulement en changer le titre.",
};

const EN: Traductions = {
  graphiques: "Graphs",
  mon_commerce: "My business",
  cartes_de_fidelite: "Loyalty cards",
  sections_de_ma_page: "Page sections",
  sous_compte: "Sub-account",
  notifications_push: "Push notifications",
  mon_abonnement: "My subscription",
  qr_code: "QR code",
  connecte: "Signed in",
  se_deconnecter: "Sign out",
  langue_dashboard: "Dashboard language",
  changer_langue: "Change language",
  clients_fidelises: "Loyal customers",
  tampons_distribues_aujourdhui: "Stamps given today",
  votre_page_client: "Your customer page",
  attribuer_tampons_client: "🎯 Give stamps to a customer",
  identite_visuelle: "The visual identity of your customer page.",
  nom_du_commerce: "Business name",
  logo: "Logo",
  image_de_fond: "Background image",
  couleur_principale: "Main color",
  couleur_qr: "QR code color",
  un_tampon_par_carte: "1 stamp per card, per day",
  un_tampon_par_carte_desc:
    "If on: customer can get 1 stamp per card per day. If off: 1 stamp per day across all cards.",
  tampon_manuel_uniquement: "Manual mode (only you give stamps)",
  tampon_manuel_uniquement_desc:
    "Only you (or your sub-account) can give stamps. The 'Get my stamp' button disappears on the customer side.",
  animation_recompense: "Reward animation",
  animation_recompense_desc:
    "The effect that plays when the customer picks their reward.",
  couleur_animation: "Animation color",
  voir_apercu: "Preview",
  enregistrer: "Save",
  enregistre: "Saved ✓",
  annuler: "Cancel",
  modifier: "Edit",
  supprimer: "Delete",
  creer: "Create",
  aucune_carte_creee: "No card created yet.",
  nouvelle_carte: "+ New card",
  titre_carte: "Card title",
  nombre_tampons_requis: "Stamps required",
  date_expiration: "Expiry date (optional)",
  texte_bas_carte: "Text at bottom of card (optional)",
  forme_tampon: "Stamp shape",
  icone_tampon: "Stamp icon",
  image_tampon: "Stamp image (optional, replaces icon)",
  recompenses: "Rewards",
  ajouter_recompense: "+ Add reward",
  texte_recompense: "Reward description",
  image_recompense: "Image (optional)",
  recompense: "Reward",
  carre: "Square",
  cercle: "Circle",
  hexagone: "Hexagon",
  etoile: "Star",
  confirmer_suppression_carte: "Delete this card? All associated stamps and rewards will be lost.",
  confirmer_suppression_recompense: "Delete this reward?",
  expiree: "⚠️ expired",
  expire_le: "expires on",
  valable_jusqu_au: "Valid until",
  aucun: "None",
  aucune_animation: "No animation",
  etoiles_scintillantes: "Sparkling stars",
  ondes_lumineuses: "Light waves",
  rayons_eclatants: "Radiant rays",
  vague_coloree: "Colored wave",
  sections_desc: "Add tabs to your customers' home page to share information or announce an event.",
  nouvelle_section: "+ New section",
  type_section: "Section type",
  info_qr: "Info + QR code",
  personnalisee: "Custom",
  titre_section: "Title",
  texte_section: "Text",
  lien_url: "Link URL (optional)",
  lien_libelle: "Button label (optional)",
  non_supprimable: "cannot be deleted",
  sous_compte_desc:
    "An employee can have limited access to give stamps to customers only — not to change your setup.",
  email_employe: "Employee email",
  email_employe_desc: "Used to sign in and reset password.",
  mot_de_passe_initial: "Initial password",
  creer_sous_compte: "Create sub-account",
  supprimer_sous_compte: "Delete sub-account",
  activer_sous_compte: "Enable",
  desactiver_sous_compte: "Disable",
  aucun_sous_compte: "No sub-account yet.",
  notifications_push_desc:
    "Send a message to all subscribed customers — it will appear as a notification on their phone with your logo.",
  envoyer_message: "Send a message",
  envoyer_maintenant: "Send now",
  programmer_envoi: "Schedule",
  date_envoi: "Send date and time",
  titre_notif: "Title",
  corps_notif: "Message",
  envoye_le: "sent on",
  programme_pour: "scheduled for",
  aucune_notification_envoyee: "No notification sent yet.",
  voir_anciennes_notifications: "See older notifications",
  cacher_anciennes_notifications: "Hide older notifications",
  aucun_abonne: "No customer subscribed to notifications yet.",
  nb_abonnes: "subscribers",
  annuler_envoi_programme: "Cancel send",
  abonnement_desc: "Manage your Walletiz subscription.",
  statut_actuel: "Current status",
  essai_gratuit: "Free trial",
  plan_pro: "Pro plan",
  plan_pro_annuel: "Annual Pro plan",
  annule: "Cancelled",
  expire: "Expired",
  prochaine_facture: "Next invoice on",
  fin_essai: "Trial ends on",
  annuler_abonnement: "Cancel my subscription",
  reactiver_abonnement: "Reactivate my subscription",
  confirmer_annulation_abonnement: "Cancel subscription?",
  annulation_abonnement_desc:
    "Your business stays active until the end of the paid period. No refund for the current period.",
  qr_code_titre: "Your QR code",
  qr_code_desc:
    "Print it and display it at the counter: your customers scan it to open their loyalty cards.",
  telecharger_qr: "Download QR code",
  tampons_cette_semaine: "Stamps this week",
  tampons_par_mois: "Stamps per month",
  sept_derniers_jours: "Last 7 days (today on the right).",
  historique_conserve: "History kept — you can go back to previous years.",
  total: "Total",
  commerce_desactive:
    "Your business is currently disabled: the customer page is no longer accessible. Contact the Walletiz team.",
  vous_voyez_commerce: "You are viewing the business",
  revenir_super_admin: "Back to super admin",
  personnalisation: "Personalization",
  regles_tampon: "Stamp rules",
  animation: "Animation",
  choisir_fichier: "Choose file",
  aucun_fichier: "No file chosen",
  images_max_taille:
    "Images, 4 MB max each. If a background image is uploaded, it replaces the main color.",
  couleur_personnalisee: "Custom",
  choisissez_parmi_couleurs: "Pick from 24 colors:",
  hex_libelle: "Hex code",
  aper_carte_expiree: "Card expired",
  date_valide_jusqu: "Valid until",
  nb_recompenses: "rewards",
  vous_pouvez_seulement_changer_titre: "You can only change its title.",
};

const ES: Traductions = {
  graphiques: "Gráficos",
  mon_commerce: "Mi comercio",
  cartes_de_fidelite: "Tarjetas de fidelidad",
  sections_de_ma_page: "Secciones de mi página",
  sous_compte: "Subcuenta",
  notifications_push: "Notificaciones push",
  mon_abonnement: "Mi suscripción",
  qr_code: "Código QR",
  connecte: "Conectado",
  se_deconnecter: "Cerrar sesión",
  langue_dashboard: "Idioma del panel",
  changer_langue: "Cambiar idioma",
  clients_fidelises: "Clientes fidelizados",
  tampons_distribues_aujourdhui: "Sellos entregados hoy",
  votre_page_client: "Tu página de cliente",
  attribuer_tampons_client: "🎯 Dar sellos a un cliente",
  identite_visuelle: "La identidad visual de tu página de cliente.",
  nom_du_commerce: "Nombre del comercio",
  logo: "Logo",
  image_de_fond: "Imagen de fondo",
  couleur_principale: "Color principal",
  couleur_qr: "Color del QR",
  un_tampon_par_carte: "1 sello por tarjeta, cada día",
  un_tampon_par_carte_desc:
    "Si activado: el cliente puede tomar 1 sello por tarjeta al día. Si desactivado: 1 sello al día para todas las tarjetas.",
  tampon_manuel_uniquement: "Modo manual (solo tú das los sellos)",
  tampon_manuel_uniquement_desc:
    "Solo tú (o tu subcuenta) puedes dar sellos. El botón «Obtener mi sello» desaparece del lado del cliente.",
  animation_recompense: "Animación de la recompensa",
  animation_recompense_desc:
    "El efecto que se muestra cuando el cliente elige su recompensa.",
  couleur_animation: "Color de la animación",
  voir_apercu: "Ver vista previa",
  enregistrer: "Guardar",
  enregistre: "Guardado ✓",
  annuler: "Cancelar",
  modifier: "Editar",
  supprimer: "Eliminar",
  creer: "Crear",
  aucune_carte_creee: "Aún no hay tarjeta creada.",
  nouvelle_carte: "+ Nueva tarjeta",
  titre_carte: "Título de la tarjeta",
  nombre_tampons_requis: "Sellos requeridos",
  date_expiration: "Fecha de expiración (opcional)",
  texte_bas_carte: "Texto al final de la tarjeta (opcional)",
  forme_tampon: "Forma del sello",
  icone_tampon: "Icono del sello",
  image_tampon: "Imagen del sello (opcional, reemplaza el icono)",
  recompenses: "Recompensas",
  ajouter_recompense: "+ Añadir recompensa",
  texte_recompense: "Descripción de la recompensa",
  image_recompense: "Imagen (opcional)",
  recompense: "Recompensa",
  carre: "Cuadrado",
  cercle: "Círculo",
  hexagone: "Hexágono",
  etoile: "Estrella",
  confirmer_suppression_carte: "¿Eliminar esta tarjeta? Todos los sellos y recompensas asociados se perderán.",
  confirmer_suppression_recompense: "¿Eliminar esta recompensa?",
  expiree: "⚠️ expirada",
  expire_le: "expira el",
  valable_jusqu_au: "Válida hasta el",
  aucun: "Ninguno",
  aucune_animation: "Sin animación",
  etoiles_scintillantes: "Estrellas brillantes",
  ondes_lumineuses: "Ondas luminosas",
  rayons_eclatants: "Rayos brillantes",
  vague_coloree: "Ola de color",
  sections_desc: "Añade pestañas a la página de tus clientes para compartir información o anunciar un evento.",
  nouvelle_section: "+ Nueva sección",
  type_section: "Tipo de sección",
  info_qr: "Info + código QR",
  personnalisee: "Personalizada",
  titre_section: "Título",
  texte_section: "Texto",
  lien_url: "URL del enlace (opcional)",
  lien_libelle: "Texto del botón (opcional)",
  non_supprimable: "no se puede eliminar",
  sous_compte_desc:
    "Un empleado puede tener acceso limitado solo para dar sellos a los clientes, no para modificar tu configuración.",
  email_employe: "Email del empleado",
  email_employe_desc: "Se usará para iniciar sesión y recuperar la contraseña.",
  mot_de_passe_initial: "Contraseña inicial",
  creer_sous_compte: "Crear subcuenta",
  supprimer_sous_compte: "Eliminar subcuenta",
  activer_sous_compte: "Activar",
  desactiver_sous_compte: "Desactivar",
  aucun_sous_compte: "Aún no hay subcuenta.",
  notifications_push_desc:
    "Envía un mensaje a todos tus clientes suscritos — aparecerá como una notificación en su teléfono con tu logo.",
  envoyer_message: "Enviar un mensaje",
  envoyer_maintenant: "Enviar ahora",
  programmer_envoi: "Programar",
  date_envoi: "Fecha y hora de envío",
  titre_notif: "Título",
  corps_notif: "Mensaje",
  envoye_le: "enviado el",
  programme_pour: "programado para el",
  aucune_notification_envoyee: "Aún no hay notificaciones enviadas.",
  voir_anciennes_notifications: "Ver notificaciones anteriores",
  cacher_anciennes_notifications: "Ocultar notificaciones anteriores",
  aucun_abonne: "Aún no hay clientes suscritos a las notificaciones.",
  nb_abonnes: "suscritos",
  annuler_envoi_programme: "Cancelar envío",
  abonnement_desc: "Gestiona tu suscripción Walletiz.",
  statut_actuel: "Estado actual",
  essai_gratuit: "Prueba gratuita",
  plan_pro: "Plan Pro",
  plan_pro_annuel: "Plan Pro anual",
  annule: "Cancelado",
  expire: "Expirado",
  prochaine_facture: "Próxima factura el",
  fin_essai: "Fin de la prueba el",
  annuler_abonnement: "Cancelar mi suscripción",
  reactiver_abonnement: "Reactivar mi suscripción",
  confirmer_annulation_abonnement: "¿Cancelar suscripción?",
  annulation_abonnement_desc:
    "Tu comercio sigue activo hasta el final del período pagado. No se hace reembolso del período actual.",
  qr_code_titre: "Tu código QR",
  qr_code_desc:
    "Imprímelo y muéstralo en caja: tus clientes lo escanean para abrir sus tarjetas de fidelidad.",
  telecharger_qr: "Descargar el código QR",
  tampons_cette_semaine: "Sellos esta semana",
  tampons_par_mois: "Sellos por mes",
  sept_derniers_jours: "Últimos 7 días (hoy a la derecha).",
  historique_conserve: "Historial conservado — puedes volver a años anteriores.",
  total: "Total",
  commerce_desactive:
    "Tu comercio está desactivado: la página de cliente ya no es accesible. Contacta al equipo Walletiz.",
  vous_voyez_commerce: "Estás viendo el comercio",
  revenir_super_admin: "Volver al super admin",
  personnalisation: "Personalización",
  regles_tampon: "Reglas del sello",
  animation: "Animación",
  choisir_fichier: "Elegir archivo",
  aucun_fichier: "Ningún archivo",
  images_max_taille:
    "Imágenes, 4 MB máximo cada una. Si se sube una imagen de fondo, reemplaza el color principal.",
  couleur_personnalisee: "Personalizado",
  choisissez_parmi_couleurs: "Elige entre 24 colores:",
  hex_libelle: "Código hex",
  aper_carte_expiree: "Tarjeta expirada",
  date_valide_jusqu: "Válida hasta",
  nb_recompenses: "recompensas",
  vous_pouvez_seulement_changer_titre: "Solo puedes cambiar el título.",
};

const DE: Traductions = {
  graphiques: "Grafiken",
  mon_commerce: "Mein Geschäft",
  cartes_de_fidelite: "Treuekarten",
  sections_de_ma_page: "Seitenbereiche",
  sous_compte: "Unterkonto",
  notifications_push: "Push-Benachrichtigungen",
  mon_abonnement: "Mein Abonnement",
  qr_code: "QR-Code",
  connecte: "Angemeldet",
  se_deconnecter: "Abmelden",
  langue_dashboard: "Dashboard-Sprache",
  changer_langue: "Sprache ändern",
  clients_fidelises: "Treue Kunden",
  tampons_distribues_aujourdhui: "Heute vergebene Stempel",
  votre_page_client: "Ihre Kundenseite",
  attribuer_tampons_client: "🎯 Stempel an einen Kunden geben",
  identite_visuelle: "Das visuelle Erscheinungsbild Ihrer Kundenseite.",
  nom_du_commerce: "Name des Geschäfts",
  logo: "Logo",
  image_de_fond: "Hintergrundbild",
  couleur_principale: "Hauptfarbe",
  couleur_qr: "QR-Code-Farbe",
  un_tampon_par_carte: "1 Stempel pro Karte, pro Tag",
  un_tampon_par_carte_desc:
    "Aktiviert: 1 Stempel pro Karte pro Tag. Deaktiviert: 1 Stempel pro Tag für alle Karten.",
  tampon_manuel_uniquement: "Manuell (nur Sie vergeben Stempel)",
  tampon_manuel_uniquement_desc:
    "Nur Sie (oder Ihr Unterkonto) können Stempel vergeben. Die Schaltfläche « Meinen Stempel holen » verschwindet auf der Kundenseite.",
  animation_recompense: "Belohnungs-Animation",
  animation_recompense_desc:
    "Der Effekt, der angezeigt wird, wenn der Kunde seine Belohnung wählt.",
  couleur_animation: "Farbe der Animation",
  voir_apercu: "Vorschau anzeigen",
  enregistrer: "Speichern",
  enregistre: "Gespeichert ✓",
  annuler: "Abbrechen",
  modifier: "Bearbeiten",
  supprimer: "Löschen",
  creer: "Erstellen",
  aucune_carte_creee: "Noch keine Karte erstellt.",
  nouvelle_carte: "+ Neue Karte",
  titre_carte: "Kartenname",
  nombre_tampons_requis: "Benötigte Stempel",
  date_expiration: "Ablaufdatum (optional)",
  texte_bas_carte: "Text am unteren Rand (optional)",
  forme_tampon: "Stempelform",
  icone_tampon: "Stempelsymbol",
  image_tampon: "Stempelbild (optional, ersetzt Symbol)",
  recompenses: "Belohnungen",
  ajouter_recompense: "+ Belohnung hinzufügen",
  texte_recompense: "Beschreibung der Belohnung",
  image_recompense: "Bild (optional)",
  recompense: "Belohnung",
  carre: "Quadrat",
  cercle: "Kreis",
  hexagone: "Sechseck",
  etoile: "Stern",
  confirmer_suppression_carte: "Diese Karte löschen? Alle zugehörigen Stempel und Belohnungen gehen verloren.",
  confirmer_suppression_recompense: "Diese Belohnung löschen?",
  expiree: "⚠️ abgelaufen",
  expire_le: "läuft ab am",
  valable_jusqu_au: "Gültig bis",
  aucun: "Keine",
  aucune_animation: "Keine Animation",
  etoiles_scintillantes: "Funkelnde Sterne",
  ondes_lumineuses: "Lichtwellen",
  rayons_eclatants: "Strahlende Strahlen",
  vague_coloree: "Farbige Welle",
  sections_desc: "Fügen Sie Reiter zur Startseite Ihrer Kunden hinzu, um Informationen mitzuteilen oder ein Event anzukündigen.",
  nouvelle_section: "+ Neuer Bereich",
  type_section: "Bereichstyp",
  info_qr: "Info + QR-Code",
  personnalisee: "Individuell",
  titre_section: "Titel",
  texte_section: "Text",
  lien_url: "Link-URL (optional)",
  lien_libelle: "Button-Beschriftung (optional)",
  non_supprimable: "nicht löschbar",
  sous_compte_desc:
    "Ein Mitarbeiter kann eingeschränkten Zugang haben, nur um Kunden Stempel zu geben — nicht um Ihre Konfiguration zu ändern.",
  email_employe: "E-Mail des Mitarbeiters",
  email_employe_desc: "Wird zum Anmelden und Zurücksetzen des Passworts verwendet.",
  mot_de_passe_initial: "Anfangspasswort",
  creer_sous_compte: "Unterkonto erstellen",
  supprimer_sous_compte: "Unterkonto löschen",
  activer_sous_compte: "Aktivieren",
  desactiver_sous_compte: "Deaktivieren",
  aucun_sous_compte: "Noch kein Unterkonto.",
  notifications_push_desc:
    "Senden Sie eine Nachricht an alle abonnierten Kunden — sie erscheint als Benachrichtigung auf ihrem Telefon mit Ihrem Logo.",
  envoyer_message: "Nachricht senden",
  envoyer_maintenant: "Jetzt senden",
  programmer_envoi: "Planen",
  date_envoi: "Sendedatum und Uhrzeit",
  titre_notif: "Titel",
  corps_notif: "Nachricht",
  envoye_le: "gesendet am",
  programme_pour: "geplant für",
  aucune_notification_envoyee: "Noch keine Benachrichtigung gesendet.",
  voir_anciennes_notifications: "Ältere Benachrichtigungen anzeigen",
  cacher_anciennes_notifications: "Ältere Benachrichtigungen ausblenden",
  aucun_abonne: "Noch kein Kunde für Benachrichtigungen abonniert.",
  nb_abonnes: "Abonnenten",
  annuler_envoi_programme: "Senden abbrechen",
  abonnement_desc: "Verwalten Sie Ihr Walletiz-Abonnement.",
  statut_actuel: "Aktueller Status",
  essai_gratuit: "Kostenlose Testphase",
  plan_pro: "Pro-Plan",
  plan_pro_annuel: "Jahres-Pro-Plan",
  annule: "Storniert",
  expire: "Abgelaufen",
  prochaine_facture: "Nächste Rechnung am",
  fin_essai: "Testphase endet am",
  annuler_abonnement: "Mein Abonnement kündigen",
  reactiver_abonnement: "Mein Abonnement reaktivieren",
  confirmer_annulation_abonnement: "Abonnement kündigen?",
  annulation_abonnement_desc:
    "Ihr Geschäft bleibt bis zum Ende der bezahlten Periode aktiv. Keine Rückerstattung für den laufenden Zeitraum.",
  qr_code_titre: "Ihr QR-Code",
  qr_code_desc:
    "Drucken Sie ihn und stellen Sie ihn an der Kasse aus: Ihre Kunden scannen ihn, um ihre Treuekarten zu öffnen.",
  telecharger_qr: "QR-Code herunterladen",
  tampons_cette_semaine: "Stempel diese Woche",
  tampons_par_mois: "Stempel pro Monat",
  sept_derniers_jours: "Letzte 7 Tage (heute rechts).",
  historique_conserve: "Historie erhalten — Sie können zu vorherigen Jahren zurückkehren.",
  total: "Gesamt",
  commerce_desactive:
    "Ihr Geschäft ist derzeit deaktiviert: Die Kundenseite ist nicht mehr zugänglich. Kontaktieren Sie das Walletiz-Team.",
  vous_voyez_commerce: "Sie sehen das Geschäft",
  revenir_super_admin: "Zurück zum Super-Admin",
  personnalisation: "Personalisierung",
  regles_tampon: "Stempelregeln",
  animation: "Animation",
  choisir_fichier: "Datei auswählen",
  aucun_fichier: "Keine Datei ausgewählt",
  images_max_taille:
    "Bilder, je max. 4 MB. Wenn ein Hintergrundbild hochgeladen wird, ersetzt es die Hauptfarbe.",
  couleur_personnalisee: "Benutzerdefiniert",
  choisissez_parmi_couleurs: "Wählen Sie aus 24 Farben:",
  hex_libelle: "Hex-Code",
  aper_carte_expiree: "Karte abgelaufen",
  date_valide_jusqu: "Gültig bis",
  nb_recompenses: "Belohnungen",
  vous_pouvez_seulement_changer_titre: "Sie können nur den Titel ändern.",
};

const ZH: Traductions = {
  graphiques: "图表",
  mon_commerce: "我的商家",
  cartes_de_fidelite: "会员卡",
  sections_de_ma_page: "页面板块",
  sous_compte: "子账户",
  notifications_push: "推送通知",
  mon_abonnement: "我的订阅",
  qr_code: "二维码",
  connecte: "已登录",
  se_deconnecter: "退出登录",
  langue_dashboard: "面板语言",
  changer_langue: "更改语言",
  clients_fidelises: "忠实客户",
  tampons_distribues_aujourdhui: "今日发放的印章",
  votre_page_client: "您的客户页面",
  attribuer_tampons_client: "🎯 给客户发印章",
  identite_visuelle: "您客户页面的视觉标识。",
  nom_du_commerce: "商家名称",
  logo: "标志",
  image_de_fond: "背景图",
  couleur_principale: "主色",
  couleur_qr: "二维码颜色",
  un_tampon_par_carte: "每张卡每天 1 个印章",
  un_tampon_par_carte_desc:
    "开启:客户每张卡每天可获得 1 个印章。关闭:所有卡每天共 1 个印章。",
  tampon_manuel_uniquement: "手动模式（仅您可发印章）",
  tampon_manuel_uniquement_desc:
    "只有您（或您的子账户）能发印章。客户端的\"获取印章\"按钮将消失。",
  animation_recompense: "奖励动画",
  animation_recompense_desc: "客户选择奖励时显示的效果。",
  couleur_animation: "动画颜色",
  voir_apercu: "查看预览",
  enregistrer: "保存",
  enregistre: "已保存 ✓",
  annuler: "取消",
  modifier: "编辑",
  supprimer: "删除",
  creer: "创建",
  aucune_carte_creee: "尚未创建卡片。",
  nouvelle_carte: "+ 新卡片",
  titre_carte: "卡片标题",
  nombre_tampons_requis: "所需印章数",
  date_expiration: "到期日期（可选）",
  texte_bas_carte: "卡片底部文字（可选）",
  forme_tampon: "印章形状",
  icone_tampon: "印章图标",
  image_tampon: "印章图片（可选，替代图标）",
  recompenses: "奖励",
  ajouter_recompense: "+ 添加奖励",
  texte_recompense: "奖励描述",
  image_recompense: "图片（可选）",
  recompense: "奖励",
  carre: "方形",
  cercle: "圆形",
  hexagone: "六边形",
  etoile: "星形",
  confirmer_suppression_carte: "删除此卡片？所有相关印章和奖励将丢失。",
  confirmer_suppression_recompense: "删除此奖励？",
  expiree: "⚠️ 已过期",
  expire_le: "到期日",
  valable_jusqu_au: "有效期至",
  aucun: "无",
  aucune_animation: "无动画",
  etoiles_scintillantes: "闪烁的星星",
  ondes_lumineuses: "光波",
  rayons_eclatants: "闪耀光线",
  vague_coloree: "彩色波浪",
  sections_desc: "在客户主页添加标签页，分享信息或宣布活动。",
  nouvelle_section: "+ 新板块",
  type_section: "板块类型",
  info_qr: "信息 + 二维码",
  personnalisee: "自定义",
  titre_section: "标题",
  texte_section: "文字",
  lien_url: "链接 URL（可选）",
  lien_libelle: "按钮文字（可选）",
  non_supprimable: "不可删除",
  sous_compte_desc:
    "员工可以拥有仅用于给客户发印章的有限访问权限——不能修改您的配置。",
  email_employe: "员工邮箱",
  email_employe_desc: "用于登录和找回密码。",
  mot_de_passe_initial: "初始密码",
  creer_sous_compte: "创建子账户",
  supprimer_sous_compte: "删除子账户",
  activer_sous_compte: "启用",
  desactiver_sous_compte: "停用",
  aucun_sous_compte: "尚无子账户。",
  notifications_push_desc:
    "向所有订阅的客户发送消息——将以带有您商家标志的通知形式显示在他们的手机上。",
  envoyer_message: "发送消息",
  envoyer_maintenant: "立即发送",
  programmer_envoi: "定时发送",
  date_envoi: "发送日期和时间",
  titre_notif: "标题",
  corps_notif: "消息",
  envoye_le: "发送于",
  programme_pour: "定时发送:",
  aucune_notification_envoyee: "尚未发送通知。",
  voir_anciennes_notifications: "查看旧通知",
  cacher_anciennes_notifications: "隐藏旧通知",
  aucun_abonne: "尚无客户订阅通知。",
  nb_abonnes: "订阅者",
  annuler_envoi_programme: "取消发送",
  abonnement_desc: "管理您的 Walletiz 订阅。",
  statut_actuel: "当前状态",
  essai_gratuit: "免费试用",
  plan_pro: "专业版",
  plan_pro_annuel: "年度专业版",
  annule: "已取消",
  expire: "已过期",
  prochaine_facture: "下次账单日:",
  fin_essai: "试用结束日:",
  annuler_abonnement: "取消我的订阅",
  reactiver_abonnement: "重新激活订阅",
  confirmer_annulation_abonnement: "取消订阅？",
  annulation_abonnement_desc:
    "您的商家在付费期结束前保持活跃。当前期间不予退款。",
  qr_code_titre: "您的二维码",
  qr_code_desc:
    "打印并在收银台展示:您的客户扫描它以打开他们的会员卡。",
  telecharger_qr: "下载二维码",
  tampons_cette_semaine: "本周印章",
  tampons_par_mois: "每月印章",
  sept_derniers_jours: "过去 7 天（今天在右侧）。",
  historique_conserve: "历史记录已保存——您可以查看以前的年份。",
  total: "总计",
  commerce_desactive:
    "您的商家当前已停用:客户页面无法访问。请联系 Walletiz 团队。",
  vous_voyez_commerce: "您正在查看商家",
  revenir_super_admin: "返回超级管理员",
  personnalisation: "个性化",
  regles_tampon: "印章规则",
  animation: "动画",
  choisir_fichier: "选择文件",
  aucun_fichier: "未选择文件",
  images_max_taille: "图片,每张最大 4 MB。如果上传背景图,将替代主色。",
  couleur_personnalisee: "自定义",
  choisissez_parmi_couleurs: "从 24 种颜色中选择:",
  hex_libelle: "十六进制",
  aper_carte_expiree: "卡已过期",
  date_valide_jusqu: "有效期至",
  nb_recompenses: "奖励",
  vous_pouvez_seulement_changer_titre: "您只能修改标题。",
};

const AR: Traductions = {
  graphiques: "الرسوم البيانية",
  mon_commerce: "متجري",
  cartes_de_fidelite: "بطاقات الولاء",
  sections_de_ma_page: "أقسام صفحتي",
  sous_compte: "حساب فرعي",
  notifications_push: "إشعارات فورية",
  mon_abonnement: "اشتراكي",
  qr_code: "رمز QR",
  connecte: "متصل",
  se_deconnecter: "تسجيل الخروج",
  langue_dashboard: "لغة لوحة التحكم",
  changer_langue: "تغيير اللغة",
  clients_fidelises: "العملاء الأوفياء",
  tampons_distribues_aujourdhui: "الأختام الموزعة اليوم",
  votre_page_client: "صفحة عملائك",
  attribuer_tampons_client: "🎯 منح أختام لعميل",
  identite_visuelle: "الهوية البصرية لصفحة عملائك.",
  nom_du_commerce: "اسم المتجر",
  logo: "الشعار",
  image_de_fond: "صورة الخلفية",
  couleur_principale: "اللون الرئيسي",
  couleur_qr: "لون رمز QR",
  un_tampon_par_carte: "ختم واحد لكل بطاقة يومياً",
  un_tampon_par_carte_desc:
    "مفعّل: يحصل العميل على ختم واحد لكل بطاقة يومياً. معطّل: ختم واحد يومياً لجميع البطاقات.",
  tampon_manuel_uniquement: "الوضع اليدوي (أنت فقط تمنح الأختام)",
  tampon_manuel_uniquement_desc:
    "أنت فقط (أو حسابك الفرعي) يمكنك منح الأختام. سيختفي زر «احصل على ختمي» من جانب العميل.",
  animation_recompense: "حركة المكافأة",
  animation_recompense_desc: "التأثير الذي يظهر عندما يختار العميل مكافأته.",
  couleur_animation: "لون الحركة",
  voir_apercu: "عرض المعاينة",
  enregistrer: "حفظ",
  enregistre: "تم الحفظ ✓",
  annuler: "إلغاء",
  modifier: "تعديل",
  supprimer: "حذف",
  creer: "إنشاء",
  aucune_carte_creee: "لم يتم إنشاء بطاقة بعد.",
  nouvelle_carte: "+ بطاقة جديدة",
  titre_carte: "عنوان البطاقة",
  nombre_tampons_requis: "الأختام المطلوبة",
  date_expiration: "تاريخ الانتهاء (اختياري)",
  texte_bas_carte: "نص أسفل البطاقة (اختياري)",
  forme_tampon: "شكل الختم",
  icone_tampon: "أيقونة الختم",
  image_tampon: "صورة الختم (اختيارية، تحل محل الأيقونة)",
  recompenses: "المكافآت",
  ajouter_recompense: "+ إضافة مكافأة",
  texte_recompense: "وصف المكافأة",
  image_recompense: "صورة (اختيارية)",
  recompense: "مكافأة",
  carre: "مربع",
  cercle: "دائرة",
  hexagone: "سداسي",
  etoile: "نجمة",
  confirmer_suppression_carte: "حذف هذه البطاقة؟ ستفقد جميع الأختام والمكافآت المرتبطة.",
  confirmer_suppression_recompense: "حذف هذه المكافأة؟",
  expiree: "⚠️ منتهية",
  expire_le: "تنتهي في",
  valable_jusqu_au: "صالحة حتى",
  aucun: "لا شيء",
  aucune_animation: "بدون حركة",
  etoiles_scintillantes: "نجوم متلألئة",
  ondes_lumineuses: "أمواج ضوئية",
  rayons_eclatants: "أشعة متلألئة",
  vague_coloree: "موجة ملونة",
  sections_desc: "أضف علامات تبويب إلى الصفحة الرئيسية لعملائك لمشاركة معلومة أو الإعلان عن فعالية.",
  nouvelle_section: "+ قسم جديد",
  type_section: "نوع القسم",
  info_qr: "معلومات + رمز QR",
  personnalisee: "مخصص",
  titre_section: "العنوان",
  texte_section: "النص",
  lien_url: "رابط URL (اختياري)",
  lien_libelle: "نص الزر (اختياري)",
  non_supprimable: "غير قابل للحذف",
  sous_compte_desc:
    "يمكن للموظف الحصول على وصول محدود لمنح الأختام للعملاء فقط — دون تعديل الإعدادات.",
  email_employe: "بريد الموظف الإلكتروني",
  email_employe_desc: "يُستخدم لتسجيل الدخول واستعادة كلمة المرور.",
  mot_de_passe_initial: "كلمة المرور الأولية",
  creer_sous_compte: "إنشاء حساب فرعي",
  supprimer_sous_compte: "حذف الحساب الفرعي",
  activer_sous_compte: "تفعيل",
  desactiver_sous_compte: "تعطيل",
  aucun_sous_compte: "لا يوجد حساب فرعي بعد.",
  notifications_push_desc:
    "أرسل رسالة لجميع عملائك المشتركين — ستظهر كإشعار على هواتفهم بشعار متجرك.",
  envoyer_message: "إرسال رسالة",
  envoyer_maintenant: "إرسال الآن",
  programmer_envoi: "جدولة الإرسال",
  date_envoi: "تاريخ ووقت الإرسال",
  titre_notif: "العنوان",
  corps_notif: "الرسالة",
  envoye_le: "أُرسلت في",
  programme_pour: "مجدولة لـ",
  aucune_notification_envoyee: "لم يتم إرسال أي إشعار بعد.",
  voir_anciennes_notifications: "عرض الإشعارات القديمة",
  cacher_anciennes_notifications: "إخفاء الإشعارات القديمة",
  aucun_abonne: "لا يوجد عميل مشترك في الإشعارات بعد.",
  nb_abonnes: "مشتركين",
  annuler_envoi_programme: "إلغاء الإرسال",
  abonnement_desc: "إدارة اشتراكك في Walletiz.",
  statut_actuel: "الحالة الحالية",
  essai_gratuit: "تجربة مجانية",
  plan_pro: "الخطة الاحترافية",
  plan_pro_annuel: "الخطة الاحترافية السنوية",
  annule: "ملغاة",
  expire: "منتهية",
  prochaine_facture: "الفاتورة القادمة في",
  fin_essai: "تنتهي التجربة في",
  annuler_abonnement: "إلغاء اشتراكي",
  reactiver_abonnement: "إعادة تفعيل اشتراكي",
  confirmer_annulation_abonnement: "إلغاء الاشتراك؟",
  annulation_abonnement_desc:
    "يبقى متجرك نشطاً حتى نهاية الفترة المدفوعة. لا يتم استرداد المبلغ للفترة الحالية.",
  qr_code_titre: "رمز QR الخاص بك",
  qr_code_desc:
    "اطبعه واعرضه عند الكاشير: يقوم عملاؤك بمسحه لفتح بطاقات الولاء الخاصة بهم.",
  telecharger_qr: "تحميل رمز QR",
  tampons_cette_semaine: "الأختام هذا الأسبوع",
  tampons_par_mois: "الأختام شهرياً",
  sept_derniers_jours: "آخر 7 أيام (اليوم على اليمين).",
  historique_conserve: "السجل محفوظ — يمكنك العودة إلى السنوات السابقة.",
  total: "المجموع",
  commerce_desactive:
    "متجرك معطّل حالياً: صفحة العميل غير متاحة. تواصل مع فريق Walletiz.",
  vous_voyez_commerce: "أنت تشاهد المتجر",
  revenir_super_admin: "العودة إلى المشرف الأعلى",
  personnalisation: "التخصيص",
  regles_tampon: "قواعد الختم",
  animation: "الحركة",
  choisir_fichier: "اختر ملفاً",
  aucun_fichier: "لم يتم اختيار ملف",
  images_max_taille:
    "الصور، 4 ميغابايت كحد أقصى لكل واحدة. إذا تم تحميل صورة خلفية، فإنها تحل محل اللون الرئيسي.",
  couleur_personnalisee: "مخصص",
  choisissez_parmi_couleurs: "اختر من 24 لوناً:",
  hex_libelle: "رمز HEX",
  aper_carte_expiree: "البطاقة منتهية",
  date_valide_jusqu: "صالحة حتى",
  nb_recompenses: "مكافآت",
  vous_pouvez_seulement_changer_titre: "يمكنك فقط تغيير العنوان.",
};

const RU: Traductions = {
  graphiques: "Графики",
  mon_commerce: "Моё заведение",
  cartes_de_fidelite: "Карты лояльности",
  sections_de_ma_page: "Разделы моей страницы",
  sous_compte: "Субаккаунт",
  notifications_push: "Push-уведомления",
  mon_abonnement: "Моя подписка",
  qr_code: "QR-код",
  connecte: "Вошёл",
  se_deconnecter: "Выйти",
  langue_dashboard: "Язык панели",
  changer_langue: "Сменить язык",
  clients_fidelises: "Постоянные клиенты",
  tampons_distribues_aujourdhui: "Печатей выдано сегодня",
  votre_page_client: "Ваша клиентская страница",
  attribuer_tampons_client: "🎯 Выдать печати клиенту",
  identite_visuelle: "Визуальный стиль вашей клиентской страницы.",
  nom_du_commerce: "Название заведения",
  logo: "Логотип",
  image_de_fond: "Фоновое изображение",
  couleur_principale: "Основной цвет",
  couleur_qr: "Цвет QR-кода",
  un_tampon_par_carte: "1 печать на карту в день",
  un_tampon_par_carte_desc:
    "Включено: клиент получает 1 печать на карту в день. Выключено: 1 печать в день на все карты.",
  tampon_manuel_uniquement: "Ручной режим (только вы даёте печати)",
  tampon_manuel_uniquement_desc:
    "Только вы (или ваш субаккаунт) можете давать печати. Кнопка «Получить печать» исчезает у клиента.",
  animation_recompense: "Анимация награды",
  animation_recompense_desc:
    "Эффект, который отображается, когда клиент выбирает награду.",
  couleur_animation: "Цвет анимации",
  voir_apercu: "Посмотреть предпросмотр",
  enregistrer: "Сохранить",
  enregistre: "Сохранено ✓",
  annuler: "Отмена",
  modifier: "Изменить",
  supprimer: "Удалить",
  creer: "Создать",
  aucune_carte_creee: "Карт пока нет.",
  nouvelle_carte: "+ Новая карта",
  titre_carte: "Название карты",
  nombre_tampons_requis: "Требуется печатей",
  date_expiration: "Срок действия (необязательно)",
  texte_bas_carte: "Текст внизу карты (необязательно)",
  forme_tampon: "Форма печати",
  icone_tampon: "Иконка печати",
  image_tampon: "Изображение печати (необязательно, заменяет иконку)",
  recompenses: "Награды",
  ajouter_recompense: "+ Добавить награду",
  texte_recompense: "Описание награды",
  image_recompense: "Изображение (необязательно)",
  recompense: "Награда",
  carre: "Квадрат",
  cercle: "Круг",
  hexagone: "Шестиугольник",
  etoile: "Звезда",
  confirmer_suppression_carte: "Удалить эту карту? Все связанные печати и награды будут потеряны.",
  confirmer_suppression_recompense: "Удалить эту награду?",
  expiree: "⚠️ истекла",
  expire_le: "истекает",
  valable_jusqu_au: "Действительна до",
  aucun: "Нет",
  aucune_animation: "Без анимации",
  etoiles_scintillantes: "Мерцающие звёзды",
  ondes_lumineuses: "Световые волны",
  rayons_eclatants: "Сияющие лучи",
  vague_coloree: "Цветная волна",
  sections_desc: "Добавьте вкладки на главную страницу ваших клиентов, чтобы поделиться информацией или объявить о событии.",
  nouvelle_section: "+ Новый раздел",
  type_section: "Тип раздела",
  info_qr: "Инфо + QR-код",
  personnalisee: "Пользовательский",
  titre_section: "Заголовок",
  texte_section: "Текст",
  lien_url: "URL ссылки (необязательно)",
  lien_libelle: "Текст кнопки (необязательно)",
  non_supprimable: "нельзя удалить",
  sous_compte_desc:
    "Сотрудник может иметь ограниченный доступ только для выдачи печатей клиентам — без возможности менять настройки.",
  email_employe: "Email сотрудника",
  email_employe_desc: "Используется для входа и восстановления пароля.",
  mot_de_passe_initial: "Начальный пароль",
  creer_sous_compte: "Создать субаккаунт",
  supprimer_sous_compte: "Удалить субаккаунт",
  activer_sous_compte: "Включить",
  desactiver_sous_compte: "Отключить",
  aucun_sous_compte: "Субаккаунта пока нет.",
  notifications_push_desc:
    "Отправьте сообщение всем подписанным клиентам — оно появится как уведомление на их телефоне с логотипом вашего заведения.",
  envoyer_message: "Отправить сообщение",
  envoyer_maintenant: "Отправить сейчас",
  programmer_envoi: "Запланировать",
  date_envoi: "Дата и время отправки",
  titre_notif: "Заголовок",
  corps_notif: "Сообщение",
  envoye_le: "отправлено",
  programme_pour: "запланировано на",
  aucune_notification_envoyee: "Уведомления ещё не отправлялись.",
  voir_anciennes_notifications: "Показать старые уведомления",
  cacher_anciennes_notifications: "Скрыть старые уведомления",
  aucun_abonne: "Пока нет клиентов, подписанных на уведомления.",
  nb_abonnes: "подписчиков",
  annuler_envoi_programme: "Отменить отправку",
  abonnement_desc: "Управляйте вашей подпиской Walletiz.",
  statut_actuel: "Текущий статус",
  essai_gratuit: "Бесплатный пробный период",
  plan_pro: "План Pro",
  plan_pro_annuel: "Годовой план Pro",
  annule: "Отменён",
  expire: "Истёк",
  prochaine_facture: "Следующий счёт",
  fin_essai: "Пробный период до",
  annuler_abonnement: "Отменить мою подписку",
  reactiver_abonnement: "Возобновить подписку",
  confirmer_annulation_abonnement: "Отменить подписку?",
  annulation_abonnement_desc:
    "Ваше заведение остаётся активным до конца оплаченного периода. Возврат за текущий период не производится.",
  qr_code_titre: "Ваш QR-код",
  qr_code_desc:
    "Распечатайте и разместите на кассе: клиенты сканируют его, чтобы открыть свои карты лояльности.",
  telecharger_qr: "Скачать QR-код",
  tampons_cette_semaine: "Печати на этой неделе",
  tampons_par_mois: "Печати по месяцам",
  sept_derniers_jours: "Последние 7 дней (сегодня справа).",
  historique_conserve: "История сохранена — вы можете просмотреть предыдущие годы.",
  total: "Итого",
  commerce_desactive:
    "Ваше заведение сейчас отключено: клиентская страница недоступна. Свяжитесь с командой Walletiz.",
  vous_voyez_commerce: "Вы просматриваете заведение",
  revenir_super_admin: "Вернуться в супер-админ",
  personnalisation: "Персонализация",
  regles_tampon: "Правила печати",
  animation: "Анимация",
  choisir_fichier: "Выбрать файл",
  aucun_fichier: "Файл не выбран",
  images_max_taille:
    "Изображения, до 4 МБ каждое. Если загружено фоновое изображение, оно заменяет основной цвет.",
  couleur_personnalisee: "Свой",
  choisissez_parmi_couleurs: "Выберите из 24 цветов:",
  hex_libelle: "Hex-код",
  aper_carte_expiree: "Карта истекла",
  date_valide_jusqu: "Действительна до",
  nb_recompenses: "наград",
  vous_pouvez_seulement_changer_titre: "Вы можете изменить только название.",
};

const TRADUCTIONS: Record<Langue, Traductions> = {
  fr: FR,
  en: EN,
  es: ES,
  de: DE,
  zh: ZH,
  ar: AR,
  ru: RU,
};

export function tDash(
  cle: CleDash,
  langue: Langue,
  vars?: Record<string, string>
): string {
  let str = TRADUCTIONS[langue]?.[cle] ?? FR[cle] ?? cle;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, v);
    }
  }
  return str;
}
