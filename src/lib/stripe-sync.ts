import { createAdminClient } from "@/lib/supabase/admin";

// -------------------------------------------------------------------------
// Synchronisation des abonnements Stripe → restaurants Walletiz.
//
// Le webhook Stripe appelle ces fonctions. La création du compte reste
// manuelle (super-admin) ; ici on ne fait que refléter l'état du paiement.
// -------------------------------------------------------------------------

type Admin = ReturnType<typeof createAdminClient>;

// Mappe le statut Stripe vers notre enum interne
// (essai / actif / annule / expire).
export function statutInterne(statutStripe: string | null | undefined): string {
  switch (statutStripe) {
    case "active":
    case "trialing":
      return "actif";
    case "canceled":
      return "annule";
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return "expire";
    default:
      return "expire";
  }
}

function tsDepuisUnix(sec: number | null | undefined): string | null {
  if (!sec) return null;
  return new Date(sec * 1000).toISOString();
}

// Cherche l'utilisateur auth par email (l'email sert de pont entre Stripe
// et le compte créé par le super-admin).
async function trouverUserParEmail(admin: Admin, email: string): Promise<string | null> {
  const cible = email.trim().toLowerCase();
  // listUsers est paginé (200/page) ; largement suffisant à cette échelle.
  for (let page = 1; page <= 10; page++) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    const u = data?.users?.find((x) => x.email?.toLowerCase() === cible);
    if (u) return u.id;
    if (!data || data.users.length < 200) break;
  }
  return null;
}

// Retrouve le restaurant concerné : d'abord par stripe_customer_id (rapide),
// sinon par l'email → utilisateur → restaurant.
async function trouverRestaurant(
  admin: Admin,
  opts: { customerId?: string | null; email?: string | null }
): Promise<{ id: string } | null> {
  if (opts.customerId) {
    const { data } = await admin
      .from("restaurants")
      .select("id")
      .eq("stripe_customer_id", opts.customerId)
      .maybeSingle();
    if (data) return data as { id: string };
  }
  if (opts.email) {
    const userId = await trouverUserParEmail(admin, opts.email);
    if (userId) {
      const { data } = await admin
        .from("restaurants")
        .select("id")
        .eq("owner_id", userId)
        .maybeSingle();
      if (data) return data as { id: string };
    }
  }
  return null;
}

export type InfosAbonnement = {
  customerId: string;
  email?: string | null;
  subscriptionId?: string | null;
  statutStripe?: string | null;
  prochaineFactureUnix?: number | null;
  annuleALaFin?: boolean;
};

// Enregistre l'état Stripe dans la table tampon (indexée par customer id)
// ET l'applique au restaurant s'il existe déjà.
export async function synchroniserAbonnement(infos: InfosAbonnement): Promise<void> {
  const admin = createAdminClient();
  const statut = statutInterne(infos.statutStripe);
  const prochaine = tsDepuisUnix(infos.prochaineFactureUnix);

  // 1. Table tampon (source de vérité, retrouvée à la création du compte)
  await admin.from("abonnements_stripe").upsert(
    {
      stripe_customer_id: infos.customerId,
      email: (infos.email ?? "").toLowerCase(),
      stripe_subscription_id: infos.subscriptionId ?? null,
      statut: infos.statutStripe ?? null,
      prochaine_facture_le: prochaine,
      annule_a_la_fin: infos.annuleALaFin ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_customer_id" }
  );

  // 2. Application immédiate au restaurant s'il existe
  const resto = await trouverRestaurant(admin, {
    customerId: infos.customerId,
    email: infos.email,
  });
  if (!resto) return;

  const maj: Record<string, string | boolean | null> = {
    abonnement_statut: statut,
    stripe_customer_id: infos.customerId,
  };
  if (infos.subscriptionId) maj.stripe_subscription_id = infos.subscriptionId;
  if (prochaine) maj.abonnement_prochaine_facture_le = prochaine;
  if (statut === "actif") maj.abonnement_debut_le = new Date().toISOString();
  if (statut === "annule") maj.abonnement_annule_le = new Date().toISOString();

  await admin.from("restaurants").update(maj).eq("id", resto.id);
}

// Appelé à la création d'un compte restaurateur (super-admin) : si un paiement
// Stripe existe déjà pour cet email, on relie l'abonnement au restaurant.
export async function lierAbonnementExistant(
  restaurantId: string,
  email: string
): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("abonnements_stripe")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return;

  const row = data as {
    stripe_customer_id: string;
    stripe_subscription_id: string | null;
    statut: string | null;
    prochaine_facture_le: string | null;
  };
  const statut = statutInterne(row.statut);
  const maj: Record<string, string | null> = {
    abonnement_statut: statut,
    stripe_customer_id: row.stripe_customer_id,
    stripe_subscription_id: row.stripe_subscription_id,
    abonnement_prochaine_facture_le: row.prochaine_facture_le,
  };
  if (statut === "actif") maj.abonnement_debut_le = new Date().toISOString();
  await admin.from("restaurants").update(maj).eq("id", restaurantId);
}
