// Liste des régions proposées à la création d'un restaurant.
// Chaque entrée mappe vers un fuseau horaire IANA officiel — c'est ce
// nom (ex : "Europe/Paris") qui est stocké dans restaurants.timezone.
export const TIMEZONES: { region: string; timezone: string }[] = [
  { region: "France métropolitaine", timezone: "Europe/Paris" },
  { region: "Belgique", timezone: "Europe/Brussels" },
  { region: "Suisse", timezone: "Europe/Zurich" },
  { region: "Luxembourg", timezone: "Europe/Luxembourg" },
  { region: "Canada — Québec / Ontario", timezone: "America/Toronto" },
  { region: "Canada — Colombie-Britannique", timezone: "America/Vancouver" },
  { region: "Maroc", timezone: "Africa/Casablanca" },
  { region: "Algérie", timezone: "Africa/Algiers" },
  { region: "Tunisie", timezone: "Africa/Tunis" },
  { region: "Sénégal", timezone: "Africa/Dakar" },
  { region: "Côte d'Ivoire", timezone: "Africa/Abidjan" },
  { region: "Cameroun", timezone: "Africa/Douala" },
  { region: "La Réunion / Mayotte", timezone: "Indian/Reunion" },
  { region: "Antilles françaises", timezone: "America/Martinique" },
  { region: "Guyane française", timezone: "America/Cayenne" },
  { region: "Nouvelle-Calédonie", timezone: "Pacific/Noumea" },
  { region: "Polynésie française", timezone: "Pacific/Tahiti" },
  { region: "Royaume-Uni / Irlande", timezone: "Europe/London" },
  { region: "Espagne", timezone: "Europe/Madrid" },
  { region: "Italie", timezone: "Europe/Rome" },
  { region: "Portugal", timezone: "Europe/Lisbon" },
  { region: "Allemagne", timezone: "Europe/Berlin" },
];

export function regionDe(timezone: string): string {
  return TIMEZONES.find((t) => t.timezone === timezone)?.region ?? timezone;
}

// La liste des fuseaux acceptés, pour valider côté serveur.
export const TIMEZONES_VALIDES = new Set(TIMEZONES.map((t) => t.timezone));
