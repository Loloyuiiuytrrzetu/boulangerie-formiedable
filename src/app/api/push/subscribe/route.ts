import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

// Le client (côté navigateur) s'abonne aux notifications push : on reçoit
// ici son endpoint + clés, et on les persiste liés à son id (via cookie).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, endpoint, p256dh, auth } = body;

    if (!restaurantId || !endpoint || !p256dh || !auth) {
      return NextResponse.json({ erreur: "Données manquantes." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(`fid_${restaurantId}`)?.value;
    if (!token) {
      return NextResponse.json({ erreur: "Client non identifié." }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: client } = await admin
      .from("clients_fidelite")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("token_cookie", token)
      .maybeSingle();

    if (!client) {
      return NextResponse.json({ erreur: "Client introuvable." }, { status: 404 });
    }

    // Upsert par endpoint : si un même appareil ré-appelle, on écrase.
    const { error } = await admin
      .from("push_subscriptions")
      .upsert(
        {
          client_id: client.id,
          restaurant_id: restaurantId,
          endpoint,
          p256dh,
          auth,
        },
        { onConflict: "endpoint" }
      );

    if (error) {
      return NextResponse.json({ erreur: error.message }, { status: 500 });
    }

    await admin
      .from("clients_fidelite")
      .update({ notifications_push_actif: true })
      .eq("id", client.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur inconnue.";
    return NextResponse.json({ erreur: msg }, { status: 500 });
  }
}
