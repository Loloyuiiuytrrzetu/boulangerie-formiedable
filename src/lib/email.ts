import type { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// ENVOI D'EMAILS AUX CLIENTS D'UN COMMERCE (via Resend)
//
// Remplace l'ancien système de notifications push. Le commerçant écrit un
// message depuis son dashboard ; on l'envoie par email à TOUS ses clients
// qui ont une adresse email et qui ne se sont pas désinscrits.
//
// Expéditeur : le NOM DU COMMERCE (ex. « Top Burger »), pas « Walletiz ».
// L'adresse technique reste sur le domaine vérifié walletiz.fr (obligatoire
// pour la délivrabilité), mais le client voit le nom du commerce. Les
// réponses vont à l'email principal du commerce (reply-to).
// ============================================================

type Admin = ReturnType<typeof createAdminClient>;

// Adresse technique d'envoi (sur le domaine vérifié dans Resend).
const FROM_ADDRESS =
  process.env.EMAIL_FROM_ADDRESS || "notifications@walletiz.fr";

export function resendConfigure(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export type ClientEmail = {
  id: string;
  email: string;
  token_public: string | null;
};

// Récupère TOUS les clients d'un commerce qui ont un email et acceptent les
// emails, sans plafond (pagination par lots de 1000, comme l'ancien push).
export async function chargerClientsEmail(
  admin: Admin,
  restaurantId: string
): Promise<ClientEmail[]> {
  const LOT = 1000;
  const tous: ClientEmail[] = [];
  for (let debut = 0; ; debut += LOT) {
    const { data } = await admin
      .from("clients_fidelite")
      .select("id, email, token_public")
      .eq("restaurant_id", restaurantId)
      .eq("emails_actif", true)
      .not("email", "is", null)
      .range(debut, debut + LOT - 1);
    const lot = (data ?? []) as ClientEmail[];
    if (lot.length === 0) break;
    tous.push(...lot);
    if (lot.length < LOT) break;
  }
  // Filet de sécurité : on garde uniquement les emails plausibles.
  return tous.filter((c) => !!c.email && c.email.includes("@"));
}

function echapper(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function construireHtml(opts: {
  nomCommerce: string;
  message: string;
  lienDesinscription: string;
  couleur: string;
}): string {
  const corps = echapper(opts.message).replace(/\n/g, "<br>");
  const nom = echapper(opts.nomCommerce);
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f4;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="background:#ffffff;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;">
      <div style="height:6px;background:${opts.couleur};"></div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 18px;font-size:20px;color:#1c1917;">${nom}</h1>
        <div style="font-size:15px;line-height:1.65;color:#44403c;">${corps}</div>
      </div>
    </div>
    <p style="text-align:center;font-size:12px;color:#a8a29e;margin:18px 0 0;line-height:1.6;">
      Vous recevez cet email car vous êtes client de ${nom}.<br>
      <a href="${opts.lienDesinscription}" style="color:#a8a29e;">Se désinscrire de ces emails</a>
    </p>
  </div>
</body></html>`;
}

export type ResultatEnvoi = { envois: number };

// Envoie le message par email à la liste de clients, par lots de 100 (endpoint
// batch de Resend), fiable jusqu'à des milliers de clients. Chaque email est
// personnalisé (lien de désinscription propre au client) et le destinataire ne
// voit que sa propre adresse.
export async function envoyerEmailsParLots(opts: {
  clients: ClientEmail[];
  sujet: string;
  nomCommerce: string;
  message: string;
  replyTo: string | null;
  slug: string;
  siteUrl: string;
  couleur: string;
}): Promise<ResultatEnvoi> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "Clé Resend manquante. Ajouter RESEND_API_KEY dans les variables d'environnement."
    );
  }
  // Nom d'expéditeur = nom du commerce (nettoyé des caractères d'en-tête).
  const nomExp = opts.nomCommerce.replace(/[<>"\r\n]/g, "").trim() || "Commerce";
  const from = `${nomExp} <${FROM_ADDRESS}>`;

  let envois = 0;
  const LOT = 100;
  for (let i = 0; i < opts.clients.length; i += LOT) {
    const tranche = opts.clients.slice(i, i + LOT);
    const batch = tranche.map((c) => {
      const lien = `${opts.siteUrl}/c/${opts.slug}/stop?t=${c.token_public ?? ""}`;
      return {
        from,
        to: [c.email],
        subject: opts.sujet,
        html: construireHtml({
          nomCommerce: opts.nomCommerce,
          message: opts.message,
          lienDesinscription: lien,
          couleur: opts.couleur,
        }),
        reply_to: opts.replyTo || undefined,
        headers: { "List-Unsubscribe": `<${lien}>` },
      };
    });
    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batch),
      });
      if (res.ok) envois += tranche.length;
    } catch {
      // best-effort : on continue avec les lots suivants.
    }
  }
  return { envois };
}
