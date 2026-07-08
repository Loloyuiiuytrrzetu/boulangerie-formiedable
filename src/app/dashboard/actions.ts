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

// Création du commerce (premier passage sur le dashboard sans restaurant)
export async function creerRestaurant(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nom = String(formData.get("nom") ?? "").trim();
  if (!nom) return { erreur: "Le nom du commerce est obligatoire." };

  // Slug unique dérivé du nom (suffixe aléatoire en cas de collision)
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

// Mise à jour de la configuration — champs autorisés UNIQUEMENT :
// nom, logo, couleur, icône de tampon, seuil, texte de récompense
export async function mettreAJourConfig(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, slug, logo_url")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const nom = String(formData.get("nom") ?? "").trim();
  const couleur = String(formData.get("couleur") ?? "#7A1E2E");
  const tamponIcone = String(formData.get("tampon_icone") ?? "cafe");
  const nombreTampons = parseInt(String(formData.get("nombre_tampons_requis") ?? "10"), 10);
  const texteRecompense = String(formData.get("texte_recompense") ?? "").trim();

  if (!nom) return { erreur: "Le nom du commerce est obligatoire." };
  if (!/^#[0-9a-fA-F]{6}$/.test(couleur))
    return { erreur: "Couleur invalide." };
  if (!TAMPON_ICONES[tamponIcone]) return { erreur: "Icône de tampon invalide." };
  if (!Number.isInteger(nombreTampons) || nombreTampons < 1 || nombreTampons > 30)
    return { erreur: "Le nombre de tampons doit être entre 1 et 30." };
  if (!texteRecompense) return { erreur: "Le texte de la récompense est obligatoire." };

  // Upload optionnel du logo dans le bucket public "logos"
  let logoUrl: string | undefined;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    if (logo.size > 4 * 1024 * 1024)
      return { erreur: "Le logo ne doit pas dépasser 4 Mo." };
    if (!logo.type.startsWith("image/"))
      return { erreur: "Le logo doit être une image." };

    const extension = logo.name.split(".").pop()?.toLowerCase() ?? "png";
    const chemin = `${restaurant.id}/logo-${Date.now()}.${extension}`;
    const { error: erreurUpload } = await supabase.storage
      .from("logos")
      .upload(chemin, logo, { upsert: true, contentType: logo.type });
    if (erreurUpload) return { erreur: "Échec de l'envoi du logo." };

    const { data: publique } = supabase.storage.from("logos").getPublicUrl(chemin);
    logoUrl = publique.publicUrl;
  }

  const { error } = await supabase
    .from("restaurants")
    .update({
      nom,
      couleur,
      tampon_icone: tamponIcone,
      nombre_tampons_requis: nombreTampons,
      texte_recompense: texteRecompense,
      ...(logoUrl ? { logo_url: logoUrl } : {}),
    })
    .eq("id", restaurant.id)
    .eq("owner_id", user.id);

  if (error) return { erreur: "Échec de l'enregistrement." };

  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return { ok: true };
}
