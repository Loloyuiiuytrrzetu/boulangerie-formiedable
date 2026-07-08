"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { dateDuJourParis, genererToken, normaliserTelephone } from "@/lib/utils";
import type { ClientFidelite, Restaurant } from "@/lib/types";

// Toutes ces actions concernent des clients NON authentifiés :
// elles s'exécutent côté serveur avec la clé service_role, et le client
// est identifié par un token opaque stocké dans un cookie httpOnly.

const UN_AN = 60 * 60 * 24 * 365;

function nomCookie(restaurantId: string) {
  return `fid_${restaurantId}`;
}

async function chargerRestaurant(slug: string): Promise<Restaurant | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("actif", true)
    .maybeSingle<Restaurant>();
  return data;
}

async function chargerClientViaCookie(
  restaurant: Restaurant
): Promise<ClientFidelite | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(nomCookie(restaurant.id))?.value;
  if (!token) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("clients_fidelite")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("token_cookie", token)
    .maybeSingle<ClientFidelite>();
  return data;
}

// --- Première visite : création de la fiche avec le numéro de téléphone ---
export async function inscrireClient(slug: string, formData: FormData) {
  const restaurant = await chargerRestaurant(slug);
  if (!restaurant) return { erreur: "Commerce introuvable." };

  const telephone = normaliserTelephone(String(formData.get("telephone") ?? ""));
  if (!telephone)
    return { erreur: "Numéro de téléphone invalide (format attendu : 06 12 34 56 78)." };

  const admin = createAdminClient();

  // Si le numéro existe déjà pour ce commerce, on retrouve la fiche
  // (client qui a changé de téléphone/navigateur) au lieu d'en créer une.
  const { data: existant } = await admin
    .from("clients_fidelite")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("numero_telephone", telephone)
    .maybeSingle<ClientFidelite>();

  let token: string;
  if (existant) {
    token = existant.token_cookie;
  } else {
    token = genererToken();
    const { error } = await admin.from("clients_fidelite").insert({
      restaurant_id: restaurant.id,
      numero_telephone: telephone,
      token_cookie: token,
    });
    if (error) return { erreur: "Impossible de créer votre carte. Réessayez." };
  }

  const cookieStore = await cookies();
  cookieStore.set(nomCookie(restaurant.id), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: UN_AN,
    path: "/",
  });

  // Pas de revalidatePath ici : le composant affiche d'abord la proposition
  // de notifications, puis rafraîchit lui-même la page (router.refresh()).
  return { ok: true };
}

// --- Auto-attribution d'un tampon : 1 maximum par jour ---
export async function ajouterTampon(slug: string) {
  const restaurant = await chargerRestaurant(slug);
  if (!restaurant) return { erreur: "Commerce introuvable." };

  const client = await chargerClientViaCookie(restaurant);
  if (!client) return { erreur: "Carte introuvable. Entrez votre numéro de téléphone." };

  const aujourdHui = dateDuJourParis();
  if (client.date_dernier_tampon === aujourdHui)
    return { erreur: "Vous avez déjà pris votre tampon aujourd'hui. À demain !" };

  if (client.tampons_actuels >= restaurant.nombre_tampons_requis)
    return { erreur: "Votre carte est pleine : réclamez d'abord votre récompense !" };

  const admin = createAdminClient();
  // Mise à jour conditionnelle : la date du jour est revérifiée en base
  // pour empêcher un double tampon (double clic, deux onglets…).
  const { data: majs, error } = await admin
    .from("clients_fidelite")
    .update({
      tampons_actuels: client.tampons_actuels + 1,
      tampons_total: client.tampons_total + 1,
      date_dernier_tampon: aujourdHui,
    })
    .eq("id", client.id)
    .lt("tampons_actuels", restaurant.nombre_tampons_requis)
    .or(`date_dernier_tampon.is.null,date_dernier_tampon.neq.${aujourdHui}`)
    .select("id");

  if (error || !majs?.length)
    return { erreur: "Tampon déjà pris aujourd'hui." };

  revalidatePath(`/c/${slug}`);
  return { ok: true };
}

// --- Réclamation de la récompense : remise à zéro des tampons ---
export async function reclamerRecompense(slug: string) {
  const restaurant = await chargerRestaurant(slug);
  if (!restaurant) return { erreur: "Commerce introuvable." };

  const client = await chargerClientViaCookie(restaurant);
  if (!client) return { erreur: "Carte introuvable." };

  if (client.tampons_actuels < restaurant.nombre_tampons_requis)
    return { erreur: "Votre carte n'est pas encore pleine." };

  const admin = createAdminClient();
  const { data: majs, error } = await admin
    .from("clients_fidelite")
    .update({
      tampons_actuels: 0,
      recompenses_reclamees: client.recompenses_reclamees + 1,
    })
    .eq("id", client.id)
    .gte("tampons_actuels", restaurant.nombre_tampons_requis)
    .select("id");

  if (error || !majs?.length) return { erreur: "Récompense déjà réclamée." };

  revalidatePath(`/c/${slug}`);
  return { ok: true, recompense: restaurant.texte_recompense };
}

// --- Activation (optionnelle) des notifications : simple préférence ---
export async function activerNotifications(slug: string, actif: boolean) {
  const restaurant = await chargerRestaurant(slug);
  if (!restaurant) return { erreur: "Commerce introuvable." };

  const client = await chargerClientViaCookie(restaurant);
  if (!client) return { erreur: "Carte introuvable." };

  const admin = createAdminClient();
  await admin
    .from("clients_fidelite")
    .update({ notifications_push_actif: actif })
    .eq("id", client.id);

  revalidatePath(`/c/${slug}`);
  return { ok: true };
}
