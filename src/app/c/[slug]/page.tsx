import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { dateDuJourParis } from "@/lib/utils";
import type { ClientFidelite, Restaurant } from "@/lib/types";
import { CarteFidelite } from "./CarteFidelite";
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

  return (
    <main className="min-h-screen bg-white">
      {/* Bandeau aux couleurs du commerce */}
      <header
        className="px-6 pb-16 pt-10 text-center text-white"
        style={{ backgroundColor: restaurant.couleur }}
      >
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
      </header>

      <div className="mx-auto -mt-10 max-w-md px-4 pb-16">
        {client ? (
          <CarteFidelite
            slug={slug}
            restaurant={{
              couleur: restaurant.couleur,
              tampon_icone: restaurant.tampon_icone,
              nombre_tampons_requis: restaurant.nombre_tampons_requis,
              texte_recompense: restaurant.texte_recompense,
            }}
            client={{
              tampons_actuels: client.tampons_actuels,
              recompenses_reclamees: client.recompenses_reclamees,
              notifications_push_actif: client.notifications_push_actif,
              tampon_pris_aujourdhui:
                client.date_dernier_tampon === dateDuJourParis(),
            }}
          />
        ) : (
          <FormulaireInscription slug={slug} couleur={restaurant.couleur} />
        )}
      </div>
    </main>
  );
}
