import { cookies } from "next/headers";
import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { dateDuJour } from "@/lib/utils";
import type {
  Carte,
  CarteClient,
  ClientFidelite,
  Recompense,
  RecompenseGagnee,
  Restaurant,
  Section,
} from "@/lib/types";
import { EspaceClient, type CarteAffichee } from "./EspaceClient";
import { FormulaireInscription } from "./FormulaireInscription";
import { getVapidPublicKey } from "@/lib/push";
import { LangueProvider } from "@/lib/langue";
import { LangueSourceProvider } from "@/lib/auto-traduction";
import type { Langue } from "@/lib/i18n";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// Métadonnées par commerce : chaque restaurateur devient sa propre "app" sur
// iPhone (quand le client ajoute la page à l'écran d'accueil). Nom + icône
// deviennent ceux du commerce, plus ceux de Walletiz.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("nom, logo_url")
    .eq("slug", slug)
    .maybeSingle<Pick<Restaurant, "nom" | "logo_url">>();

  if (!restaurant) return { title: "Commerce introuvable" };

  return {
    title: restaurant.nom,
    description: `Carte de fidélité ${restaurant.nom}`,
    manifest: `/c/${slug}/manifest.webmanifest`,
    icons: restaurant.logo_url
      ? {
          icon: restaurant.logo_url,
          apple: restaurant.logo_url,
          shortcut: restaurant.logo_url,
        }
      : undefined,
    appleWebApp: {
      capable: true,
      title: restaurant.nom,
      statusBarStyle: "default",
    },
    // Next n'émet que « mobile-web-app-capable » ; iOS Safari a besoin de la
    // balise préfixée « apple- » pour ouvrir la page en mode app plein écran
    // (et pas comme un simple raccourci qui rouvre Safari). On l'ajoute donc
    // explicitement.
    other: {
      "apple-mobile-web-app-capable": "yes",
    },
  };
}

