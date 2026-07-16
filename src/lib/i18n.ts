// Traductions pour l'espace client. Seul le nom du commerce reste en
// français (car choisi par le restaurateur). Le tableau LANGUES définit
// l'ordre du menu de sélection.

export type Langue = "fr" | "en" | "es" | "de" | "zh" | "ar" | "ru";

export const LANGUES: { code: Langue; nom: string; drapeau: string }[] = [
  { code: "fr", nom: "Français", drapeau: "🇫🇷" },
  { code: "en", nom: "English", drapeau: "🇬🇧" },
  { code: "es", nom: "Español", drapeau: "🇪🇸" },
  { code: "de", nom: "Deutsch", drapeau: "🇩🇪" },
  { code: "zh", nom: "中文", drapeau: "🇨🇳" },
  { code: "ar", nom: "العربية", drapeau: "🇸🇦" },
  { code: "ru", nom: "Русский", drapeau: "🇷🇺" },
];

export const LANGUES_RTL: Langue[] = ["ar"];

type Cle =
  | "bienvenue"
  | "telephone"
  | "telephone_placeholder"
  | "nom_prenom"
  | "nom_prenom_placeholder"
  | "accepter_notifs"
  | "accepter_notifs_obligatoire"
  | "creer_carte"
  | "creation_en_cours"
  | "derniere_etape_notifs"
  | "activer_notifs_desc"
  | "recevoir_notifs"
  | "activation_en_cours"
  | "notifs_actives"
  | "notifs_refusees"
  | "notifs_impossible"
  | "non_merci_plus_tard"
  | "mes_recompenses"
  | "glisser_recompenses"
  | "prendre_tampon_du_jour"
  | "tampon_deja_pris"
  | "un_instant"
  | "scannez_qr_caisse"
  | "un_tampon_max"
  | "choisir_recompense"
  | "choisissez_votre_recompense"
  | "plus_tard"
  | "presentez_qr_personnel"
  | "utiliser_maintenant"
  | "confirmer_utilisation"
  | "obtenue_le"
  | "recompense_obtenue"
  | "toucher_pour_continuer"
  | "votre_recompense"
  | "scanner_qr_commerce"
  | "sur_quelle_carte"
  | "ajout_tampon_en_cours"
  | "tampon_ajoute"
  | "fermer"
  | "pointez_camera"
  | "aucune_carte"
  | "scannez_pour_recevoir"
  | "qr_ne_correspond_pas"
  | "camera_impossible"
  | "presentez_qr_uniquement"
  | "modifier_nom_prenom"
  | "enregistrer"
  | "modifie"
  | "accepter_ne_pas_notifs"
  | "choix_enregistre"
  | "se_desinscrire"
  | "confirmation_desinscription"
  | "toutes_cartes_supprimees"
  | "oui_desinscrire"
  | "annuler"
  | "desinscription_en_cours"
  | "cartes_de_fidelite"
  | "scan"
  | "info"
  | "ajoutez_a_ecran"
  | "pour_recevoir_promotions"
  | "etape_1_partager"
  | "etape_2_en_voir_plus"
  | "etape_3_ajouter_ecran"
  | "etape_4_ouvrir_app"
  | "jai_compris"
  | "ios_install_pour_notifs"
  | "ios_install_etape_1"
  | "ios_install_etape_2"
  | "ios_install_etape_3"
  | "langue"
  | "choisir_langue"
  | "valable_jusqu_au"
  | "expire_le"
  | "ajouter_a_ecran_titre"
  | "ajouter_a_ecran_desc_court"
  | "comment_faire"
  | "ne_plus_afficher";

type Traductions = Record<Cle, string>;

