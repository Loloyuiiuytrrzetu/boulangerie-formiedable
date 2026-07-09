import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Route déclenchée quand le client scanne un QR code physique.
// Pose un cookie "scan_<restaurant_id>" de 15 minutes qui prouve
// qu'un vrai scan vient d'avoir lieu — les tampons ne sont attribués
// que si ce cookie est présent. Puis redirige vers la page client.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id, actif")
    .eq("slug", slug)
    .maybeSingle();

  const url = new URL(request.url);
  const cible = new URL(`/c/${slug}`, url.origin);
  const reponse = NextResponse.redirect(cible);

  if (restaurant?.actif) {
    reponse.cookies.set(`scan_${restaurant.id}`, "ok", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });
  }

  return reponse;
}
