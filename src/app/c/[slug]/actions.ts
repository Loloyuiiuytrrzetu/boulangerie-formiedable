"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { dateDuJour, genererToken, normaliserTelephone } from "@/lib/utils";
import type { Carte, CarteClient, ClientFidelite, Recompense, Restaurant } from "@/lib/types";

// Toutes ces actions concernent des clients NON authentifiés :
// elles s'exécutent côté serveur avec la clé service_role, et le client
// est identifié par un token opaque stocké dans un cookie httpOnly.

const UN_AN = 60 * 60 * 24 * 365;

function nomCookieClient(restaurantId: string) {
  return `fid_${restaurantId}`;
}
function nomCookieScan(restaurantId: string) {
  return `scan_${restaurantId}`;
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
  const token = cookieStore.get(nomCookieClient(restaurant.id))?.value;
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
  const identite = String(formData.get("identite") ?? "").trim().slice(0, 80);
  if (!identite) return { erreur: "Entrez au moins un nom ou un prénom." };

  const admin = createAdminClient();

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
      identite,
      token_cookie: token,
    });
    if (error) return { erreur: "Impossible de créer votre carte. Réessayez." };
  }

  const cookieStore = await cookies();
  cookieStore.set(nomCookieClient(restaurant.id), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: UN_AN,
    path: "/",
  });

  return { ok: true };
}

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

  const aujourdHui = dateDuJour(restaurant.timezone ?? "Europe/Paris");
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

// --- Auto-attribution d'un tampon : scan strict + 1/jour ---
export async function ajouterTampon(slug: string, carteId: string) {
  const ctx = await contexteCarte(slug, carteId);
  if ("erreur" in ctx) return { erreur: ctx.erreur };
  const { admin, restaurant, client, carte, progression, aujourdHui } = ctx;

  // Mode anti-fraude : seul le restaurateur peut attribuer les tampons
  // (via son scanner). Le bouton client est désactivé côté UI mais on
  // re-vérifie ici pour empêcher tout appel direct à l'API.
  if (restaurant.tampon_restaurateur_only === true) {
    return {
      erreur:
        "Demandez au commerçant de scanner votre QR code personnel pour recevoir votre tampon.",
    };
  }

  // Scan strict : le cookie n'est posé qu'en passant par /scan/[slug]
  // (via le QR code). Sans lui — page laissée ouverte, favori… —
  // impossible de prendre un tampon.
  const cookieStore = await cookies();
  if (!cookieStore.get(nomCookieScan(restaurant.id))) {
    return {
      erreur:
        "Scannez le QR code affiché en caisse pour prendre votre tampon 📷",
    };
  }

  // Règle "1 tampon toutes cartes confondues par jour" si option décochée
  if (restaurant.tampon_par_carte === false && client.date_dernier_tampon === aujourdHui)
    return {
      erreur: "Vous avez déjà pris votre tampon du jour. À bientôt !",
    };

  if (progression) {
    if (progression.date_dernier_tampon === aujourdHui)
      return { erreur: "Vous avez déjà pris votre tampon aujourd'hui sur cette carte." };
    if (progression.tampons_actuels >= carte.nombre_tampons_requis)
      return { erreur: "Carte pleine : choisissez d'abord votre récompense !" };

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
    const { error } = await admin.from("cartes_clients").insert({
      carte_id: carte.id,
      client_id: client.id,
      tampons_actuels: 1,
      tampons_total: 1,
      date_dernier_tampon: aujourdHui,
    });
    if (error) return { erreur: "Impossible d'ajouter le tampon." };
  }

  await admin
    .from("clients_fidelite")
    .update({
      tampons_total: client.tampons_total + 1,
      date_dernier_tampon: aujourdHui,
    })
    .eq("id", client.id);

  // Journal d'historique pour les graphiques du dashboard
  await admin.from("tampons_historique").insert({
    restaurant_id: restaurant.id,
    carte_id: carte.id,
    client_id: client.id,
    nombre: 1,
    date_attribution: aujourdHui,
  });

  revalidatePath(`/c/${slug}`);
  return { ok: true };
}

