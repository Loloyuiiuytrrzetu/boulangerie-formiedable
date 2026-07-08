import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { dateDuJourParis } from "@/lib/utils";
import type { Carte, CarteClient, ClientFidelite, Recompense, Restaurant } from "@/lib/types";
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

  // Reconnaissance automatique via le cookie posé à l'inscription
  const cookieStore = await cookies();
  const token = cookieStore.get(`fid_${restaurant.id}`)?.value;

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

  // Cartes actives, récompenses et progression du client
  let cartesAffichees: CarteAffichee[] = [];
  let recompenses: Recompense[] = [];
  if (client) {
    const aujourdHui = dateDuJourParis();
    const [resCartes, resRecompenses, resProgressions] = await Promise.all([
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
    ]);

    const cartes = (resCartes.data as Carte[]) ?? [];
    recompenses = (resRecompenses.data as Recompense[]) ?? [];
    const progressions = (resProgressions.data as CarteClient[]) ?? [];

    cartesAffichees = cartes
      // une carte expirée sans tampon accumulé est masquée
      .filter((c) => {
        const expiree = c.date_expiration !== null && c.date_expiration < aujourdHui;
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
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Bandeau : image de fond en priorité, sinon couleur pleine */}
      <header
        className="relative overflow-hidden px-6 pb-16 pt-10 text-center text-white"
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
            {/* léger voile pour garantir la lisibilité du nom en blanc */}
            <div className="absolute inset-0 bg-black/25" />
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
          <h1 className="mt-4 text-2xl font-extrabold">{restaurant.nom}</h1>
          <p className="mt-1 text-sm opacity-80">Carte de fidélité</p>
        </div>
      </header>

      <div className="mx-auto -mt-10 max-w-md px-4 pb-16">
        {client ? (
          <EspaceClient
            slug={slug}
            couleur={restaurant.couleur}
            cartes={cartesAffichees}
            recompenses={recompenses.map((r) => ({
              id: r.id,
              carte_id: r.carte_id,
              texte: r.texte,
              image_url: r.image_url,
            }))}
            notificationsActives={client.notifications_push_actif}
          />
        ) : (
          <FormulaireInscription slug={slug} couleur={restaurant.couleur} />
        )}
      </div>
    </main>
  );
}
