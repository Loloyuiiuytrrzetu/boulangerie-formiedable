"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TamponRecent } from "./DerniersTampons";

const TAMPONS_PAR_PAGE = 12;

// Résout le restaurant de l'utilisateur connecté : soit propriétaire, soit
// sous-compte actif. Renvoie null si aucun.
async function restaurantDeLUtilisateur(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data: own } = await admin
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (own) return own.id as string;
  const { data: sc } = await admin
    .from("sous_comptes")
    .select("restaurant_id")
    .eq("user_id", user.id)
    .eq("actif", true)
    .maybeSingle();
  return (sc?.restaurant_id as string) ?? null;
}

// Liste paginée des tampons donnés (les plus récents d'abord), avec le nom /
// téléphone du client et le titre de la carte. Rappelée quand l'utilisateur
// change de page dans « Derniers tampons donnés ».
export async function listerTamponsRecents(page: number) {
  const restaurantId = await restaurantDeLUtilisateur();
  if (!restaurantId) return { erreur: "Aucun commerce." as const };

  const p = Math.max(0, Math.floor(Number(page)) || 0);
  const from = p * TAMPONS_PAR_PAGE;
  const to = from + TAMPONS_PAR_PAGE - 1;

  const admin = createAdminClient();
  const { data: histo, count } = await admin
    .from("tampons_historique")
    .select("id, nombre, created_at, client_id, carte_id", { count: "exact" })
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .range(from, to);

  const tampons: TamponRecent[] = [];
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
      tampons.push({
        id: h.id,
        identite: cli?.identite ?? null,
        telephone: cli?.numero_telephone ?? null,
        carteTitre: carte?.titre ?? null,
        nombre: h.nombre,
        created_at: h.created_at,
      });
    }
  }

  return {
    ok: true as const,
    tampons,
    total: count ?? 0,
    page: p,
    parPage: TAMPONS_PAR_PAGE,
  };
}
