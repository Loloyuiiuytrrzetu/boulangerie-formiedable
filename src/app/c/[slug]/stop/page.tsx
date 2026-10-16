import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Page de désinscription aux emails, atteinte via le lien « Se désinscrire »
// présent au bas de chaque email (?t=<token_public> du client). On passe
// emails_actif à false pour ce client. Un lien permet de se réabonner.
export default async function StopEmails({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string; r?: string }>;
}) {
  const { slug } = await params;
  const { t: token, r: reabonner } = await searchParams;

  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id, nom, couleur")
    .eq("slug", slug)
    .maybeSingle();

  let etat: "ok" | "reabonne" | "introuvable" = "introuvable";
  if (restaurant && token) {
    const actif = reabonner === "1";
    const { data: maj } = await admin
      .from("clients_fidelite")
      .update({ emails_actif: actif })
      .eq("restaurant_id", restaurant.id)
      .eq("token_public", token)
      .select("id");
    if (maj && maj.length > 0) etat = actif ? "reabonne" : "ok";
  }

  const couleur = restaurant?.couleur ?? "#7A1E2E";
  const nom = restaurant?.nom ?? "ce commerce";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafaf9",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "440px",
          width: "100%",
          background: "#fff",
          border: "1px solid #e7e5e4",
          borderRadius: "20px",
          padding: "32px",
          textAlign: "center",
          boxShadow: "0 8px 28px -12px rgba(0,0,0,.15)",
        }}
      >
        <div style={{ height: "6px", background: couleur, borderRadius: "4px", margin: "-8px 0 20px" }} />
        {etat === "ok" && (
          <>
            <h1 style={{ fontSize: "20px", color: "#1c1917", margin: "0 0 10px" }}>
              Vous êtes désinscrit
            </h1>
            <p style={{ color: "#57534e", fontSize: "15px", lineHeight: 1.6, margin: "0 0 20px" }}>
              Vous ne recevrez plus d&apos;emails de <strong>{nom}</strong>.
            </p>
            {token && (
              <a
                href={`?t=${encodeURIComponent(token)}&r=1`}
                style={{ color: couleur, fontSize: "14px" }}
              >
                Me réabonner
              </a>
            )}
          </>
        )}
        {etat === "reabonne" && (
          <>
            <h1 style={{ fontSize: "20px", color: "#1c1917", margin: "0 0 10px" }}>
              Vous êtes réabonné
            </h1>
            <p style={{ color: "#57534e", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
              Vous recevrez de nouveau les emails de <strong>{nom}</strong>.
            </p>
          </>
        )}
        {etat === "introuvable" && (
          <>
            <h1 style={{ fontSize: "20px", color: "#1c1917", margin: "0 0 10px" }}>
              Lien invalide
            </h1>
            <p style={{ color: "#57534e", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
              Ce lien de désinscription n&apos;est plus valide.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