const FR: Traductions = {
  bienvenue: "Bienvenue !",
  telephone: "Numéro de téléphone",
  telephone_placeholder: "06 12 34 56 78",
  nom_prenom: "Nom et prénom",
  nom_prenom_placeholder: "Nom Prénom (ou juste l'un des deux)",
  accepter_notifs:
    "J'accepte de recevoir les notifications de promotions et événements de ce commerce.",
  accepter_notifs_obligatoire: "(Obligatoire pour vous inscrire.)",
  creer_carte: "Créer ma carte de fidélité",
  creation_en_cours: "Création…",
  derniere_etape_notifs: "🔔 Dernière étape : activez vos notifications",
  activer_notifs_desc:
    "Appuyez sur le bouton ci-dessous et autorisez les notifications pour recevoir les promotions et les alertes de récompenses de ce commerce.",
  recevoir_notifs: "🔔 Recevoir les notifications",
  activation_en_cours: "Activation…",
  notifs_actives: "🔔 Vous recevrez les notifications de ce commerce.",
  notifs_refusees:
    "Les notifications sont désactivées dans votre navigateur. Autorisez-les dans les réglages pour recevoir les messages du commerce.",
  notifs_impossible: "Impossible d'activer les notifications.",
  non_merci_plus_tard: "Non merci, plus tard",
  mes_recompenses: "🏆 Mes récompenses à récupérer",
  glisser_recompenses: "← Glissez pour voir toutes vos récompenses →",
  prendre_tampon_du_jour: "Prendre mon tampon du jour",
  tampon_deja_pris: "Tampon du jour déjà pris ✓",
  un_instant: "Un instant…",
  scannez_qr_caisse: "📷 Scannez le QR code en caisse",
  un_tampon_max: "1 tampon maximum par jour",
  choisir_recompense: "🎉 Choisir ma récompense",
  choisissez_votre_recompense: "Choisissez votre récompense :",
  plus_tard: "Plus tard",
  presentez_qr_personnel:
    "Présentez votre QR code personnel au commerçant pour recevoir votre tampon.",
  utiliser_maintenant: "✅ Utiliser maintenant (devant le commerçant)",
  confirmer_utilisation:
    "Confirmer l'utilisation de cette récompense ? À faire uniquement devant le commerçant.",
  obtenue_le: "Obtenue le",
  recompense_obtenue: "Récompense obtenue !",
  toucher_pour_continuer: "Touchez pour continuer",
  votre_recompense: "🎁 Votre récompense",
  scanner_qr_commerce: "📷 Scanner le QR code du commerce",
  sur_quelle_carte: "Sur quelle carte ?",
  ajout_tampon_en_cours: "Ajout du tampon…",
  tampon_ajoute: "✅ Tampon ajouté !",
  fermer: "✕ Fermer",
  pointez_camera: "Pointez la caméra vers le QR code affiché en caisse",
  aucune_carte: "Aucune carte de fidélité disponible pour le moment.",
  scannez_pour_recevoir:
    "Scannez le QR code affiché en caisse pour recevoir votre tampon du jour.",
  qr_ne_correspond_pas:
    "Ce QR code ne correspond pas à ce commerce. Scannez le QR affiché en caisse.",
  camera_impossible:
    "Impossible d'accéder à la caméra. Autorisez l'accès dans les réglages du navigateur.",
  presentez_qr_uniquement:
    "Présentez ce QR code uniquement si le commerçant vous le demande.",
  modifier_nom_prenom: "Nom et prénom",
  enregistrer: "Enregistrer",
  modifie: "✓ Modifié",
  accepter_ne_pas_notifs:
    "J'accepte de ne pas recevoir de notifications pour m'avertir d'une promotion ou d'un événement.",
  choix_enregistre: "✓ Choix enregistré",
  se_desinscrire: "Se désinscrire de ce commerce",
  confirmation_desinscription: "Se désinscrire ?",
  toutes_cartes_supprimees:
    "Toutes vos cartes de fidélité, tampons et récompenses en attente seront définitivement supprimés. Vous pourrez vous réinscrire en scannant à nouveau le QR code du commerce.",
  oui_desinscrire: "Oui, me désinscrire",
  annuler: "Annuler",
  desinscription_en_cours: "Désinscription…",
  cartes_de_fidelite: "Cartes de fidélité",
  scan: "Scan",
  info: "Info",
  ajoutez_a_ecran: "Ajoutez {nom} à votre écran d'accueil",
  pour_recevoir_promotions:
    "Pour recevoir nos promotions et alertes de récompenses par notification, ajoutez cette page comme une application (2 clics suffisent).",
  etape_1_partager: "Appuyez sur le bouton **Partager** ⬆︎ de Safari ou Chrome",
  etape_2_en_voir_plus: "Cliquez sur **« En voir plus »**",
  etape_3_ajouter_ecran:
    "Faites défiler et cliquez sur **« Ajouter à l'écran d'accueil »**",
  etape_4_ouvrir_app:
    "Ouvrez l'app {nom} depuis l'icône apparue sur votre écran d'accueil",
  jai_compris: "J'ai compris",
  ios_install_pour_notifs:
    "📱 Pour recevoir les notifications sur iPhone, ajoutez cette page à votre écran d'accueil.",
  ios_install_etape_1: "Appuyez sur le bouton **Partager** ⬆️ de Safari",
  ios_install_etape_2: "Choisissez **« Sur l'écran d'accueil »**",
  ios_install_etape_3:
    "Ouvrez l'app depuis votre écran d'accueil et revenez ici pour activer les notifications",
  langue: "Langue",
  choisir_langue: "Choisissez votre langue",
  valable_jusqu_au: "Valable jusqu'au",
  expire_le: "Carte expirée le",
  ajouter_a_ecran_titre: "Ajoutez {nom} à votre écran d'accueil",
  ajouter_a_ecran_desc_court:
    "Pour recevoir nos promotions et alertes de récompenses par notification.",
  comment_faire: "Comment faire ?",
  ne_plus_afficher: "Ne plus afficher",
};

