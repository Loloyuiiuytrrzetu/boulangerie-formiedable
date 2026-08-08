import webpush from "web-push";
import type { createAdminClient } from "@/lib/supabase/admin";

let configure = false;

// Configure web-push avec les clés VAPID au premier appel.
// Les clés doivent être générées une fois (npx web-push generate-vapid-keys)
// et placées dans les variables d'environnement.
export function getWebPush() {
  if (!configure) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || "mailto:contact@walletiz.app";
    if (!publicKey || !privateKey) {
      throw new Error(
        "Clés VAPID manquantes. Ajouter NEXT_PUBLIC_VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY dans les variables d'environnement."
      );
    }
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configure = true;
  }
  return webpush;
}

export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}

export type AbonnePush = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

// Récupère TOUS les abonnés push d'un commerce, sans limite. Supabase plafonne
// chaque requête à 1000 lignes : on pagine donc par lots de 1000 jusqu'à avoir
// tout récupéré. Indispensable pour qu'un commerce à très gros volume (plus de
// 1000 abonnés) reçoive bien ses notifications en ENTIER, pas seulement les
// 1000 premiers.
// Envoie une notification à une liste d'abonnés PAR LOTS (concurrence bornée).
// Envoyer des milliers de push en une seule fois (Promise.all sur tout) peut
// saturer la fonction serveur et en perdre. On traite par tranches de `lot`
// pour rester fiable même à 8000+ abonnés. Renvoie le nombre d'envois réussis
// et les ids d'abonnements morts (404/410) à supprimer.
export async function envoyerParLots(
  wp: ReturnType<typeof getWebPush>,
  subs: AbonnePush[],
  payload: string,
  lot = 200
): Promise<{ envois: number; aSupprimer: string[] }> {
  let envois = 0;
  const aSupprimer: string[] = [];
  for (let i = 0; i < subs.length; i += lot) {
    const tranche = subs.slice(i, i + lot);
    await Promise.all(
      tranche.map(async (s) => {
        try {
          await wp.sendNotification(
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
  }
  return { envois, aSupprimer };
}

export async function chargerTousLesAbonnes(
  admin: ReturnType<typeof createAdminClient>,
  restaurantId: string
): Promise<AbonnePush[]> {
  const LOT = 1000;
  const tous: AbonnePush[] = [];
  for (let debut = 0; ; debut += LOT) {
    const { data } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("restaurant_id", restaurantId)
      .range(debut, debut + LOT - 1);
    const lot = (data ?? []) as AbonnePush[];
    if (lot.length === 0) break;
    tous.push(...lot);
    if (lot.length < LOT) break;
  }
  return tous;
}
