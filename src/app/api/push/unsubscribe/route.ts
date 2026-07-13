import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

// Le client demande à ne plus recevoir de notifications. On supprime
// tous ses abonnements de la base côté serveur (le service worker sera
// désenregistré côté navigateur en parallèle).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId } = body;
    if (!restaurantId)
      return NextResponse.json({ erreur: "Données manquantes." }, { status: 400 });

    const cookieStore = await cookies();
    const token = cookieStore.get(`fid_${restaurantId}`)?.value;
    if (!token)
      return NextResponse.json({ erreur: "Client non identifié." }, { status: 401 });

    const admin = createAdminClient();
    const { data: client } = await admin
      .from("clients_fidelite")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("token_cookie", token)
      .maybeSingle();

    if (!client)
      return NextResponse.json({ erreur: "Client introuvable." }, { status: 404 });

    await admin.from("push_subscriptions").delete().eq("client_id", client.id);
    await admin
      .from("clients_fidelite")
      .update({ notifications_push_actif: false })
      .eq("id", client.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: msg }, { status: 500 });
  }
}