const EN: Traductions = {
  bienvenue: "Welcome!",
  telephone: "Phone number",
  telephone_placeholder: "+44 20 7946 0958",
  nom_prenom: "First and last name",
  nom_prenom_placeholder: "First Last (or just one of them)",
  accepter_notifs:
    "I agree to receive promotions and event notifications from this business.",
  accepter_notifs_obligatoire: "(Required to sign up.)",
  creer_carte: "Create my loyalty card",
  creation_en_cours: "Creating…",
  derniere_etape_notifs: "🔔 Last step: activate notifications",
  activer_notifs_desc:
    "Tap the button below and allow notifications to receive promotions and reward alerts from this business.",
  recevoir_notifs: "🔔 Receive notifications",
  activation_en_cours: "Activating…",
  notifs_actives: "🔔 You will receive notifications from this business.",
  notifs_refusees:
    "Notifications are disabled in your browser. Enable them in settings to receive messages.",
  notifs_impossible: "Unable to activate notifications.",
  non_merci_plus_tard: "No thanks, later",
  mes_recompenses: "🏆 My rewards to redeem",
  glisser_recompenses: "← Swipe to see all your rewards →",
  prendre_tampon_du_jour: "Get my stamp of the day",
  tampon_deja_pris: "Today's stamp already claimed ✓",
  un_instant: "One moment…",
  scannez_qr_caisse: "📷 Scan the QR code at the counter",
  un_tampon_max: "Maximum 1 stamp per day",
  choisir_recompense: "🎉 Choose my reward",
  choisissez_votre_recompense: "Choose your reward:",
  plus_tard: "Later",
  presentez_qr_personnel:
    "Show your personal QR code to the merchant to receive your stamp.",
  utiliser_maintenant: "✅ Redeem now (in front of merchant)",
  confirmer_utilisation:
    "Confirm redemption of this reward? Only do this in front of the merchant.",
  obtenue_le: "Earned on",
  recompense_obtenue: "Reward earned!",
  toucher_pour_continuer: "Tap to continue",
  votre_recompense: "🎁 Your reward",
  scanner_qr_commerce: "📷 Scan the business QR code",
  sur_quelle_carte: "On which card?",
  ajout_tampon_en_cours: "Adding stamp…",
  tampon_ajoute: "✅ Stamp added!",
  fermer: "✕ Close",
  pointez_camera: "Point the camera at the QR code at the counter",
  aucune_carte: "No loyalty card available at the moment.",
  scannez_pour_recevoir:
    "Scan the QR code at the counter to receive your stamp of the day.",
  qr_ne_correspond_pas:
    "This QR code does not match this business. Scan the QR at the counter.",
  camera_impossible:
    "Cannot access the camera. Allow access in your browser settings.",
  presentez_qr_uniquement:
    "Only show this QR code if the merchant asks for it.",
  modifier_nom_prenom: "First and last name",
  enregistrer: "Save",
  modifie: "✓ Saved",
  accepter_ne_pas_notifs:
    "I agree not to receive notifications about promotions or events.",
  choix_enregistre: "✓ Choice saved",
  se_desinscrire: "Unsubscribe from this business",
  confirmation_desinscription: "Unsubscribe?",
  toutes_cartes_supprimees:
    "All your loyalty cards, stamps, and pending rewards will be permanently deleted. You can re-register by scanning the business QR code again.",
  oui_desinscrire: "Yes, unsubscribe me",
  annuler: "Cancel",
  desinscription_en_cours: "Unsubscribing…",
  cartes_de_fidelite: "Loyalty cards",
  scan: "Scan",
  info: "Info",
  ajoutez_a_ecran: "Add {nom} to your home screen",
  pour_recevoir_promotions:
    "To receive our promotions and reward alerts by notification, add this page as an app (2 clicks are enough).",
  etape_1_partager: "Tap the **Share** ⬆︎ button in Safari or Chrome",
  etape_2_en_voir_plus: "Tap **\"See More\"**",
  etape_3_ajouter_ecran: "Scroll down and tap **\"Add to Home Screen\"**",
  etape_4_ouvrir_app:
    "Open the {nom} app from the icon that appeared on your home screen",
  jai_compris: "Got it",
  ios_install_pour_notifs:
    "📱 To receive notifications on iPhone, add this page to your home screen.",
  ios_install_etape_1: "Tap the **Share** ⬆️ button in Safari",
  ios_install_etape_2: "Choose **\"Add to Home Screen\"**",
  ios_install_etape_3:
    "Open the app from your home screen and come back here to activate notifications",
  langue: "Language",
  choisir_langue: "Choose your language",
  valable_jusqu_au: "Valid until",
  expire_le: "Card expired on",
  ajouter_a_ecran_titre: "Add {nom} to your home screen",
  ajouter_a_ecran_desc_court:
    "To receive our promotions and reward alerts by notification.",
  comment_faire: "How to?",
  ne_plus_afficher: "Don't show again",
};

