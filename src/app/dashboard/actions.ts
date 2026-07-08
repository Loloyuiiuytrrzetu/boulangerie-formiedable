"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TAMPON_ICONES } from "@/lib/icons";
import { slugify } from "@/lib/utils";

// Déconnexion manuelle du restaurateur
export async function deconnexion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Récupère l'utilisateur connecté + son restaurant (garde-fou commun)
async function restaurantCourant() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  return { supabase, user, restaurant };
}

// Upload d'une image dans le bucket public "logos"
async function uploaderImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  restaurantId: string,
  fichier: File,
  prefixe: string
): Promise<{ url?: string; erreur?: string }> {
  if (fichier.size > 4 * 1024 * 1024)
    return { erreur: "L'image ne doit pas dépasser 4 Mo." };
  if (!fichier.type.startsWith("image/"))
    return { erreur: "Le fichier doit être une image." };

  const extension = fichier.name.split(".").pop()?.toLowerCase() ?? "png";
  const chemin = `${restaurantId}/${prefixe}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from("logos")
    .upload(chemin, fichier, { upsert: true, contentType: fichier.type });
  if (error) return { erreur: "Échec de l'envoi de l'image." };

  const { data } = supabase.storage.from("logos").getPublicUrl(chemin);
  return { url: data.publicUrl };
}

// Création du commerce (premier passage sur le dashboard sans restaurant)
export async function creerRestaurant(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nom = String(formData.get("nom") ?? "").trim();
  if (!nom) return { erreur: "Le nom du commerce est obligatoire." };

  let slug = slugify(nom);
  const { data: existant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existant) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { error } = await supabase.from("restaurants").insert({
    owner_id: user.id,
    nom,
    slug,
  });
  if (error) return { erreur: "Impossible de créer le commerce." };

  revalidatePath("/dashboard");
  return { ok: true };
}

// --- Identité du commerce : nom, logo, image de fond, couleur ---
export async function mettreAJourConfig(formData: FormData) {
  const { supabase, user, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const nom = String(formData.get("nom") ?? "").trim();
  const couleur = String(formData.get("couleur") ?? "#7A1E2E");
  const couleurQr = String(formData.get("couleur_qr") ?? "#380b15");

  if (!nom) return { erreur: "Le nom du commerce est obligatoire." };
  if (!/^#[0-9a-fA-F]{6}$/.test(couleur)) return { erreur: "Couleur invalide." };
  if (!/^#[0-9a-fA-F]{6}$/.test(couleurQr))
    return { erreur: "Couleur du QR code invalide." };

  const maj: Record<string, string> = { nom, couleur, couleur_qr: couleurQr };

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const resultat = await uploaderImage(supabase, restaurant.id, logo, "logo");
    if (resultat.erreur) return { erreur: resultat.erreur };
    maj.logo_url = resultat.url!;
  }

  const fond = formData.get("fond");
  if (fond instanceof File && fond.size > 0) {
    const resultat = await uploaderImage(supabase, restaurant.id, fond, "fond");
    if (resultat.erreur) return { erreur: resultat.erreur };
    maj.fond_url = resultat.url!;
  }

  const { error } = await supabase
    .from("restaurants")
    .update(maj)
    .eq("id", restaurant.id)
    .eq("owner_id", user.id);
  if (error) return { erreur: "Échec de l'enregistrement." };

  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return { ok: true };
}

// --- Validation commune des champs d'une carte ---
function validerCarte(formData: FormData) {
  const titre = String(formData.get("titre") ?? "").trim();
  const tamponIcone = String(formData.get("tampon_icone") ?? "cafe");
  const nombreTampons = parseInt(String(formData.get("nombre_tampons_requis") ?? "10"), 10);
  const texteBas = String(formData.get("texte_bas") ?? "").trim();
  const dateExpiration = String(formData.get("date_expiration") ?? "").trim();

  if (!titre) return { erreur: "Le titre de la carte est obligatoire." as const };
  if (!TAMPON_ICONES[tamponIcone]) return { erreur: "Icône de tampon invalide." as const };
  if (!Number.isInteger(nombreTampons) || nombreTampons < 1 || nombreTampons > 20)
    return { erreur: "Le nombre de tampons doit être entre 1 et 20." as const };
  if (dateExpiration && !/^\d{4}-\d{2}-\d{2}$/.test(dateExpiration))
    return { erreur: "Date d'expiration invalide." as const };

  return {
    valeurs: {
      titre,
      tampon_icone: tamponIcone,
      nombre_tampons_requis: nombreTampons,
      texte_bas: texteBas || null,
      date_expiration: dateExpiration || null,
    },
  };
}

// --- Créer une carte de fidélité ---
export async function creerCarte(formData: FormData) {
  const { supabase, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const v = validerCarte(formData);
  if ("erreur" in v) return { erreur: v.erreur };

  const { error } = await supabase
    .from("cartes")
    .insert({ restaurant_id: restaurant.id, ...v.valeurs });
  if (error) return { erreur: "Impossible de créer la carte." };

  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return { ok: true };
}

// --- Modifier une carte de fidélité ---
export async function mettreAJourCarte(carteId: string, formData: FormData) {
  const { supabase, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const v = validerCarte(formData);
  if ("erreur" in v) return { erreur: v.erreur };

  const { error } = await supabase
    .from("cartes")
    .update(v.valeurs)
    .eq("id", carteId)
    .eq("restaurant_id", restaurant.id);
  if (error) return { erreur: "Échec de l'enregistrement de la carte." };

  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return { ok: true };
}

// --- Supprimer une carte (et ses récompenses / progressions clients) ---
export async function supprimerCarte(carteId: string) {
  const { supabase, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const { error } = await supabase
    .from("cartes")
    .delete()
    .eq("id", carteId)
    .eq("restaurant_id", restaurant.id);
  if (error) return { erreur: "Échec de la suppression." };

  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return { ok: true };
}

// --- Ajouter une récompense à une carte (image optionnelle) ---
export async function ajouterRecompense(carteId: string, formData: FormData) {
  const { supabase, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const texte = String(formData.get("texte") ?? "").trim();
  if (!texte) return { erreur: "Le texte de la récompense est obligatoire." };

  // vérifie que la carte appartient bien à ce restaurant
  const { data: carte } = await supabase
    .from("cartes")
    .select("id")
    .eq("id", carteId)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  if (!carte) return { erreur: "Carte introuvable." };

  let imageUrl: string | null = null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    const resultat = await uploaderImage(supabase, restaurant.id, image, "recompense");
    if (resultat.erreur) return { erreur: resultat.erreur };
    imageUrl = resultat.url!;
  }

  const { error } = await supabase.from("recompenses").insert({
    carte_id: carteId,
    restaurant_id: restaurant.id,
    texte,
    image_url: imageUrl,
  });
  if (error) return { erreur: "Impossible d'ajouter la récompense." };

  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return { ok: true };
}

// --- Ajouter / remplacer l'image d'une récompense existante ---
export async function mettreAJourImageRecompense(
  recompenseId: string,
  formData: FormData
) {
  const { supabase, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0)
    return { erreur: "Choisissez une image." };

  const resultat = await uploaderImage(supabase, restaurant.id, image, "recompense");
  if (resultat.erreur) return { erreur: resultat.erreur };

  const { error } = await supabase
    .from("recompenses")
    .update({ image_url: resultat.url })
    .eq("id", recompenseId)
    .eq("restaurant_id", restaurant.id);
  if (error) return { erreur: "Échec de la mise à jour de l'image." };

  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return { ok: true };
}

// --- Retirer l'image d'une récompense ---
export async function retirerImageRecompense(recompenseId: string) {
  const { supabase, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const { error } = await supabase
    .from("recompenses")
    .update({ image_url: null })
    .eq("id", recompenseId)
    .eq("restaurant_id", restaurant.id);
  if (error) return { erreur: "Échec de la mise à jour." };

  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return { ok: true };
}

// --- Supprimer une récompense ---
export async function supprimerRecompense(recompenseId: string) {
  const { supabase, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const { error } = await supabase
    .from("recompenses")
    .delete()
    .eq("id", recompenseId)
    .eq("restaurant_id", restaurant.id);
  if (error) return { erreur: "Échec de la suppression." };

  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return { ok: true };
}
