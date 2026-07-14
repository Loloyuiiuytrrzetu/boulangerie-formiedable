"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { utilisateurEffectif } from "@/lib/impersonate";

async function restaurantCourant() {
  const effectif = await utilisateurEffectif();
  if (!effectif) redirect("/login");
  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("*")
    .eq("owner_id", effectif.userId)
    .maybeSingle();
  return { admin, restaurant };
}

// Le restaurateur annule son abonnement. Statut passe à "annule" — l'accès
// reste actif jusqu'à la fin de la période payée / de l'essai. Aucun
// prélèvement Stripe supplémentaire ne sera fait (branchement Stripe à
// venir : ici on marque juste la volonté d'annulation).
export async function annulerAbonnement() {
  const { admin, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé." };

  await admin
    .from("restaurants")
    .update({
      abonnement_statut: "annule",
      abonnement_annule_le: new Date().toISOString(),
    })
    .eq("id", restaurant.id);

  // TODO Stripe : appeler stripe.subscriptions.update(id, { cancel_at_period_end: true })

  revalidatePath("/dashboard");
  return { ok: true as const };
}

// Le restaurateur revient sur son annulation (avant la fin de la période).
export async function reactiverAbonnement() {
  const { admin, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé." };

  // On restaure l'état d'origine : "actif" si l'abonnement était démarré,
  // sinon "essai" (la date de fin d'essai est conservée telle quelle).
  const statut = restaurant.abonnement_debut_le ? "actif" : "essai";

  await admin
    .from("restaurants")
    .update({
      abonnement_statut: statut,
      abonnement_annule_le: null,
    })
    .eq("id", restaurant.id);

  // TODO Stripe : appeler stripe.subscriptions.update(id, { cancel_at_period_end: false })

  revalidatePath("/dashboard");
  return { ok: true as const };
}