const ES: Traductions = {
  bienvenue: "¡Bienvenido!",
  telephone: "Número de teléfono",
  telephone_placeholder: "+34 612 345 678",
  nom_prenom: "Nombre y apellido",
  nom_prenom_placeholder: "Nombre Apellido (o solo uno)",
  accepter_notifs:
    "Acepto recibir notificaciones de promociones y eventos de este comercio.",
  accepter_notifs_obligatoire: "(Obligatorio para registrarse.)",
  creer_carte: "Crear mi tarjeta de fidelidad",
  creation_en_cours: "Creando…",
  derniere_etape_notifs: "🔔 Último paso: activar notificaciones",
  activer_notifs_desc:
    "Toca el botón a continuación y autoriza las notificaciones para recibir promociones y avisos de recompensas.",
  recevoir_notifs: "🔔 Recibir notificaciones",
  activation_en_cours: "Activando…",
  notifs_actives: "🔔 Recibirás notificaciones de este comercio.",
  notifs_refusees:
    "Las notificaciones están desactivadas en tu navegador. Actívalas en los ajustes.",
  notifs_impossible: "No se pueden activar las notificaciones.",
  non_merci_plus_tard: "No gracias, más tarde",
  mes_recompenses: "🏆 Mis recompensas por canjear",
  glisser_recompenses: "← Desliza para ver todas tus recompensas →",
  prendre_tampon_du_jour: "Obtener mi sello del día",
  tampon_deja_pris: "Sello del día ya obtenido ✓",
  un_instant: "Un momento…",
  scannez_qr_caisse: "📷 Escanea el código QR en la caja",
  un_tampon_max: "Máximo 1 sello por día",
  choisir_recompense: "🎉 Elegir mi recompensa",
  choisissez_votre_recompense: "Elige tu recompensa:",
  plus_tard: "Más tarde",
  presentez_qr_personnel:
    "Muestra tu código QR personal al comerciante para recibir tu sello.",
  utiliser_maintenant: "✅ Usar ahora (delante del comerciante)",
  confirmer_utilisation:
    "¿Confirmar el uso de esta recompensa? Solo hazlo delante del comerciante.",
  obtenue_le: "Obtenida el",
  recompense_obtenue: "¡Recompensa obtenida!",
  toucher_pour_continuer: "Toca para continuar",
  votre_recompense: "🎁 Tu recompensa",
  scanner_qr_commerce: "📷 Escanear el QR del comercio",
  sur_quelle_carte: "¿En qué tarjeta?",
  ajout_tampon_en_cours: "Añadiendo sello…",
  tampon_ajoute: "✅ ¡Sello añadido!",
  fermer: "✕ Cerrar",
  pointez_camera: "Apunta la cámara al código QR de la caja",
  aucune_carte: "No hay tarjetas de fidelidad disponibles.",
  scannez_pour_recevoir:
    "Escanea el código QR de la caja para recibir tu sello del día.",
  qr_ne_correspond_pas:
    "Este código QR no corresponde a este comercio. Escanea el QR de la caja.",
  camera_impossible:
    "No se puede acceder a la cámara. Permite el acceso en los ajustes del navegador.",
  presentez_qr_uniquement:
    "Solo muestra este QR si el comerciante lo pide.",
  modifier_nom_prenom: "Nombre y apellido",
  enregistrer: "Guardar",
  modifie: "✓ Guardado",
  accepter_ne_pas_notifs:
    "Acepto no recibir notificaciones sobre promociones o eventos.",
  choix_enregistre: "✓ Elección guardada",
  se_desinscrire: "Darse de baja de este comercio",
  confirmation_desinscription: "¿Darse de baja?",
  toutes_cartes_supprimees:
    "Todas tus tarjetas, sellos y recompensas pendientes se eliminarán definitivamente. Puedes volver a registrarte escaneando el QR del comercio.",
  oui_desinscrire: "Sí, darme de baja",
  annuler: "Cancelar",
  desinscription_en_cours: "Dándose de baja…",
  cartes_de_fidelite: "Tarjetas de fidelidad",
  scan: "Escanear",
  info: "Info",
  ajoutez_a_ecran: "Añade {nom} a tu pantalla de inicio",
  pour_recevoir_promotions:
    "Para recibir promociones y avisos de recompensas por notificación, añade esta página como app (2 clics).",
  etape_1_partager: "Toca el botón **Compartir** ⬆︎ en Safari o Chrome",
  etape_2_en_voir_plus: "Toca **\"Ver más\"**",
  etape_3_ajouter_ecran:
    "Desplázate y toca **\"Añadir a pantalla de inicio\"**",
  etape_4_ouvrir_app:
    "Abre la app {nom} desde el icono en tu pantalla de inicio",
  jai_compris: "Entendido",
  ios_install_pour_notifs:
    "📱 Para recibir notificaciones en iPhone, añade esta página a tu pantalla de inicio.",
  ios_install_etape_1: "Toca el botón **Compartir** ⬆️ en Safari",
  ios_install_etape_2: "Elige **\"Añadir a pantalla de inicio\"**",
  ios_install_etape_3:
    "Abre la app desde tu pantalla de inicio y vuelve aquí para activar notificaciones",
  langue: "Idioma",
  choisir_langue: "Elige tu idioma",
  valable_jusqu_au: "Válida hasta",
  expire_le: "Tarjeta expirada el",
  ajouter_a_ecran_titre: "Añade {nom} a tu pantalla de inicio",
  ajouter_a_ecran_desc_court:
    "Para recibir nuestras promociones y avisos de recompensas por notificación.",
  comment_faire: "¿Cómo hacerlo?",
  ne_plus_afficher: "No mostrar más",
};