export default async function PageCommerce({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("actif", true)
    .maybeSingle<Restaurant>();

  if (!restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="text-5xl">🔍</p>
          <h1 className="mt-4 text-xl font-bold text-stone-900">
            Commerce introuvable
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Ce lien ne correspond à aucun commerce actif.
          </p>
        </div>
      </main>
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(`fid_${restaurant.id}`)?.value;
  const scanRecent = Boolean(cookieStore.get(`scan_${restaurant.id}`)?.value);

  let client: ClientFidelite | null = null;
  if (token) {
    const { data } = await admin
      .from("clients_fidelite")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .eq("token_cookie", token)
      .maybeSingle<ClientFidelite>();
    client = data;
  }

  // Toujours charger les sections (même quand pas de client) — inscription simple
  let { data: sectionsData } = await admin
    .from("sections")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("ordre", { ascending: true })
    .returns<Section[]>();
  let sections = sectionsData ?? [];

  // Auto-réparation : si aucune section (migration incomplète, ancien
  // restaurant…), on crée les 2 sections par défaut à la volée
  if (sections.length === 0) {
    await admin.from("sections").insert([
      {
        restaurant_id: restaurant.id,
        type: "cartes",
        titre: "Cartes de fidélité",
        ordre: 0,
        supprimable: false,
      },
      {
        restaurant_id: restaurant.id,
        type: "info",
        titre: "Info",
        texte:
          "Présentez ce QR code uniquement si le commerçant vous le demande.",
        ordre: 100,
        supprimable: false,
      },
    ]);
    const { data: refetch } = await admin
      .from("sections")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("ordre", { ascending: true })
      .returns<Section[]>();
    sectionsData = refetch;
    sections = sectionsData ?? [];
  }

  let cartesAffichees: CarteAffichee[] = [];
  let recompenses: Recompense[] = [];
  let recompensesEnAttente: RecompenseGagnee[] = [];
  let qrClientDataUrl: string | null = null;

  if (client) {
    const aujourdHui = dateDuJour(restaurant.timezone ?? "Europe/Paris");
    const [resCartes, resRecompenses, resProgressions, resGagnees] = await Promise.all([
      admin
        .from("cartes")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("actif", true)
        .order("created_at", { ascending: true }),
      admin
        .from("recompenses")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: true }),
      admin
        .from("cartes_clients")
        .select("*")
        .eq("client_id", client.id),
      admin
        .from("recompenses_gagnees")
        .select("*")
        .eq("client_id", client.id)
        .is("date_utilisee", null)
        .order("date_gagnee", { ascending: false }),
    ]);

    const cartes = (resCartes.data as Carte[]) ?? [];
    recompenses = (resRecompenses.data as Recompense[]) ?? [];
    const progressions = (resProgressions.data as CarteClient[]) ?? [];
    recompensesEnAttente = (resGagnees.data as RecompenseGagnee[]) ?? [];

    // Si le restaurateur a coché "1 tampon par jour toutes cartes confondues",
    // toutes les cartes doivent afficher "déjà pris aujourd'hui" dès qu'une
    // carte a reçu son tampon du jour (sinon le client voit un bouton actif
    // qui échouera au clic).
    const tamponGlobalPrisAujourdHui =
      restaurant.tampon_par_carte === false &&
      client.date_dernier_tampon === aujourdHui;

    cartesAffichees = cartes
      // Cartes sans date d'expiration : toujours visibles.
      // Cartes expirées : masquées sauf si le client a des tampons dessus.
      .filter((c) => {
        if (!c.date_expiration) return true;
        const expiree = c.date_expiration < aujourdHui;
        const progression = progressions.find((p) => p.carte_id === c.id);
        return !expiree || (progression?.tampons_actuels ?? 0) > 0;
      })
      .map((c) => {
        const progression = progressions.find((p) => p.carte_id === c.id);
        const prisSurCetteCarte =
          progression?.date_dernier_tampon === aujourdHui;
        return {
          id: c.id,
          titre: c.titre,
          tampon_icone: c.tampon_icone,
          tampon_image_url: c.tampon_image_url,
          tampon_forme: c.tampon_forme ?? "carre",
          nombre_tampons_requis: c.nombre_tampons_requis,
          texte_bas: c.texte_bas,
          date_expiration: c.date_expiration,
          expiree: c.date_expiration !== null && c.date_expiration < aujourdHui,
          tampons_actuels: progression?.tampons_actuels ?? 0,
          recompenses_reclamees: progression?.recompenses_reclamees ?? 0,
          tampon_pris_aujourdhui: tamponGlobalPrisAujourdHui || prisSurCetteCarte,
        };
      });

    // QR code personnel du client — c'est ce QR que le commerçant scanne
    // pour attribuer des tampons directement (sans saisie manuelle).
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const lienScan = `${siteUrl}/dashboard/scanner?c=${client.token_public ?? client.id}`;
    qrClientDataUrl = await QRCode.toDataURL(lienScan, {
      width: 480,
      margin: 2,
      color: { dark: restaurant.couleur_qr ?? "#380b15", light: "#ffffff" },
    });
  }

  const langueRestaurant = ((restaurant.langue ?? "fr") as Langue);

  return (
    <LangueProvider>
    <LangueSourceProvider langue={langueRestaurant}>
    <main className="min-h-screen bg-white">
      <header
        className="relative flex h-[38vh] max-h-[360px] min-h-[240px] items-center justify-center overflow-hidden px-6 text-center text-white"
        style={restaurant.fond_url ? undefined : { backgroundColor: restaurant.couleur }}
      >
        {restaurant.fond_url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={restaurant.fond_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
        <div className="relative">
          {restaurant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={restaurant.logo_url}
              alt={`Logo de ${restaurant.nom}`}
              className="mx-auto h-20 w-20 rounded-2xl border-4 border-white/30 object-cover shadow-lg sm:h-24 sm:w-24"
            />
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white/30 bg-white/10 text-4xl shadow-lg sm:h-24 sm:w-24">
              🏪
            </div>
          )}
          <h1 className="mt-3 text-2xl font-extrabold drop-shadow-md sm:text-3xl">
            {restaurant.nom}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6 pb-16 sm:px-6 sm:py-8">
        {client ? (
          <EspaceClient
            slug={slug}
            couleur={restaurant.couleur}
            animation={restaurant.animation_recompense ?? "rayons"}
            animationCouleur={restaurant.animation_couleur ?? "#FFD700"}
            sections={sections}
            cartes={cartesAffichees}
            recompenses={recompenses.map((r) => ({
              id: r.id,
              carte_id: r.carte_id,
              texte: r.texte,
              image_url: r.image_url,
            }))}
            recompensesEnAttente={recompensesEnAttente}
            notificationsActives={client.notifications_push_actif}
            scanRecent={scanRecent}
            qrClientDataUrl={qrClientDataUrl}
            restaurantId={restaurant.id}
            vapidPublicKey={getVapidPublicKey()}
            tamponRestaurateurOnly={restaurant.tampon_restaurateur_only === true}
            nomCommerce={restaurant.nom}
            identiteClient={client.identite ?? ""}
          />
        ) : (
          <FormulaireInscription
            slug={slug}
            couleur={restaurant.couleur}
            restaurantId={restaurant.id}
            vapidPublicKey={getVapidPublicKey()}
          />
        )}
      </div>
    </main>
    </LangueSourceProvider>
    </LangueProvider>
  );
}
