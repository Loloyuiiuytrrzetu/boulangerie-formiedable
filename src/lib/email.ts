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
  logoUrl: string | null;
}): string {
  const corps = echapper(opts.message).replace(/\n/g, "<br>");
  const nom = echapper(opts.nomCommerce);
  const couleur = /^#[0-9a-fA-F]{6}$/.test(opts.couleur) ? opts.couleur : "#7A1E2E";
  const initiale = nom.trim().charAt(0).toUpperCase() || "•";

  // Médaillon : logo du commerce (si dispo) ou pastille avec l'initiale.
  // Un contour à la couleur du commerce : petit accent qui survit à
  // l'inversion « mode sombre » de certaines applis mail.
  const medaillon = opts.logoUrl
    ? `<img src="${encodeURI(opts.logoUrl)}" width="76" height="76" alt="${nom}" style="display:block;width:76px;height:76px;border-radius:18px;border:3px solid ${couleur};object-fit:cover;" />`
    : `<div style="width:76px;height:76px;border-radius:18px;border:3px solid ${couleur};background:${couleur};color:#ffffff;font-size:34px;font-weight:bold;line-height:76px;text-align:center;font-family:Arial,Helvetica,sans-serif;">${initiale}</div>`;

  // Design volontairement SUR UN SEUL FOND : pas de grand bloc coloré. Ainsi,
  // quand une appli mail force le mode sombre et inverse les couleurs, le
  // rendu reste propre et uniforme (le logo, une image, n'est jamais inversé).
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
</head>
<body style="margin:0;padding:0;background:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:30px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">
          <!-- En-tête : logo + nom + fin trait d'accent -->
          <tr>
            <td align="center" style="padding:4px 8px 22px;">
              ${medaillon}
              <div style="margin-top:14px;font-size:21px;font-weight:bold;color:#1c1917;font-family:Arial,Helvetica,sans-serif;letter-spacing:-0.3px;">${nom}</div>
              <div style="width:46px;height:3px;background:${couleur};border-radius:2px;margin:14px auto 0;line-height:3px;font-size:0;">&nbsp;</div>
            </td>
          </tr>
          <!-- Corps du message -->
          <tr>
            <td style="padding:6px 14px 10px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#292524;">
              ${corps}
            </td>
          </tr>
          <!-- Pied -->
          <tr>
            <td align="center" style="padding:26px 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#9c9690;">
              Vous recevez cet email car vous êtes client de ${nom}.<br>
              <a href="${opts.lienDesinscription}" style="color:#9c9690;text-decoration:underline;">Se désinscrire de ces emails</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
  logoUrl: string | null;
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
          logoUrl: opts.logoUrl,
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