const DE: Traductions = {
  bienvenue: "Willkommen!",
  telephone: "Telefonnummer",
  telephone_placeholder: "+49 30 12345678",
  nom_prenom: "Vor- und Nachname",
  nom_prenom_placeholder: "Vorname Nachname (oder nur einer)",
  accepter_notifs:
    "Ich stimme zu, Benachrichtigungen zu Aktionen und Veranstaltungen dieses Geschäfts zu erhalten.",
  accepter_notifs_obligatoire: "(Erforderlich für die Anmeldung.)",
  creer_carte: "Meine Treuekarte erstellen",
  creation_en_cours: "Erstellung…",
  derniere_etape_notifs: "🔔 Letzter Schritt: Benachrichtigungen aktivieren",
  activer_notifs_desc:
    "Tippen Sie auf die Schaltfläche unten und erlauben Sie Benachrichtigungen.",
  recevoir_notifs: "🔔 Benachrichtigungen erhalten",
  activation_en_cours: "Aktivierung…",
  notifs_actives:
    "🔔 Sie erhalten Benachrichtigungen von diesem Geschäft.",
  notifs_refusees:
    "Benachrichtigungen sind in Ihrem Browser deaktiviert. Aktivieren Sie sie in den Einstellungen.",
  notifs_impossible: "Benachrichtigungen können nicht aktiviert werden.",
  non_merci_plus_tard: "Nein danke, später",
  mes_recompenses: "🏆 Meine Belohnungen zum Einlösen",
  glisser_recompenses: "← Wischen Sie, um alle Belohnungen zu sehen →",
  prendre_tampon_du_jour: "Meinen Stempel für heute holen",
  tampon_deja_pris: "Heutiger Stempel bereits erhalten ✓",
  un_instant: "Einen Moment…",
  scannez_qr_caisse: "📷 QR-Code an der Kasse scannen",
  un_tampon_max: "Maximal 1 Stempel pro Tag",
  choisir_recompense: "🎉 Meine Belohnung wählen",
  choisissez_votre_recompense: "Wählen Sie Ihre Belohnung:",
  plus_tard: "Später",
  presentez_qr_personnel:
    "Zeigen Sie dem Händler Ihren persönlichen QR-Code, um Ihren Stempel zu erhalten.",
  utiliser_maintenant: "✅ Jetzt einlösen (vor dem Händler)",
  confirmer_utilisation:
    "Diese Belohnung einlösen? Nur vor dem Händler tun.",
  obtenue_le: "Erhalten am",
  recompense_obtenue: "Belohnung erhalten!",
  toucher_pour_continuer: "Tippen zum Fortfahren",
  votre_recompense: "🎁 Ihre Belohnung",
  scanner_qr_commerce: "📷 QR-Code des Geschäfts scannen",
  sur_quelle_carte: "Auf welcher Karte?",
  ajout_tampon_en_cours: "Stempel wird hinzugefügt…",
  tampon_ajoute: "✅ Stempel hinzugefügt!",
  fermer: "✕ Schließen",
  pointez_camera: "Kamera auf den QR-Code an der Kasse richten",
  aucune_carte: "Keine Treuekarte verfügbar.",
  scannez_pour_recevoir:
    "Scannen Sie den QR-Code an der Kasse, um Ihren Stempel zu erhalten.",
  qr_ne_correspond_pas:
    "Dieser QR-Code passt nicht zu diesem Geschäft. Scannen Sie den QR an der Kasse.",
  camera_impossible:
    "Kein Kamerazugriff. Erlauben Sie den Zugriff in den Browsereinstellungen.",
  presentez_qr_uniquement:
    "Zeigen Sie diesen QR-Code nur, wenn der Händler ihn verlangt.",
  modifier_nom_prenom: "Vor- und Nachname",
  enregistrer: "Speichern",
  modifie: "✓ Gespeichert",
  accepter_ne_pas_notifs:
    "Ich möchte keine Benachrichtigungen zu Aktionen oder Veranstaltungen erhalten.",
  choix_enregistre: "✓ Wahl gespeichert",
  se_desinscrire: "Von diesem Geschäft abmelden",
  confirmation_desinscription: "Abmelden?",
  toutes_cartes_supprimees:
    "Alle Treuekarten, Stempel und ausstehenden Belohnungen werden endgültig gelöscht. Sie können sich erneut anmelden, indem Sie den QR-Code des Geschäfts scannen.",
  oui_desinscrire: "Ja, abmelden",
  annuler: "Abbrechen",
  desinscription_en_cours: "Abmeldung…",
  cartes_de_fidelite: "Treuekarten",
  scan: "Scannen",
  info: "Info",
  ajoutez_a_ecran: "Fügen Sie {nom} zu Ihrem Startbildschirm hinzu",
  pour_recevoir_promotions:
    "Um unsere Aktionen und Belohnungshinweise per Benachrichtigung zu erhalten, fügen Sie diese Seite als App hinzu (2 Klicks reichen).",
  etape_1_partager: "Tippen Sie auf **Teilen** ⬆︎ in Safari oder Chrome",
  etape_2_en_voir_plus: "Tippen Sie auf **\"Mehr anzeigen\"**",
  etape_3_ajouter_ecran:
    "Scrollen Sie und tippen Sie auf **\"Zum Home-Bildschirm\"**",
  etape_4_ouvrir_app:
    "Öffnen Sie die App {nom} über das Symbol auf Ihrem Startbildschirm",
  jai_compris: "Verstanden",
  ios_install_pour_notifs:
    "📱 Um Benachrichtigungen auf dem iPhone zu erhalten, fügen Sie diese Seite zu Ihrem Startbildschirm hinzu.",
  ios_install_etape_1: "Tippen Sie auf **Teilen** ⬆️ in Safari",
  ios_install_etape_2: "Wählen Sie **\"Zum Home-Bildschirm\"**",
  ios_install_etape_3:
    "Öffnen Sie die App vom Startbildschirm und kommen Sie zurück, um Benachrichtigungen zu aktivieren",
  langue: "Sprache",
  choisir_langue: "Wählen Sie Ihre Sprache",
  valable_jusqu_au: "Gültig bis",
  expire_le: "Karte abgelaufen am",
  ajouter_a_ecran_titre: "Fügen Sie {nom} zu Ihrem Startbildschirm hinzu",
  ajouter_a_ecran_desc_court:
    "Um unsere Aktionen und Belohnungshinweise per Benachrichtigung zu erhalten.",
  comment_faire: "Wie geht das?",
  ne_plus_afficher: "Nicht mehr anzeigen",
};

