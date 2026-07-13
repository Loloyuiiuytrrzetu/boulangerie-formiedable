// Fonctions client pour s'abonner aux notifications push directement
// depuis le formulaire d'inscription. Doit être appelé au sein d'un
// gestionnaire de clic utilisateur (contrainte navigateur).

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export type ResultatAbonnement =
  | { statut: "abonne" }
  | { statut: "non-supporte" }
  | { statut: "refuse" }
  | { statut: "ios-install" }
  | { statut: "erreur"; message: string };

export async function abonnerAuxNotifications(
  restaurantId: string,
  vapidPublicKey: string | null
): Promise<ResultatAbonnement> {
  if (typeof window === "undefined") return { statut: "non-supporte" };
  if (!vapidPublicKey) return { statut: "non-supporte" };

  // iOS Safari : nécessite d'être installé comme PWA (ajout à l'écran d'accueil)
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  if (isIOS && !isStandalone) return { statut: "ios-install" };

  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return { statut: "non-supporte" };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { statut: "refuse" };

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
    });
    const raw = subscription.toJSON();
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        endpoint: raw.endpoint,
        p256dh: raw.keys?.p256dh,
        auth: raw.keys?.auth,
      }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { erreur?: string };
      return { statut: "erreur", message: j.erreur ?? "Échec de l'inscription." };
    }
    return { statut: "abonne" };
  } catch (e) {
    return {
      statut: "erreur",
      message: e instanceof Error ? e.message : "Erreur inconnue.",
    };
  }
}
