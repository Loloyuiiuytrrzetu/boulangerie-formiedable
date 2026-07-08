"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { dateDuJourParis, genererToken, normaliserTelephone } from "@/lib/utils";
import type { Carte, CarteClient, ClientFidelite, Restaurant } from "@/lib/types";

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

  // Pas de revalidatePath ici : poser le cookie re-rend déjà la page.
  return { ok: true };
}

// Charge la carte + la progression du client, avec les garde-fous communs
async function contexteCarte(slug: string, carteId: string) {
  const restaurant = await chargerRestaurant(slug);
  if (!restaurant) return { erreur: "Commerce introuvable." as const };

  const client = await chargerClientViaCookie(restaurant);
  if (!client)
    return { erreur: "Carte introuvable. Entrez votre numéro de téléphone." as const };

  const admin = createAdminClient();
  const { data: carte } = await admin
    .from("cartes")
    .select("*")
    .eq("id", carteId)
    .eq("restaurant_id", restaurant.id)
    .eq("actif", true)
    .maybeSingle<Carte>();
  if (!carte) return { erreur: "Cette carte n'existe plus." as const };

  const aujourdHui = dateDuJourParis();
  if (carte.date_expiration && carte.date_expiration < aujourdHui)
    return { erreur: "Cette carte a expiré." as const };

  const { data: progression } = await admin
    .from("cartes_clients")
    .select("*")
    .eq("carte_id", carte.id)
    .eq("client_id", client.id)
    .maybeSingle<CarteClient>();

  return { admin, restaurant, client, carte, progression, aujourdHui };
}

// --- Auto-attribution d'un tampon : 1 maximum par jour et par carte ---
export async function ajouterTampon(slug: string, carteId: string) {
  const ctx = await contexteCarte(slug, carteId);
  if ("erreur" in ctx) return { erreur: ctx.erreur };
  const { admin, restaurant, client, carte, progression, aujourdHui } = ctx;

  if (progression) {
    if (progression.date_dernier_tampon === aujourdHui)
      return { erreur: "Vous avez déjà pris votre tampon aujourd'hui sur cette carte. À demain !" };
    if (progression.tampons_actuels >= carte.nombre_tampons_requis)
      return { erreur: "Cette carte est pleine : réclamez d'abord votre récompense !" };

    // Mise à jour conditionnelle : la date du jour est revérifiée en base
    // pour empêcher un double tampon (double clic, deux onglets…).
    const { data: majs, error } = await admin
      .from("cartes_clients")
      .update({
        tampons_actuels: progression.tampons_actuels + 1,
        tampons_total: progression.tampons_total + 1,
        date_dernier_tampon: aujourdHui,
      })
      .eq("id", progression.id)
      .lt("tampons_actuels", carte.nombre_tampons_requis)
      .or(`date_dernier_tampon.is.null,date_dernier_tampon.neq.${aujourdHui}`)
      .select("id");
    if (error || !majs?.length) return { erreur: "Tampon déjà pris aujourd'hui." };
  } else {
    // Premier tampon du client sur cette carte
    const { error } = await admin.from("cartes_clients").insert({
      carte_id: carte.id,
      client_id: client.id,
      tampons_actuels: 1,
      tampons_total: 1,
      date_dernier_tampon: aujourdHui,
    });
    if (error) return { erreur: "Tampon déjà pris aujourd'hui." };
  }

  // Compteur global du client (statistiques dashboard / super admin)
  await admin
    .from("clients_fidelite")
    .update({
      tampons_total: client.tampons_total + 1,
      date_dernier_tampon: aujourdHui,
    })
    .eq("id", client.id);

  revalidatePath(`/c/${slug}`);
  return { ok: true };
}

// --- Réclamation de la récompense : remise à zéro des tampons de la carte ---
export async function reclamerRecompense(slug: string, carteId: string) {
  const ctx = await contexteCarte(slug, carteId);
  if ("erreur" in ctx) return { erreur: ctx.erreur };
  const { admin, client, carte, progression } = ctx;

  if (!progression || progression.tampons_actuels < carte.nombre_tampons_requis)
    return { erreur: "Cette carte n'est pas encore pleine." };

  const { data: majs, error } = await admin
    .from("cartes_clients")
    .update({
      tampons_actuels: 0,
      recompenses_reclamees: progression.recompenses_reclamees + 1,
    })
    .eq("id", progression.id)
    .gte("tampons_actuels", carte.nombre_tampons_requis)
    .select("id");
  if (error || !majs?.length) return { erreur: "Récompense déjà réclamée." };

  await admin
    .from("clients_fidelite")
    .update({ recompenses_reclamees: client.recompenses_reclamees + 1 })
    .eq("id", client.id);

  // Textes des récompenses de la carte, pour le message de confirmation
  const { data: recompenses } = await admin
    .from("recompenses")
    .select("texte")
    .eq("carte_id", carte.id);
  const texte =
    recompenses?.map((r) => r.texte).join(" + ") || "votre récompense";

  revalidatePath(`/c/${slug}`);
  return { ok: true, recompense: texte };
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