const ZH: Traductions = {
  bienvenue: "欢迎！",
  telephone: "电话号码",
  telephone_placeholder: "+86 138 0000 0000",
  nom_prenom: "姓和名",
  nom_prenom_placeholder: "姓 名（或其中之一）",
  accepter_notifs: "我同意接收此商家的促销和活动通知。",
  accepter_notifs_obligatoire: "（注册必填。）",
  creer_carte: "创建我的会员卡",
  creation_en_cours: "创建中…",
  derniere_etape_notifs: "🔔 最后一步：启用通知",
  activer_notifs_desc: "点击下面的按钮并允许通知以接收促销和奖励提醒。",
  recevoir_notifs: "🔔 接收通知",
  activation_en_cours: "启用中…",
  notifs_actives: "🔔 您将收到此商家的通知。",
  notifs_refusees: "浏览器中的通知已禁用。请在设置中启用。",
  notifs_impossible: "无法启用通知。",
  non_merci_plus_tard: "不了，稍后再说",
  mes_recompenses: "🏆 我的待兑换奖励",
  glisser_recompenses: "← 滑动查看所有奖励 →",
  prendre_tampon_du_jour: "领取今日印章",
  tampon_deja_pris: "今日印章已领取 ✓",
  un_instant: "请稍候…",
  scannez_qr_caisse: "📷 扫描收银台的二维码",
  un_tampon_max: "每天最多 1 个印章",
  choisir_recompense: "🎉 选择我的奖励",
  choisissez_votre_recompense: "选择您的奖励：",
  plus_tard: "稍后",
  presentez_qr_personnel: "向商家出示您的个人二维码以获取印章。",
  utiliser_maintenant: "✅ 立即使用（在商家面前）",
  confirmer_utilisation: "确认使用此奖励？请仅在商家面前操作。",
  obtenue_le: "获得于",
  recompense_obtenue: "获得奖励！",
  toucher_pour_continuer: "点击继续",
  votre_recompense: "🎁 您的奖励",
  scanner_qr_commerce: "📷 扫描商家二维码",
  sur_quelle_carte: "在哪张卡上？",
  ajout_tampon_en_cours: "添加印章中…",
  tampon_ajoute: "✅ 印章已添加！",
  fermer: "✕ 关闭",
  pointez_camera: "将相机对准收银台的二维码",
  aucune_carte: "目前没有可用的会员卡。",
  scannez_pour_recevoir: "扫描收银台的二维码以领取今日印章。",
  qr_ne_correspond_pas: "此二维码不属于此商家。请扫描收银台的二维码。",
  camera_impossible: "无法访问相机。请在浏览器设置中允许访问。",
  presentez_qr_uniquement: "仅在商家要求时出示此二维码。",
  modifier_nom_prenom: "姓和名",
  enregistrer: "保存",
  modifie: "✓ 已保存",
  accepter_ne_pas_notifs: "我同意不接收有关促销或活动的通知。",
  choix_enregistre: "✓ 选择已保存",
  se_desinscrire: "取消订阅此商家",
  confirmation_desinscription: "取消订阅？",
  toutes_cartes_supprimees:
    "您的所有会员卡、印章和待兑换奖励将被永久删除。您可以通过再次扫描商家二维码重新注册。",
  oui_desinscrire: "是的，取消订阅",
  annuler: "取消",
  desinscription_en_cours: "取消订阅中…",
  cartes_de_fidelite: "会员卡",
  scan: "扫描",
  info: "信息",
  ajoutez_a_ecran: "将 {nom} 添加到您的主屏幕",
  pour_recevoir_promotions:
    "要通过通知接收我们的促销和奖励提醒，请将此页面添加为应用（只需 2 次点击）。",
  etape_1_partager: "点击 Safari 或 Chrome 中的 **分享** ⬆︎ 按钮",
  etape_2_en_voir_plus: "点击 **\"查看更多\"**",
  etape_3_ajouter_ecran: "向下滚动并点击 **\"添加到主屏幕\"**",
  etape_4_ouvrir_app: "从主屏幕上出现的图标打开 {nom} 应用",
  jai_compris: "知道了",
  ios_install_pour_notifs:
    "📱 要在 iPhone 上接收通知，请将此页面添加到主屏幕。",
  ios_install_etape_1: "点击 Safari 中的 **分享** ⬆️ 按钮",
  ios_install_etape_2: "选择 **\"添加到主屏幕\"**",
  ios_install_etape_3: "从主屏幕打开应用并返回此处以激活通知",
  langue: "语言",
  choisir_langue: "选择您的语言",
  valable_jusqu_au: "有效期至",
  expire_le: "卡已过期于",
  ajouter_a_ecran_titre: "将 {nom} 添加到您的主屏幕",
  ajouter_a_ecran_desc_court: "以通过通知接收我们的促销和奖励提醒。",
  comment_faire: "怎么做?",
  ne_plus_afficher: "不再显示",
};

