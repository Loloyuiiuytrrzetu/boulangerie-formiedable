import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Restaurant } from "@/lib/types";

export const dynamic = "force-dynamic";

// Manifeste PWA dynamique par commerce : quand le client installe la page
// sur son écran d'accueil (iPhone Safari, Android Chrome…), l'icône et le
// nom de l'app sont ceux DU COMMERCE, pas ceux de Walletiz. Les notifications
// push affichent alors le logo du commerce à la place du "W".
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("nom, logo_url, couleur")
    .eq("slug", slug)
    .maybeSingle<Pick<Restaurant, "nom" | "logo_url" | "couleur">>();

  if (!restaurant) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const icone = restaurant.logo_url ?? undefined;
  const icons = icone
    ? [
        { src: icone, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: icone, sizes: "512x512", type: "image/png", purpose: "any" },
        { src: icone, sizes: "192x192", type: "image/png", purpose: "maskable" },
      ]
    : [];

  // start_url ABSOLU sur le domaine canonique : évite qu'au lancement l'app
  // suive une redirection (ex. walletiz.fr → www.walletiz.fr) qui ferait
  // rebasculer iOS dans Safari au lieu de rester dans l'app installée.
  // scope RELATIF : toujours de même origine que le manifeste (donc valide),
  // et il englobe la page une fois lancée sur le domaine canonique.
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  const startUrl = siteUrl ? `${siteUrl}/c/${slug}` : `/c/${slug}`;

  return NextResponse.json(
    {
      id: `/c/${slug}`,
      name: restaurant.nom,
      short_name: restaurant.nom,
      description: `Carte de fidélité ${restaurant.nom}`,
      start_url: startUrl,
      scope: `/c/${slug}`,
      display: "standalone",
      display_override: ["standalone"],
      background_color: "#ffffff",
      theme_color: restaurant.couleur ?? "#7A1E2E",
      icons,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Content-Type": "application/manifest+json",
      },
    }
  );
}
