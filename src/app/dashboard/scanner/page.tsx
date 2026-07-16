import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Carte } from "@/lib/types";
import type { Langue } from "@/lib/i18n";
import { ScannerPageClient } from "./ScannerPageClient";
import type { TamponRecent } from "./DerniersTampons";

export const dynamic = "force-dynamic";

// Accessible au restaurateur ET à son sous-compte.
// Attribue manuellement N tampons à un client :
//   - par téléphone (saisie manuelle)
//   - ou automatiquement via ?c=<token> venant du QR code du client
export default async function Scanner({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: restoOwn } = await admin
    .from("restaurants")
    .select("id, nom, slug, langue, timezone")
    .eq("owner_id", user.id)
    .maybeSingle();
  let restaurant = restoOwn;
  let sousCompte = false;
  if (!restaurant) {
    const { data: sc } = await admin
      .from("sous_comptes")
      .select("restaurant_id")
      .eq("user_id", user.id)
      .eq("actif", true)
      .maybeSingle();
    if (sc) {
      const { data: r } = await admin
        .from("restaurants")
        .select("id, nom, slug, langue, timezone")
        .eq("id", sc.restaurant_id)
        .maybeSingle();
      restaurant = r;
      sousCompte = true;
    }
  }
  if (!restaurant) redirect("/login");

  const { data: cartes } = await admin
    .from("cartes")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("actif", true)
    .order("created_at", { ascending: true })
    .returns<Carte[]>();

  // Si un token client est passé (venant d'un scan de QR), on pré-charge
  // ses infos pour éviter d'avoir à retaper son téléphone.
  const { c: tokenClient } = await searchParams;
  let clientPrecharge: { telephone: string; identite: string | null } | null = null;
  if (tokenClient) {
    const { data: cli } = await admin
      .from("clients_fidelite")
      .select("numero_telephone, identite, restaurant_id")
      .eq("token_public", tokenClient)
      .maybeSingle();
    if (cli && cli.restaurant_id === restaurant.id) {
      clientPrecharge = { telephone: cli.numero_telephone, identite: cli.identite };
    }
  }

  // Derniers tampons donnés (pour vérifier rapidement à qui on vient de
  // donner des tampons). On récupère les 12 dernières attributions puis on
  // complète avec le nom/téléphone du client et le titre de la carte.
  const { data: histo } = await admin
    .from("tampons_historique")
    .select("id, nombre, created_at, client_id, carte_id")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const recents: TamponRecent[] = [];
  if (histo && histo.length > 0) {
    const clientIds = [
      ...new Set(histo.map((h) => h.client_id).filter(Boolean)),
    ] as string[];
    const carteIds = [
      ...new Set(histo.map((h) => h.carte_id).filter(Boolean)),
    ] as string[];
    const [resClients, resCartes] = await Promise.all([
      clientIds.length
        ? admin
            .from("clients_fidelite")
            .select("id, identite, numero_telephone")
            .in("id", clientIds)
        : Promise.resolve({ data: [] as { id: string; identite: string | null; numero_telephone: string }[] }),
      carteIds.length
        ? admin.from("cartes").select("id, titre").in("id", carteIds)
        : Promise.resolve({ data: [] as { id: string; titre: string }[] }),
    ]);
    const mapClient = new Map(
      ((resClients.data as { id: string; identite: string | null; numero_telephone: string }[]) ?? []).map((c) => [c.id, c])
    );
    const mapCarte = new Map(
      ((resCartes.data as { id: string; titre: string }[]) ?? []).map((c) => [c.id, c])
    );
    for (const h of histo) {
      const cli = h.client_id ? mapClient.get(h.client_id) : undefined;
      const carte = h.carte_id ? mapCarte.get(h.carte_id) : undefined;
      recents.push({
        id: h.id,
        identite: cli?.identite ?? null,
        telephone: cli?.numero_telephone ?? null,
        carteTitre: carte?.titre ?? null,
        nombre: h.nombre,
        created_at: h.created_at,
      });
    }
  }

  const langue = ((restaurant as { langue?: string }).langue ?? "fr") as Langue;
  const timezone = (restaurant as { timezone?: string }).timezone ?? "Europe/Paris";

  return (
    <ScannerPageClient
      langueInitiale={langue}
      sousCompte={sousCompte}
      estRestaurateur={!sousCompte}
      nomCommerce={restaurant.nom}
      timezone={timezone}
      cartes={cartes ?? []}
      clientIdentifie={Boolean(clientPrecharge)}
      telephonePrecharge={clientPrecharge?.telephone ?? ""}
      identitePrecharge={clientPrecharge?.identite ?? null}
      recents={recents}
    />
  );
}
