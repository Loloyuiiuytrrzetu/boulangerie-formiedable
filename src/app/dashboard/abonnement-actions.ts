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

// Met à jour l'abonnement Stripe directement via l'API REST (sans dépendance).
// annuler=true  → programme l'arrêt à la fin de la période payée (le client
//                 garde l'accès jusque-là, puis plus aucun prélèvement).
// annuler=false → réactive un abonnement qui était programmé pour s'arrêter.
// Renvoie true si Stripe a bien été mis à jour, false sinon (clé absente,
// pas d'abonnement Stripe, ou erreur réseau).
async function majAbonnementStripe(
  subscriptionId: string | null | undefined,
  annuler: boolean
): Promise<boolean> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!subscriptionId || !key) return false;
  try {
    const res = await fetch(
      `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `cancel_at_period_end=${annuler ? "true" : "false"}`,
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// Le restaurateur annule son abonnement. Statut passe à "annule" — l'accès
// reste actif jusqu'à la fin de la période payée / de l'essai. Aucun
// prélèvement Stripe supplémentaire ne sera fait (branchement Stripe à
// venir : ici on marque juste la volonté d'annulation).
export async function annulerAbonnement() {
  const { admin, restaurant } = await restaurantCourant();
  if (!restaurant) return { erreur: "Aucun commerce associé." };

  // Annule réellement la facturation Stripe (à la fin de la période payée).
  await majAbonnementStripe(restaurant.stripe_subscription_id, true);

  await admin
    .from("restaurants")
    .update({
      abonnement_statut: "annule",
      abonnement_annule_le: new Date().toISOString(),
    })
    .eq("id", restaurant.id);

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

  // Réactive la facturation Stripe (on annule l'arrêt programmé).
  await majAbonnementStripe(restaurant.stripe_subscription_id, false);

  await admin
    .from("restaurants")
    .update({
      abonnement_statut: statut,
      abonnement_annule_le: null,
    })
    .eq("id", restaurant.id);

  revalidatePath("/dashboard");
  return { ok: true as const };
}
