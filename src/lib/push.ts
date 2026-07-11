import webpush from "web-push";

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
