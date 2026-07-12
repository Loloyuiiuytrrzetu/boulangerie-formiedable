"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { utilisateurEffectif } from "@/lib/impersonate";
import { getWebPush } from "@/lib/push";

async function chargerRestaurant() {
  const effectif = await utilisateurEffectif();
  if (!effectif) redirect("/login");
  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id, nom, logo_url, timezone, slug")
    .eq("owner_id", effectif.userId)
    .maybeSingle();
  return { admin, restaurant };
}

// Convertit un input datetime-local (heure murale locale du fuseau du
// commerce) en instant UTC. Ex : 2026-07-11T16:00 en Guadeloupe (-04:00)
// → 2026-07-11T20:00:00Z.
function localeVersUtc(dateLocale: string, timezone: string): Date {
  // On construit une date "naïve" en supposant UTC puis on calcule le
  // décalage réel du fuseau à cet instant pour corriger.
  const [datePart, timePart] = dateLocale.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = (timePart ?? "00:00").split(":").map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm);
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(new Date(naive));
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;
  const asIfLocal = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  const offset = asIfLocal - naive;
  return new Date(naive - offset);
}

async function envoyerAuxAbonnes(restaurantId: string, notification: {
  titre: string;
  message: string;
  logoUrl: string | null;
  slug: string;
}) {
  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("restaurant_id", restaurantId);

  if (!subs || subs.length === 0) return 0;

  const wp = getWebPush();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const payload = JSON.stringify({
    titre: notification.titre,
    message: notification.message,
    icon: notification.logoUrl ?? "/favicon.ico",
    url: `${siteUrl}/c/${notification.slug}`,
  });

  let envois = 0;
  const aSupprimer: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
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
  if (aSupprimer.length > 0) {
    await admin.from("push_subscriptions").delete().in("id", aSupprimer);
  }
  return envois;
}

export async function envoyerNotificationMaintenant(formData: FormData) {
  const { admin, restaurant } = await chargerRestaurant();
  if (!restaurant) return { erreur: "Commerce introuvable." };

  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { erreur: "Message obligatoire." };
  if (message.length > 300) return { erreur: "Message trop long (300 caractères max)." };
  const titre = restaurant.nom;

  const { data: notif, error } = await admin
    .from("notifications_push")
    .insert({
      restaurant_id: restaurant.id,
      titre,
      message,
      envoyee_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !notif) return { erreur: "Impossible d'enregistrer." };

  let envois = 0;
  try {
    envois = await envoyerAuxAbonnes(restaurant.id, {
      titre,
      message,
      logoUrl: restaurant.logo_url,
      slug: restaurant.slug,
    });
    await admin
      .from("notifications_push")
      .update({ nb_envois: envois })
      .eq("id", notif.id);
  } catch (e) {
    return { erreur: e instanceof Error ? e.message : "Échec de l'envoi." };
  }

  revalidatePath("/dashboard");
  return { ok: true, envois };
}

export async function programmerNotification(formData: FormData) {
  const { admin, restaurant } = await chargerRestaurant();
  if (!restaurant) return { erreur: "Commerce introuvable." };

  const message = String(formData.get("message") ?? "").trim();
  const dateLocale = String(formData.get("date_locale") ?? "").trim();
  if (!message || !dateLocale)
    return { erreur: "Message et date obligatoires." };
  if (message.length > 300) return { erreur: "Message trop long (300 caractères max)." };
  const titre = restaurant.nom;

  const timezone = restaurant.timezone ?? "Europe/Paris";
  const dateUtc = localeVersUtc(dateLocale, timezone);
  if (isNaN(dateUtc.getTime())) return { erreur: "Date invalide." };
  if (dateUtc.getTime() < Date.now() - 60_000)
    return { erreur: "La date programmée doit être dans le futur." };

  const { error } = await admin.from("notifications_push").insert({
    restaurant_id: restaurant.id,
    titre,
    message,
    date_programmee: dateUtc.toISOString(),
  });
  if (error) return { erreur: "Impossible de programmer la notification." };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function supprimerNotification(formData: FormData) {
  const { admin, restaurant } = await chargerRestaurant();
  if (!restaurant) return { erreur: "Commerce introuvable." };
  const id = String(formData.get("id") ?? "");
  if (!id) return { erreur: "Identifiant manquant." };
  await admin
    .from("notifications_push")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);
  revalidatePath("/dashboard");
  return { ok: true };
}
