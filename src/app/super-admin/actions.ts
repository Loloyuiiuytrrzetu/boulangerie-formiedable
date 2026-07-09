"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { TIMEZONES_VALIDES } from "@/lib/timezones";

// Garde-fou commun : chaque action vérifie côté serveur que l'appelant
// est bien connecté ET possède le rôle super_admin avant d'utiliser
// la clé service_role.
async function exigerSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profil?.role !== "super_admin") redirect("/dashboard");
}

// --- Créer un compte restaurateur + son commerce ---
export async function creerRestaurateur(formData: FormData) {
  await exigerSuperAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const motDePasse = String(formData.get("mot_de_passe") ?? "");
  const nomCommerce = String(formData.get("nom_commerce") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "Europe/Paris");

  if (!email || !motDePasse || !nomCommerce)
    return { erreur: "Tous les champs sont obligatoires." };
  if (motDePasse.length < 8)
    return { erreur: "Le mot de passe doit contenir au moins 8 caractères." };
  if (!TIMEZONES_VALIDES.has(timezone))
    return { erreur: "Région / fuseau horaire invalide." };

  const admin = createAdminClient();

  const { data: nouvelUtilisateur, error: erreurAuth } =
    await admin.auth.admin.createUser({
      email,
      password: motDePasse,
      email_confirm: true,
      app_metadata: { role: "restaurateur" },
    });
  if (erreurAuth || !nouvelUtilisateur.user)
    return { erreur: `Création du compte impossible : ${erreurAuth?.message}` };

  // Slug unique pour la page publique
  let slug = slugify(nomCommerce);
  const { data: existant } = await admin
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existant) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { error: erreurResto } = await admin.from("restaurants").insert({
    owner_id: nouvelUtilisateur.user.id,
    nom: nomCommerce,
    slug,
    timezone,
  });
  if (erreurResto)
    return { erreur: "Compte créé mais échec de la création du commerce." };

  revalidatePath("/super-admin");
  return { ok: true };
}

// --- Modifier le mot de passe d'un restaurateur (support) ---
export async function changerMotDePasse(formData: FormData) {
  await exigerSuperAdmin();

  const ownerId = String(formData.get("owner_id") ?? "");
  const motDePasse = String(formData.get("mot_de_passe") ?? "");
  if (!ownerId || motDePasse.length < 8)
    return { erreur: "Mot de passe trop court (8 caractères minimum)." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(ownerId, {
    password: motDePasse,
  });
  if (error) return { erreur: "Échec de la mise à jour du mot de passe." };
  return { ok: true };
}

// --- Activer / désactiver un commerce (coupe l'accès à la page client) ---
export async function basculerActif(restaurantId: string, actif: boolean) {
  await exigerSuperAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("restaurants")
    .update({ actif })
    .eq("id", restaurantId);
  if (error) return { erreur: "Échec de la mise à jour." };

  revalidatePath("/super-admin");
  return { ok: true };
}

// --- Supprimer définitivement un restaurant (et son compte) ---
export async function supprimerRestaurant(restaurantId: string) {
  await exigerSuperAdmin();

  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("owner_id")
    .eq("id", restaurantId)
    .maybeSingle();
  if (!restaurant) return { erreur: "Restaurant introuvable." };

  // Supprimer le compte auth supprime en cascade le profil,
  // le restaurant et toutes ses fiches clients.
  const { error } = await admin.auth.admin.deleteUser(restaurant.owner_id);
  if (error) return { erreur: "Échec de la suppression." };

  revalidatePath("/super-admin");
  return { ok: true };
}

// --- Démarrer une session "voir le commerce" pour le super admin ---
// Pose un cookie httpOnly qui autorise le super admin à naviguer dans
// le dashboard du restaurateur cible sans mot de passe.
export async function voirCommerce(restaurantId: string) {
  await exigerSuperAdmin();

  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("owner_id, nom")
    .eq("id", restaurantId)
    .maybeSingle();
  if (!restaurant) return { erreur: "Restaurant introuvable." };

  const { cookies } = await import("next/headers");
  const store = await cookies();
  store.set("walletiz_impersonate", restaurant.owner_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 4, // 4h
    path: "/",
  });
  store.set("walletiz_impersonate_nom", restaurant.nom, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 4,
    path: "/",
  });

  redirect("/dashboard");
}
