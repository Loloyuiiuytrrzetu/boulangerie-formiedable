import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWebPush } from "@/lib/push";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Endpoint appelé toutes les minutes par Vercel Cron (voir vercel.json).
// Trouve toutes les notifications programmées dont l'échéance est passée
// et non encore envoyées, puis les expédie à tous les abonnés du commerce.
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  let wp;
  try {
    wp = getWebPush();
  } catch (e) {
    return NextResponse.json(
      { erreur: e instanceof Error ? e.message : "Config manquante." },
      { status: 500 }
    );
  }

  let total = 0;
  for (const n of aEnvoyer) {
    const { data: restaurant } = await admin
      .from("restaurants")
      .select("logo_url, slug")
      .eq("id", n.restaurant_id)
      .maybeSingle();

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("restaurant_id", n.restaurant_id);

    let envois = 0;
    const aSupprimer: string[] = [];
    const payload = JSON.stringify({
      titre: n.titre,
      message: n.message,
      icon: restaurant?.logo_url ?? undefined,
      url: restaurant ? `${siteUrl}/c/${restaurant.slug}` : "/",
    });

    await Promise.all(
      (subs ?? []).map(async (s) => {
        try {
          await wp!.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload
          );
          envois++;
        } catch (err: unknown) {
          const statusCode =
            typeof err === "object" && err !== null && "statusCode" in err
              ? (err as { statusCode?: number }).statusCode
              : undefined;
          if (statusCode === 404 || statusCode === 410) aSupprimer.push(s.id);
        }
      })
    );
    if (aSupprimer.length > 0) {
      await admin.from("push_subscriptions").delete().in("id", aSupprimer);
    }
    await admin
      .from("notifications_push")
      .update({ envoyee_at: new Date().toISOString(), nb_envois: envois })
      .eq("id", n.id);
    total += envois;
  }

  return NextResponse.json({ ok: true, notifications: aEnvoyer.length, envois: total });
}