const AR: Traductions = {
  bienvenue: "مرحباً!",
  telephone: "رقم الهاتف",
  telephone_placeholder: "+966 50 123 4567",
  nom_prenom: "الاسم الأول واسم العائلة",
  nom_prenom_placeholder: "الاسم الأول العائلة (أو أحدهما فقط)",
  accepter_notifs: "أوافق على تلقي إشعارات العروض والفعاليات من هذا المتجر.",
  accepter_notifs_obligatoire: "(مطلوب للتسجيل.)",
  creer_carte: "إنشاء بطاقة الولاء الخاصة بي",
  creation_en_cours: "جارٍ الإنشاء…",
  derniere_etape_notifs: "🔔 الخطوة الأخيرة: تفعيل الإشعارات",
  activer_notifs_desc:
    "اضغط على الزر أدناه واسمح بالإشعارات لتلقي العروض وتنبيهات المكافآت.",
  recevoir_notifs: "🔔 تلقي الإشعارات",
  activation_en_cours: "جارٍ التفعيل…",
  notifs_actives: "🔔 ستتلقى الإشعارات من هذا المتجر.",
  notifs_refusees:
    "الإشعارات معطلة في متصفحك. فعّلها من الإعدادات لتلقي رسائل المتجر.",
  notifs_impossible: "تعذر تفعيل الإشعارات.",
  non_merci_plus_tard: "لا شكراً، لاحقاً",
  mes_recompenses: "🏆 مكافآتي للاستلام",
  glisser_recompenses: "← اسحب لرؤية جميع مكافآتك →",
  prendre_tampon_du_jour: "احصل على ختم اليوم",
  tampon_deja_pris: "تم استلام ختم اليوم بالفعل ✓",
  un_instant: "لحظة…",
  scannez_qr_caisse: "📷 امسح رمز QR في الصندوق",
  un_tampon_max: "ختم واحد كحد أقصى في اليوم",
  choisir_recompense: "🎉 اختر مكافأتي",
  choisissez_votre_recompense: "اختر مكافأتك:",
  plus_tard: "لاحقاً",
  presentez_qr_personnel: "أظهر رمز QR الشخصي للتاجر لتلقي ختمك.",
  utiliser_maintenant: "✅ استخدم الآن (أمام التاجر)",
  confirmer_utilisation:
    "تأكيد استخدام هذه المكافأة؟ افعل ذلك فقط أمام التاجر.",
  obtenue_le: "تم الحصول عليها في",
  recompense_obtenue: "مكافأة تم الحصول عليها!",
  toucher_pour_continuer: "اضغط للمتابعة",
  votre_recompense: "🎁 مكافأتك",
  scanner_qr_commerce: "📷 امسح رمز QR الخاص بالمتجر",
  sur_quelle_carte: "على أي بطاقة؟",
  ajout_tampon_en_cours: "جارٍ إضافة الختم…",
  tampon_ajoute: "✅ تمت إضافة الختم!",
  fermer: "✕ إغلاق",
  pointez_camera: "وجّه الكاميرا نحو رمز QR في الصندوق",
  aucune_carte: "لا توجد بطاقة ولاء متاحة حالياً.",
  scannez_pour_recevoir: "امسح رمز QR في الصندوق لتلقي ختمك اليومي.",
  qr_ne_correspond_pas:
    "رمز QR هذا لا يطابق هذا المتجر. امسح رمز QR في الصندوق.",
  camera_impossible: "تعذر الوصول إلى الكاميرا. اسمح بالوصول في إعدادات المتصفح.",
  presentez_qr_uniquement: "أظهر رمز QR هذا فقط إذا طلبه التاجر.",
  modifier_nom_prenom: "الاسم الأول واسم العائلة",
  enregistrer: "حفظ",
  modifie: "✓ تم الحفظ",
  accepter_ne_pas_notifs:
    "أوافق على عدم تلقي إشعارات حول العروض أو الفعاليات.",
  choix_enregistre: "✓ تم حفظ الاختيار",
  se_desinscrire: "إلغاء الاشتراك من هذا المتجر",
  confirmation_desinscription: "إلغاء الاشتراك؟",
  toutes_cartes_supprimees:
    "سيتم حذف جميع بطاقات الولاء والأختام والمكافآت المعلقة نهائياً. يمكنك إعادة التسجيل بمسح رمز QR الخاص بالمتجر مرة أخرى.",
  oui_desinscrire: "نعم، إلغاء اشتراكي",
  annuler: "إلغاء",
  desinscription_en_cours: "جارٍ إلغاء الاشتراك…",
  cartes_de_fidelite: "بطاقات الولاء",
  scan: "مسح",
  info: "معلومات",
  ajoutez_a_ecran: "أضف {nom} إلى شاشتك الرئيسية",
  pour_recevoir_promotions:
    "لتلقي عروضنا وتنبيهات المكافآت عبر الإشعارات، أضف هذه الصفحة كتطبيق (نقرتان تكفيان).",
  etape_1_partager: "اضغط على زر **مشاركة** ⬆︎ في Safari أو Chrome",
  etape_2_en_voir_plus: "اضغط على **\"عرض المزيد\"**",
  etape_3_ajouter_ecran: "مرر واضغط على **\"إضافة إلى الشاشة الرئيسية\"**",
  etape_4_ouvrir_app: "افتح تطبيق {nom} من الأيقونة على شاشتك الرئيسية",
  jai_compris: "فهمت",
  ios_install_pour_notifs:
    "📱 لتلقي الإشعارات على iPhone، أضف هذه الصفحة إلى شاشتك الرئيسية.",
  ios_install_etape_1: "اضغط على زر **مشاركة** ⬆️ في Safari",
  ios_install_etape_2: "اختر **\"إضافة إلى الشاشة الرئيسية\"**",
  ios_install_etape_3:
    "افتح التطبيق من شاشتك الرئيسية وعُد إلى هنا لتفعيل الإشعارات",
  langue: "اللغة",
  choisir_langue: "اختر لغتك",
  valable_jusqu_au: "صالحة حتى",
  expire_le: "انتهت البطاقة في",
  ajouter_a_ecran_titre: "أضف {nom} إلى شاشتك الرئيسية",
  ajouter_a_ecran_desc_court:
    "لتلقي عروضنا وتنبيهات المكافآت عبر الإشعارات.",
  comment_faire: "كيف؟",
  ne_plus_afficher: "عدم العرض مجدداً",
};

