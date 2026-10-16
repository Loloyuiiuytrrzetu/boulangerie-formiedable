import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargerClientsEmail, envoyerEmailsParLots } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Laisse le temps d'envoyer à des milliers de clients (plan Vercel Pro).
export const maxDuration = 300;

// Endpoint appelé toutes les minutes par Vercel Cron (voir vercel.json).
// Trouve tous les emails programmés dont l'échéance est passée et non encore
// envoyés, puis les expédie à tous les clients du commerce.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const admin = createAdminClient();
  const maintenant = new Date().toISOString();

  const { data: aEnvoyer } = await admin
    .from("notifications_push")
    .select("id, restaurant_id, titre, message")
    .is("envoyee_at", null)
    .not("date_programmee", "is", null)
    .lte("date_programmee", maintenant)
    .limit(50);

  if (!aEnvoyer || aEnvoyer.length === 0) {
    return NextResponse.json({ ok: true, expediees: 0 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://walletiz.fr";

  let total = 0;
  for (const n of aEnvoyer) {
    const { data: restaurant } = await admin
      .from("restaurants")
      .select("nom, slug, couleur, owner_id")
      .eq("id", n.restaurant_id)
      .maybeSingle();
    if (!restaurant) {
      await admin
        .from("notifications_push")
        .update({ envoyee_at: new Date().toISOString(), nb_envois: 0 })
        .eq("id", n.id);
      continue;
    }

    // Email principal du commerce (reply-to).
    let replyTo: string | null = null;
    try {
      const { data } = await admin.auth.admin.getUserById(restaurant.owner_id);
      replyTo = data.user?.email ?? null;
    } catch {
      replyTo = null;
    }

    const clients = await chargerClientsEmail(admin, n.restaurant_id);
    let envois = 0;
    if (clients.length > 0) {
      try {
        const res = await envoyerEmailsParLots({
          clients,
          sujet: n.titre || restaurant.nom,
          nomCommerce: restaurant.nom,
          message: n.message,
          replyTo,
          slug: restaurant.slug,
          siteUrl,
          couleur: restaurant.couleur ?? "#7A1E2E",
        });
        envois = res.envois;
      } catch {
        envois = 0;
      }
    }

    await admin
      .from("notifications_push")
      .update({ envoyee_at: new Date().toISOString(), nb_envois: envois })
      .eq("id", n.id);
    total += envois;
  }

  return NextResponse.json({ ok: true, notifications: aEnvoyer.length, envois: total });
}
