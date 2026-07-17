import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { synchroniserAbonnement } from "@/lib/stripe-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// -------------------------------------------------------------------------
// Webhook Stripe : reçoit les événements d'abonnement et met à jour le
// statut du restaurant correspondant (via l'email / le customer id Stripe).
//
// Vérification de signature faite « à la main » (HMAC-SHA256) pour éviter
// une dépendance npm supplémentaire — c'est exactement ce que fait la lib
// officielle Stripe en interne.
//
// Variable d'environnement requise (Vercel) :
//   STRIPE_WEBHOOK_SECRET  (le « Signing secret » de l'endpoint webhook)
// -------------------------------------------------------------------------

function signatureValide(rawBody: string, entete: string | null, secret: string): boolean {
  if (!entete) return false;
  const parties: Record<string, string> = {};
  for (const p of entete.split(",")) {
    const [k, v] = p.split("=");
    if (k && v) parties[k.trim()] = v.trim();
  }
  const t = parties["t"];
  const v1 = parties["v1"];
  if (!t || !v1) return false;

  // Tolérance de 5 min contre le rejeu
  const age = Math.abs(Date.now() / 1000 - Number(t));
  if (!Number.isFinite(age) || age > 300) return false;

  const payloadSigne = `${t}.${rawBody}`;
  const attendu = crypto
    .createHmac("sha256", secret)
    .update(payloadSigne, "utf8")
    .digest("hex");

  const a = Buffer.from(attendu);
  const b = Buffer.from(v1);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

type StripeEvent = {
  type: string;
  data: { object: Record<string, unknown> };
};

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { erreur: "Webhook non configuré (STRIPE_WEBHOOK_SECRET manquant)." },
      { status: 500 }
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signatureValide(rawBody, signature, secret)) {
    return NextResponse.json({ erreur: "Signature invalide." }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return NextResponse.json({ erreur: "Payload illisible." }, { status: 400 });
  }

  try {
    const obj = event.data.object;

    switch (event.type) {
      // Paiement initial via le lien Stripe : on a l'email + les ids.
      case "checkout.session.completed": {
        const details = obj["customer_details"] as { email?: string } | undefined;
        await synchroniserAbonnement({
          customerId: String(obj["customer"] ?? ""),
          email: details?.email ?? (obj["customer_email"] as string | undefined) ?? null,
          subscriptionId: (obj["subscription"] as string | null) ?? null,
          statutStripe: "active",
        });
        break;
      }

      // Renouvellement / création / changement d'état de l'abonnement.
      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        const items = obj["items"] as { data?: { price?: { id?: string } }[] } | undefined;
        void items;
        await synchroniserAbonnement({
          customerId: String(obj["customer"] ?? ""),
          subscriptionId: String(obj["id"] ?? ""),
          statutStripe:
            event.type === "customer.subscription.deleted"
              ? "canceled"
              : (obj["status"] as string | null) ?? null,
          prochaineFactureUnix: (obj["current_period_end"] as number | null) ?? null,
          annuleALaFin: Boolean(obj["cancel_at_period_end"]),
        });
        break;
      }

      // Facture payée (renouvellement réussi) — l'email est présent.
      case "invoice.paid": {
        await synchroniserAbonnement({
          customerId: String(obj["customer"] ?? ""),
          email: (obj["customer_email"] as string | undefined) ?? null,
          subscriptionId: (obj["subscription"] as string | null) ?? null,
          statutStripe: "active",
          prochaineFactureUnix:
            (((obj["lines"] as { data?: { period?: { end?: number } }[] } | undefined)
              ?.data?.[0]?.period?.end) as number | null) ?? null,
        });
        break;
      }

      // Échec de paiement — on marque le compte en « expire » (accès à risque).
      case "invoice.payment_failed": {
        await synchroniserAbonnement({
          customerId: String(obj["customer"] ?? ""),
          email: (obj["customer_email"] as string | undefined) ?? null,
          subscriptionId: (obj["subscription"] as string | null) ?? null,
          statutStripe: "past_due",
        });
        break;
      }

      default:
        // Événement non géré : on l'acquitte quand même (200) pour que Stripe
        // n'insiste pas indéfiniment.
        break;
    }
  } catch (e) {
    // On log mais on renvoie 200 pour éviter des retries en boucle sur une
    // erreur applicative ; les erreurs Stripe légitimes (signature) sont déjà
    // rejetées plus haut.
    console.error("Erreur webhook Stripe:", e);
  }

  return NextResponse.json({ recu: true });
}