const RU: Traductions = {
  bienvenue: "Добро пожаловать!",
  telephone: "Номер телефона",
  telephone_placeholder: "+7 900 000 00 00",
  nom_prenom: "Имя и фамилия",
  nom_prenom_placeholder: "Имя Фамилия (или только одно из них)",
  accepter_notifs:
    "Я согласен получать уведомления об акциях и мероприятиях этого магазина.",
  accepter_notifs_obligatoire: "(Обязательно для регистрации.)",
  creer_carte: "Создать мою карту лояльности",
  creation_en_cours: "Создание…",
  derniere_etape_notifs: "🔔 Последний шаг: включите уведомления",
  activer_notifs_desc:
    "Нажмите кнопку ниже и разрешите уведомления, чтобы получать акции и оповещения о наградах.",
  recevoir_notifs: "🔔 Получать уведомления",
  activation_en_cours: "Активация…",
  notifs_actives: "🔔 Вы будете получать уведомления от этого магазина.",
  notifs_refusees:
    "Уведомления отключены в вашем браузере. Включите их в настройках.",
  notifs_impossible: "Не удалось активировать уведомления.",
  non_merci_plus_tard: "Нет, спасибо, позже",
  mes_recompenses: "🏆 Мои награды к получению",
  glisser_recompenses: "← Проведите, чтобы увидеть все награды →",
  prendre_tampon_du_jour: "Получить сегодняшнюю печать",
  tampon_deja_pris: "Сегодняшняя печать уже получена ✓",
  un_instant: "Секунду…",
  scannez_qr_caisse: "📷 Отсканируйте QR-код на кассе",
  un_tampon_max: "Максимум 1 печать в день",
  choisir_recompense: "🎉 Выбрать мою награду",
  choisissez_votre_recompense: "Выберите вашу награду:",
  plus_tard: "Позже",
  presentez_qr_personnel: "Покажите продавцу свой QR-код, чтобы получить печать.",
  utiliser_maintenant: "✅ Использовать сейчас (перед продавцом)",
  confirmer_utilisation:
    "Подтвердить использование этой награды? Только перед продавцом.",
  obtenue_le: "Получена",
  recompense_obtenue: "Награда получена!",
  toucher_pour_continuer: "Нажмите, чтобы продолжить",
  votre_recompense: "🎁 Ваша награда",
  scanner_qr_commerce: "📷 Сканировать QR-код магазина",
  sur_quelle_carte: "На какой карте?",
  ajout_tampon_en_cours: "Добавление печати…",
  tampon_ajoute: "✅ Печать добавлена!",
  fermer: "✕ Закрыть",
  pointez_camera: "Направьте камеру на QR-код на кассе",
  aucune_carte: "Нет доступных карт лояльности.",
  scannez_pour_recevoir:
    "Отсканируйте QR-код на кассе, чтобы получить сегодняшнюю печать.",
  qr_ne_correspond_pas:
    "Этот QR-код не соответствует магазину. Отсканируйте QR на кассе.",
  camera_impossible:
    "Не удалось получить доступ к камере. Разрешите доступ в настройках браузера.",
  presentez_qr_uniquement:
    "Показывайте этот QR-код только по просьбе продавца.",
  modifier_nom_prenom: "Имя и фамилия",
  enregistrer: "Сохранить",
  modifie: "✓ Сохранено",
  accepter_ne_pas_notifs:
    "Я согласен не получать уведомления об акциях или мероприятиях.",
  choix_enregistre: "✓ Выбор сохранён",
  se_desinscrire: "Отписаться от этого магазина",
  confirmation_desinscription: "Отписаться?",
  toutes_cartes_supprimees:
    "Все ваши карты лояльности, печати и ожидающие награды будут окончательно удалены. Вы можете зарегистрироваться заново, отсканировав QR-код магазина.",
  oui_desinscrire: "Да, отписаться",
  annuler: "Отмена",
  desinscription_en_cours: "Отписка…",
  cartes_de_fidelite: "Карты лояльности",
  scan: "Сканировать",
  info: "Информация",
  ajoutez_a_ecran: "Добавьте {nom} на главный экран",
  pour_recevoir_promotions:
    "Чтобы получать акции и уведомления о наградах, добавьте эту страницу как приложение (достаточно 2 нажатий).",
  etape_1_partager: "Нажмите кнопку **Поделиться** ⬆︎ в Safari или Chrome",
  etape_2_en_voir_plus: "Нажмите **\"Ещё\"**",
  etape_3_ajouter_ecran:
    "Прокрутите вниз и нажмите **\"На экран «Домой»\"**",
  etape_4_ouvrir_app: "Откройте приложение {nom} с иконки на главном экране",
  jai_compris: "Понятно",
  ios_install_pour_notifs:
    "📱 Чтобы получать уведомления на iPhone, добавьте эту страницу на главный экран.",
  ios_install_etape_1: "Нажмите кнопку **Поделиться** ⬆️ в Safari",
  ios_install_etape_2: "Выберите **\"На экран «Домой»\"**",
  ios_install_etape_3:
    "Откройте приложение с главного экрана и вернитесь сюда, чтобы включить уведомления",
  langue: "Язык",
  choisir_langue: "Выберите ваш язык",
  valable_jusqu_au: "Действительна до",
  expire_le: "Карта истекла",
  ajouter_a_ecran_titre: "Добавьте {nom} на главный экран",
  ajouter_a_ecran_desc_court:
    "Чтобы получать наши акции и уведомления о наградах.",
  comment_faire: "Как это сделать?",
  ne_plus_afficher: "Больше не показывать",
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

export function t(cle: Cle, langue: Langue, vars?: Record<string, string>): string {
  let str = TRADUCTIONS[langue]?.[cle] ?? FR[cle] ?? cle;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, v);
    }
  }
  return str;
}
