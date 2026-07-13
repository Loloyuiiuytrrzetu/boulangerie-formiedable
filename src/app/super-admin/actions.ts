"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { TIMEZONES_VALIDES } from "@/lib/timezones";

// Traduit les messages d'erreur Supabase Auth en français.
function traduireErreurAuth(message: string | undefined): string {
  if (!message) return "erreur inconnue.";
  const m = message.toLowerCase();
  if (m.includes("already been registered") || m.includes("already registered"))
    return "cet email est déjà utilisé par un autre compte.";
  if (m.includes("invalid email")) return "email invalide.";
  if (m.includes("password should be at least"))
    return "mot de passe trop court (8 caractères minimum).";
  if (m.includes("weak password"))
    return "mot de passe trop faible. Utilisez au moins 8 caractères.";
  if (m.includes("rate limit"))
    return "trop de tentatives. Réessayez dans quelques minutes.";
  return message;
}

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

  // Récupère ou crée l'utilisateur auth. Si un utilisateur avec cet email
  // existe déjà mais qu'il n'a pas de restaurant associé (échec de tentative
  // précédente), on réutilise son compte au lieu d'échouer.
  let userId: string | null = null;
  const { data: nouvelUtilisateur, error: erreurAuth } =
    await admin.auth.admin.createUser({
      email,
      password: motDePasse,
      email_confirm: true,
      app_metadata: { role: "restaurateur" },
    });

  if (nouvelUtilisateur?.user) {
    userId = nouvelUtilisateur.user.id;
  } else if (erreurAuth?.message?.toLowerCase().includes("already been registered")) {
    // Cherche l'utilisateur existant et vérifie qu'il n'a pas déjà un restaurant
    const { data: liste } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existant = liste?.users?.find((u) => u.email?.toLowerCase() === email);
    if (!existant) return { erreur: "Utilisateur existant introuvable." };
    const { data: restoExistant } = await admin
      .from("restaurants")
      .select("id")
      .eq("owner_id", existant.id)
      .maybeSingle();
    if (restoExistant)
      return { erreur: "Cet email est déjà utilisé par un autre commerce." };
    // Orphelin : on réinitialise son mot de passe et on continue
    await admin.auth.admin.updateUserById(existant.id, {
      password: motDePasse,
      email_confirm: true,
      app_metadata: { role: "restaurateur" },
    });
    userId = existant.id;
  } else {
    return {
      erreur: `Création du compte impossible : ${traduireErreurAuth(erreurAuth?.message)}`,
    };
  }

  // Slug unique pour la page publique
  let slug = slugify(nomCommerce);
  const { data: existant } = await admin
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existant) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { error: erreurResto } = await admin.from("restaurants").insert({
    owner_id: userId,
    nom: nomCommerce,
    slug,
    timezone,
    animation_recompense: "etoiles",
  });
  if (erreurResto) {
    // Rollback : supprime l'utilisateur auth qu'on vient de créer pour
    // qu'il puisse retenter avec le même email.
    if (nouvelUtilisateur?.user) {
      await admin.auth.admin.deleteUser(nouvelUtilisateur.user.id);
    }
    return {
      erreur: `Échec de la création du commerce : ${erreurResto.message}`,
    };
  }

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
