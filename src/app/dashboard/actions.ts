"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TAMPON_ICONES } from "@/lib/icons";
import { dateDuJour, slugify } from "@/lib/utils";
import type { CarteClient } from "@/lib/types";
import { utilisateurEffectif } from "@/lib/impersonate";

// Déconnexion manuelle du restaurateur
export async function deconnexion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Récupère l'utilisateur connecté + son restaurant.
// Supporte l'impersonation super admin : les writes utilisent alors le
// client admin (service_role) avec l'owner_id du restaurateur ciblé.
async function restaurantCourant() {
  const effectif = await utilisateurEffectif();
  if (!effectif) redirect("/login");

  const supabase = effectif.impersonation
    ? createAdminClient()
    : await createClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, slug")
    .eq("owner_id", effectif.userId)
    .maybeSingle();

  return {
    supabase,
    user: { id: effectif.userId, email: effectif.email },
    restaurant,
  };
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

  const { data: nouveau, error } = await supabase
    .from("restaurants")
    .insert({ owner_id: user.id, nom, slug })
    .select("id")
    .single();
  if (error || !nouveau) return { erreur: "Impossible de créer le commerce." };

  // Sections par défaut (cartes + info, toutes deux non supprimables)
  const admin = createAdminClient();
  await admin.from("sections").insert([
    {
      restaurant_id: nouveau.id,
      type: "cartes",
      titre: "Cartes de fidélité",
      ordre: 0,
      supprimable: false,
    },
    {
      restaurant_id: nouveau.id,
      type: "info",
      titre: "Info",
      texte:
        "Présentez ce QR code au commerçant à chaque passage pour recevoir vos tampons.",
      ordre: 100,
      supprimable: false,
    },
  ]);

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
  const tamponParCarte = formData.get("tampon_par_carte") === "on";
  const animation = String(formData.get("animation_recompense") ?? "confettis");

  if (!nom) return { erreur: "Le nom du commerce est obligatoire." };
  if (!/^#[0-9a-fA-F]{6}$/.test(couleur)) return { erreur: "Couleur invalide." };
  if (!/^#[0-9a-fA-F]{6}$/.test(couleurQr))
    return { erreur: "Couleur du QR code invalide." };
  if (!["aucune", "etoiles", "ondes", "rayons", "vague"].includes(animation))
    return { erreur: "Animation invalide." };

  const maj: Record<string, string | boolean> = {
    nom,
    couleur,
    couleur_qr: couleurQr,
    tampon_par_carte: tamponParCarte,
    animation_recompense: animation,
  };

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

// ============================================================
// SOUS-COMPTE (1 par restaurateur)
// ============================================================

// Retourne le restaurant du restaurateur courant
async function restaurantDuRestaurateur() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, nom, slug, timezone")
    .eq("owner_id", user.id)
    .maybeSingle();
  return { supabase, user, restaurant };
}

export async function creerSousCompte(formData: FormData) {
  const { restaurant } = await restaurantDuRestaurateur();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const motDePasse = String(formData.get("mot_de_passe") ?? "");
  if (motDePasse.length < 8)
    return { erreur: "Mot de passe trop court (8 caractères minimum)." };

  const admin = createAdminClient();

  // 1 seul sous-compte par restaurant
  const { data: existant } = await admin
    .from("sous_comptes")
    .select("id")
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  if (existant) return { erreur: "Un sous-compte existe déjà pour ce commerce." };

  const email = `souscompte-${restaurant.slug}@walletiz.local`;
  const nom = `Sous compte ${restaurant.nom}`;

  const { data: nouvel, error: erreurAuth } = await admin.auth.admin.createUser({
    email,
    password: motDePasse,
    email_confirm: true,
    app_metadata: { role: "sous_compte" },
  });
  if (erreurAuth || !nouvel.user)
    return { erreur: `Création du compte impossible : ${erreurAuth?.message}` };

  await admin
    .from("profiles")
    .upsert({ id: nouvel.user.id, role: "sous_compte" });

  const { error } = await admin.from("sous_comptes").insert({
    user_id: nouvel.user.id,
    restaurant_id: restaurant.id,
    nom,
    email,
    actif: true,
  });
  if (error) {
    await admin.auth.admin.deleteUser(nouvel.user.id);
    return { erreur: "Impossible d'enregistrer le sous-compte." };
  }

  revalidatePath("/dashboard");
  return { ok: true as const, email, motDePasse };
}

export async function supprimerSousCompte() {
  const { restaurant } = await restaurantDuRestaurateur();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const admin = createAdminClient();
  const { data: sc } = await admin
    .from("sous_comptes")
    .select("user_id")
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  if (!sc) return { erreur: "Aucun sous-compte à supprimer." };

  await admin.auth.admin.deleteUser(sc.user_id); // cascade -> table sous_comptes

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function basculerSousCompte(actif: boolean) {
  const { restaurant } = await restaurantDuRestaurateur();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("sous_comptes")
    .update({ actif })
    .eq("restaurant_id", restaurant.id);
  if (error) return { erreur: "Échec de la mise à jour." };

  revalidatePath("/dashboard");
  return { ok: true };
}

// ============================================================
// SCANNER : le restaurateur ou le sous-compte attribuent
// manuellement N tampons à un client identifié par son téléphone
// ============================================================

// Trouve le restaurant lié à l'utilisateur actuel (restaurateur OU sous-compte)
async function restaurantAcces() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // restaurateur ?
  const { data: r1 } = await supabase
    .from("restaurants")
    .select("id, nom, slug, timezone")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (r1) return { user, restaurant: r1 };

  // sous-compte ?
  const admin = createAdminClient();
  const { data: sc } = await admin
    .from("sous_comptes")
    .select("restaurant_id")
    .eq("user_id", user.id)
    .eq("actif", true)
    .maybeSingle();
  if (!sc) return { user, restaurant: null };

  const { data: r2 } = await admin
    .from("restaurants")
    .select("id, nom, slug, timezone")
    .eq("id", sc.restaurant_id)
    .maybeSingle();
  return { user, restaurant: r2 };
}

export async function attribuerTampons(formData: FormData) {
  const { restaurant } = await restaurantAcces();
  if (!restaurant) return { erreur: "Accès non autorisé." };

  const telephoneBrut = String(formData.get("telephone") ?? "").trim();
  const carteId = String(formData.get("carte_id") ?? "");
  const nombre = parseInt(String(formData.get("nombre") ?? "1"), 10);

  if (!telephoneBrut) return { erreur: "Entrez un numéro de téléphone." };
  if (!Number.isInteger(nombre) || nombre < 1 || nombre > 20)
    return { erreur: "Nombre de tampons entre 1 et 20." };
  if (!carteId) return { erreur: "Choisissez une carte." };

  // Normalisation FR (mais on accepte aussi une correspondance approchée)
  const propre = telephoneBrut.replace(/[\s.\-()]/g, "");
  const admin = createAdminClient();

  const { data: client } = await admin
    .from("clients_fidelite")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("numero_telephone", propre.startsWith("+33") ? "0" + propre.slice(3) : propre)
    .maybeSingle();
  if (!client) return { erreur: "Aucun client trouvé avec ce numéro." };

  const { data: carte } = await admin
    .from("cartes")
    .select("*")
    .eq("id", carteId)
    .eq("restaurant_id", restaurant.id)
    .eq("actif", true)
    .maybeSingle();
  if (!carte) return { erreur: "Cette carte n'existe plus." };

  const aujourdHui = dateDuJour(
    (restaurant as { timezone?: string }).timezone ?? "Europe/Paris"
  );
  if (carte.date_expiration && carte.date_expiration < aujourdHui)
    return { erreur: "Cette carte a expiré." };

  const { data: progression } = await admin
    .from("cartes_clients")
    .select("*")
    .eq("carte_id", carte.id)
    .eq("client_id", client.id)
    .maybeSingle<CarteClient>();

  const actuels = progression?.tampons_actuels ?? 0;
  const requis = carte.nombre_tampons_requis;
  let nouveauxActuels = actuels + nombre;
  let recompensesCreees = 0;

  // Si dépassement, chaque tranche de "requis" crédite 1 récompense automatique
  while (nouveauxActuels >= requis) {
    nouveauxActuels -= requis;
    recompensesCreees += 1;
  }

  // Récompense par défaut = 1re récompense de la carte (ou texte "Récompense")
  const { data: recompenses } = await admin
    .from("recompenses")
    .select("id, texte, image_url")
    .eq("carte_id", carte.id)
    .order("created_at", { ascending: true });
  const recompenseParDefaut = recompenses?.[0];

  if (progression) {
    await admin
      .from("cartes_clients")
      .update({
        tampons_actuels: nouveauxActuels,
        tampons_total: progression.tampons_total + nombre,
        recompenses_reclamees: progression.recompenses_reclamees + recompensesCreees,
        date_dernier_tampon: aujourdHui,
      })
      .eq("id", progression.id);
  } else {
    await admin.from("cartes_clients").insert({
      carte_id: carte.id,
      client_id: client.id,
      tampons_actuels: nouveauxActuels,
      tampons_total: nombre,
      recompenses_reclamees: recompensesCreees,
      date_dernier_tampon: aujourdHui,
    });
  }

  for (let i = 0; i < recompensesCreees; i++) {
    await admin.from("recompenses_gagnees").insert({
      carte_id: carte.id,
      client_id: client.id,
      recompense_id: recompenseParDefaut?.id ?? null,
      texte_recompense: recompenseParDefaut?.texte ?? "Récompense",
      image_url: recompenseParDefaut?.image_url ?? null,
    });
  }

  await admin
    .from("clients_fidelite")
    .update({
      tampons_total: client.tampons_total + nombre,
      recompenses_reclamees: client.recompenses_reclamees + recompensesCreees,
      date_dernier_tampon: aujourdHui,
    })
    .eq("id", client.id);

  // Journal d'historique pour les graphiques
  await admin.from("tampons_historique").insert({
    restaurant_id: restaurant.id,
    carte_id: carte.id,
    client_id: client.id,
    nombre,
    date_attribution: aujourdHui,
  });

  revalidatePath("/dashboard/scanner");
  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return {
    ok: true as const,
    tampons: nombre,
    nouveaux_actuels: nouveauxActuels,
    requis,
    recompenses_creees: recompensesCreees,
  };
}

// ============================================================
// SECTIONS (onglets de la page client)
// ============================================================

export async function creerSection(formData: FormData) {
  const { supabase, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const titre = String(formData.get("titre") ?? "").trim();
  const texte = String(formData.get("texte") ?? "").trim();
  const lienUrl = String(formData.get("lien_url") ?? "").trim();
  const lienLibelle = String(formData.get("lien_libelle") ?? "").trim();

  if (!titre) return { erreur: "Le titre est obligatoire." };
  if (titre.length > 30) return { erreur: "Titre trop long (30 caractères max)." };
  if (lienUrl && !/^https?:\/\//i.test(lienUrl))
    return { erreur: "Le lien doit commencer par http:// ou https://" };

  // ordre = max existant + 1 (avant la section info)
  const { data: derniere } = await supabase
    .from("sections")
    .select("ordre")
    .eq("restaurant_id", restaurant.id)
    .neq("type", "info")
    .order("ordre", { ascending: false })
    .limit(1)
    .maybeSingle();
  const ordre = (derniere?.ordre ?? 0) + 1;

  const { error } = await supabase.from("sections").insert({
    restaurant_id: restaurant.id,
    type: "personnalisee",
    titre,
    texte: texte || null,
    lien_url: lienUrl || null,
    lien_libelle: lienLibelle || null,
    ordre,
    supprimable: true,
  });
  if (error) return { erreur: "Impossible de créer la section." };

  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return { ok: true };
}

export async function modifierSection(sectionId: string, formData: FormData) {
  const { supabase, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const titre = String(formData.get("titre") ?? "").trim();
  const texte = String(formData.get("texte") ?? "").trim();
  const lienUrl = String(formData.get("lien_url") ?? "").trim();
  const lienLibelle = String(formData.get("lien_libelle") ?? "").trim();

  if (!titre) return { erreur: "Le titre est obligatoire." };
  if (lienUrl && !/^https?:\/\//i.test(lienUrl))
    return { erreur: "Le lien doit commencer par http:// ou https://" };

  const { error } = await supabase
    .from("sections")
    .update({
      titre,
      texte: texte || null,
      lien_url: lienUrl || null,
      lien_libelle: lienLibelle || null,
    })
    .eq("id", sectionId)
    .eq("restaurant_id", restaurant.id);
  if (error) return { erreur: "Échec de l'enregistrement." };

  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return { ok: true };
}

export async function supprimerSection(sectionId: string) {
  const { supabase, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé à ce compte." };

  const { data: section } = await supabase
    .from("sections")
    .select("supprimable")
    .eq("id", sectionId)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  if (!section) return { erreur: "Section introuvable." };
  if (!section.supprimable)
    return { erreur: "Cette section ne peut pas être supprimée." };

  const { error } = await supabase
    .from("sections")
    .delete()
    .eq("id", sectionId)
    .eq("restaurant_id", restaurant.id);
  if (error) return { erreur: "Échec de la suppression." };

  revalidatePath("/dashboard");
  revalidatePath(`/c/${restaurant.slug}`);
  return { ok: true };
}

// ============================================================
// SOUS-COMPTE : changer le mot de passe
// ============================================================
export async function changerMotDePasseSousCompte(formData: FormData) {
  const { restaurant } = await restaurantDuRestaurateur();
  if (!restaurant) return { erreur: "Aucun commerce." };

  const motDePasse = String(formData.get("mot_de_passe") ?? "");
  if (motDePasse.length < 8)
    return { erreur: "Mot de passe trop court (8 caractères minimum)." };

  const admin = createAdminClient();
  const { data: sc } = await admin
    .from("sous_comptes")
    .select("user_id")
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  if (!sc) return { erreur: "Aucun sous-compte." };

  const { error } = await admin.auth.admin.updateUserById(sc.user_id, {
    password: motDePasse,
  });
  if (error) return { erreur: "Échec de la mise à jour." };
  return { ok: true };
}

// --- Quitter la session "voir le commerce" (super admin) ---
export async function quitterImpersonation() {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  store.delete("walletiz_impersonate");
  store.delete("walletiz_impersonate_nom");
}
