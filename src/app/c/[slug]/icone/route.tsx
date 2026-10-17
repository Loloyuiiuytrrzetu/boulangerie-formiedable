import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Restaurant } from "@/lib/types";

export const runtime = "nodejs";

// Icône d'écran d'accueil du commerce (iPhone / Android), servie depuis
// walletiz.fr à la taille exacte demandée (?s=180 pour iPhone, 192/512 pour
// le manifeste). iOS ignore les icônes trop lourdes ou hébergées sur un autre
// domaine (le logo brut fait souvent >1 Mo sur Supabase) et affiche alors une
// simple lettre à la place du logo : cette route règle ce problème.
const TAILLES = new Set([180, 192, 512]);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const demandee = Number(new URL(req.url).searchParams.get("s"));
  const taille = TAILLES.has(demandee) ? demandee : 180;

  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("nom, logo_url, couleur")
    .eq("slug", slug)
    .maybeSingle<Pick<Restaurant, "nom" | "logo_url" | "couleur">>();

  const couleur = restaurant?.couleur ?? "#7A1E2E";
  const initiale = (restaurant?.nom ?? "W").trim().charAt(0).toUpperCase();

  return new ImageResponse(
    restaurant?.logo_url ? (
      <div style={{ width: taille, height: taille, display: "flex", background: "#ffffff" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={restaurant.logo_url}
          width={taille}
          height={taille}
          alt=""
          style={{ width: taille, height: taille, objectFit: "cover" }}
        />
      </div>
    ) : (
      <div
        style={{
          width: taille,
          height: taille,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: couleur,
          color: "#ffffff",
          fontSize: taille * 0.5,
          fontWeight: 700,
        }}
      >
        {initiale}
      </div>
    ),
    {
      width: taille,
      height: taille,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    }
  );
}
