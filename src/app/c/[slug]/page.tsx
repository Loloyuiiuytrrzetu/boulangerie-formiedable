import { cookies } from "next/headers";
import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { dateDuJourParis } from "@/lib/utils";
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

export const dynamic = "force-dynamic";

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
  const { data: sectionsData } = await admin
    .from("sections")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("ordre", { ascending: true })
    .returns<Section[]>();
  const sections = sectionsData ?? [];

  let cartesAffichees: CarteAffichee[] = [];
  let recompenses: Recompense[] = [];
  let recompensesEnAttente: RecompenseGagnee[] = [];
  let qrClientDataUrl: string | null = null;

  if (client) {
    const aujourdHui = dateDuJourParis();
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
        return {
          id: c.id,
          titre: c.titre,
          tampon_icone: c.tampon_icone,
          nombre_tampons_requis: c.nombre_tampons_requis,
          texte_bas: c.texte_bas,
          date_expiration: c.date_expiration,
          expiree: c.date_expiration !== null && c.date_expiration < aujourdHui,
          tampons_actuels: progression?.tampons_actuels ?? 0,
          recompenses_reclamees: progression?.recompenses_reclamees ?? 0,
          tampon_pris_aujourdhui: progression?.date_dernier_tampon === aujourdHui,
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

  return (
    <main className="min-h-screen bg-white">
      <header
        className="relative overflow-hidden px-6 pb-24 pt-10 text-center text-white sm:pb-32"
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
            <div className="absolute inset-0 bg-black/30" />
          </>
        )}
        <div className="relative">
          {restaurant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={restaurant.logo_url}
              alt={`Logo de ${restaurant.nom}`}
              className="mx-auto h-24 w-24 rounded-2xl border-4 border-white/30 object-cover shadow-lg"
            />
          ) : (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white/30 bg-white/10 text-4xl shadow-lg">
              🏪
            </div>
          )}
          <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">
            {restaurant.nom}
          </h1>
        </div>
      </header>

      <div className="mx-auto -mt-16 max-w-2xl px-4 pb-16 sm:-mt-20 sm:px-6">
        {client ? (
          <EspaceClient
            slug={slug}
            couleur={restaurant.couleur}
            animation={restaurant.animation_recompense ?? "confettis"}
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
          />
        ) : (
          <FormulaireInscription slug={slug} couleur={restaurant.couleur} />
        )}
      </div>
    </main>
  );
}
