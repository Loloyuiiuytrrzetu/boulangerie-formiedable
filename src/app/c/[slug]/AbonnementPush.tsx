"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/langue";
import { abonnerAuxNotifications } from "@/lib/abonnement-push";

// Convertit une clé VAPID base64 URL-safe en Uint8Array (requis par
// pushManager.subscribe).
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function AbonnementPush({
  restaurantId,
  vapidPublicKey,
  dejaActif,
  couleur,
}: {
  restaurantId: string;
  vapidPublicKey: string | null;
  dejaActif: boolean;
  couleur: string;
}) {
  const t = useT();
  const [statut, setStatut] = useState<"init" | "actif" | "refuse" | "erreur" | "loading" | "ios-install">(
    dejaActif ? "actif" : "init"
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // iOS Safari : les notifications push ne marchent QUE si la page est
    // ajoutée à l'écran d'accueil (installée comme PWA). Sinon on doit
    // demander au client de l'installer d'abord.
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !("MSStream" in window);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isIOS && !isStandalone) {
      setStatut("ios-install");
      return;
    }
    if (!("Notification" in window)) {
      setStatut("erreur");
      return;
    }
    if (Notification.permission === "denied") {
      setStatut("refuse");
      return;
    }
    // Déjà abonné pour de vrai ? On vérifie l'abonnement push réel du
    // navigateur (et pas seulement une préférence enregistrée), pour afficher
    // l'état exact et éviter un faux « actif ».
    if (Notification.permission === "granted" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistration("/sw.js")
        .then((reg) => reg?.pushManager.getSubscription())
        .then((sub) => {
          if (sub) setStatut("actif");
        })
        .catch(() => {});
    }
  }, []);

  async function activer() {
    if (!vapidPublicKey) {
      setMessage(t("notifs_impossible"));
      setStatut("erreur");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setMessage(t("push_non_supporte"));
      setStatut("erreur");
      return;
    }
    setStatut("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatut("refuse");
        return;
      }
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
        const j = await res.json().catch(() => ({}));
        throw new Error(j.erreur ?? t("echec_inscription"));
      }
      setStatut("actif");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t("erreur_inconnue"));
      setStatut("erreur");
    }
  }

  if (statut === "actif") {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
        {t("notifs_actives")}
      </div>
    );
  }
  if (statut === "refuse") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        {t("notifs_refusees")}
      </div>
    );
  }
  if (statut === "erreur") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {message ?? t("notifs_impossible")}
      </div>
    );
  }
  if (statut === "ios-install") {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        {t("ios_install_pour_notifs")}
        <ol className="mt-2 list-inside list-decimal space-y-1 text-xs">
          <li>{t("ios_install_etape_1").replace(/\*\*/g, "")}</li>
          <li>{t("ios_install_etape_2").replace(/\*\*/g, "")}</li>
          <li>{t("ios_install_etape_3").replace(/\*\*/g, "")}</li>
        </ol>
      </div>
    );
  }
  return (
    <button
      onClick={activer}
      disabled={statut === "loading"}
      className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
      style={{ backgroundColor: couleur }}
    >
      {statut === "loading" ? t("activation_en_cours") : t("recevoir_notifs")}
    </button>
  );
}

// ---------------------------------------------------------------------------
// INVITATION en HAUT de la page client — s'affiche automatiquement quand le
// client ouvre l'app INSTALLÉE (mode standalone) sans être encore abonné.
//
// Sur iPhone, l'abonnement aux notifications est impossible tant que la page
// est dans Safari : cocher la case à l'inscription ne suffit pas. Une fois la
// PWA installée et rouverte depuis l'écran d'accueil, ce bandeau propose le
// dernier appui (obligatoire — Apple exige un geste utilisateur). Si la
// permission a déjà été accordée, on ré-abonne en silence sans rien afficher.
// ---------------------------------------------------------------------------
export function InvitationNotifications({
  slug,
  restaurantId,
  vapidPublicKey,
  couleur,
}: {
  slug: string;
  restaurantId: string;
  vapidPublicKey: string | null;
  couleur: string;
}) {
  const t = useT();
  const [etat, setEtat] = useState<
    "cache" | "proposer" | "abonne" | "refuse" | "loading"
  >("cache");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    // Hors app installée : c'est la popup d'installation qui guide le client.
    if (!isStandalone) return;
    if (!("Notification" in window)) return;
    // Le client a explicitement refusé les notifications → on ne l'embête plus.
    if (localStorage.getItem(`walletiz_notif_refus_${slug}`) === "1") return;

    if (Notification.permission === "denied") {
      setEtat("refuse");
      return;
    }
    if (Notification.permission === "granted") {
      // Permission déjà accordée : on vérifie l'abonnement réel et on
      // (ré)abonne en silence s'il manque — aucun bandeau nécessaire.
      navigator.serviceWorker
        .getRegistration("/sw.js")
        .then((reg) => reg?.pushManager.getSubscription())
        .then(async (sub) => {
          if (sub) return; // déjà abonné
          await abonnerAuxNotifications(restaurantId, vapidPublicKey);
        })
        .catch(() => {});
      return;
    }
    // Permission "default" : l'appui final est requis par iOS → on propose.
    setEtat("proposer");
  }, [slug, restaurantId, vapidPublicKey]);

  async function activer() {
    setEtat("loading");
    const r = await abonnerAuxNotifications(restaurantId, vapidPublicKey);
    if (r.statut === "abonne") {
      setEtat("abonne");
      setTimeout(() => setEtat("cache"), 4000);
    } else if (r.statut === "refuse") {
      setEtat("refuse");
    } else {
      setEtat("cache");
    }
  }

  if (etat === "cache") return null;

  if (etat === "abonne") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center text-sm font-semibold text-green-800">
        {t("notifs_actives")}
      </div>
    );
  }

  if (etat === "refuse") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        {t("notifs_refusees")}
      </div>
    );
  }

  // "proposer" ou "loading"
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ borderColor: `${couleur}55`, backgroundColor: `${couleur}0d` }}
    >
      <p className="text-sm font-bold text-stone-900">
        {t("derniere_etape_notifs")}
      </p>
      <p className="mt-1 text-xs text-stone-600">{t("activer_notifs_desc")}</p>
      <button
        type="button"
        onClick={activer}
        disabled={etat === "loading"}
        className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: couleur }}
      >
        {etat === "loading" ? t("activation_en_cours") : t("recevoir_notifs")}
      </button>
    </div>
  );
}