// --- La carte est pleine : le client choisit UNE récompense parmi celles
//     proposées. Elle est stockée en "récompense gagnée" (utilisable plus
//     tard), la carte retombe à 0 pour repartir. L'animation est décidée
//     côté client à partir de restaurant.animation_recompense.
export async function choisirRecompense(
  slug: string,
  carteId: string,
  recompenseId: string
) {
  const ctx = await contexteCarte(slug, carteId);
  if ("erreur" in ctx) return { erreur: ctx.erreur };
  const { admin, restaurant, client, carte, progression } = ctx;

  if (!progression || progression.tampons_actuels < carte.nombre_tampons_requis)
    return { erreur: "Cette carte n'est pas encore pleine." };

  const { data: recompense } = await admin
    .from("recompenses")
    .select("*")
    .eq("id", recompenseId)
    .eq("carte_id", carte.id)
    .maybeSingle<Recompense>();
  if (!recompense) return { erreur: "Récompense introuvable." };

  // Reset atomique de la carte
  const { data: majs, error: errMaj } = await admin
    .from("cartes_clients")
    .update({
      tampons_actuels: 0,
      recompenses_reclamees: progression.recompenses_reclamees + 1,
    })
    .eq("id", progression.id)
    .gte("tampons_actuels", carte.nombre_tampons_requis)
    .select("id");
  if (errMaj || !majs?.length) return { erreur: "Récompense déjà choisie." };

  // Crédit dans le portefeuille de récompenses en attente
  await admin.from("recompenses_gagnees").insert({
    carte_id: carte.id,
    client_id: client.id,
    recompense_id: recompense.id,
    texte_recompense: recompense.texte,
    image_url: recompense.image_url,
  });

  await admin
    .from("clients_fidelite")
    .update({ recompenses_reclamees: client.recompenses_reclamees + 1 })
    .eq("id", client.id);

  revalidatePath(`/c/${slug}`);
  return {
    ok: true,
    recompense: recompense.texte,
    animation: restaurant.animation_recompense ?? "rayons",
  };
}

// --- Marquer une récompense en attente comme utilisée ---
export async function utiliserRecompense(slug: string, recompenseGagneeId: string) {
  const restaurant = await chargerRestaurant(slug);
  if (!restaurant) return { erreur: "Commerce introuvable." };

  const client = await chargerClientViaCookie(restaurant);
  if (!client) return { erreur: "Carte introuvable." };

  const admin = createAdminClient();
  const { data: majs, error } = await admin
    .from("recompenses_gagnees")
    .update({ date_utilisee: new Date().toISOString() })
    .eq("id", recompenseGagneeId)
    .eq("client_id", client.id)
    .is("date_utilisee", null)
    .select("id");
  if (error || !majs?.length) return { erreur: "Récompense déjà utilisée." };

  revalidatePath(`/c/${slug}`);
  return { ok: true };
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

// --- Modification du nom / prénom (onglet Info) ---
export async function modifierIdentite(slug: string, formData: FormData) {
  const restaurant = await chargerRestaurant(slug);
  if (!restaurant) return { erreur: "Commerce introuvable." };

  const client = await chargerClientViaCookie(restaurant);
  if (!client) return { erreur: "Carte introuvable." };

  const identite = String(formData.get("identite") ?? "").trim().slice(0, 80);
  if (!identite) return { erreur: "Entrez au moins un nom ou un prénom." };

  const admin = createAdminClient();
  await admin
    .from("clients_fidelite")
    .update({ identite })
    .eq("id", client.id);

  revalidatePath(`/c/${slug}`);
  return { ok: true as const };
}

// --- Désinscription : supprime le compte client complètement.
//     Les tampons, cartes en cours et récompenses en attente sont perdus.
//     Le cookie de reconnaissance est effacé pour que le prochain scan
//     du QR code redémarre comme si c'était la première fois. ---
export async function desinscrireClient(slug: string) {
  const restaurant = await chargerRestaurant(slug);
  if (!restaurant) return { erreur: "Commerce introuvable." };

  const client = await chargerClientViaCookie(restaurant);
  if (!client) return { erreur: "Carte introuvable." };

  const admin = createAdminClient();
  // On supprime le client — les tables liées (cartes_clients,
  // recompenses_gagnees, tampons_historique, push_subscriptions) ont
  // une cascade DELETE sur client_id.
  await admin.from("clients_fidelite").delete().eq("id", client.id);

  // Efface le cookie pour que le prochain scan soit reconnu comme
  // une première visite.
  const cookieStore = await cookies();
  cookieStore.set(nomCookieClient(restaurant.id), "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  revalidatePath(`/c/${slug}`);
  return { ok: true as const };
}
