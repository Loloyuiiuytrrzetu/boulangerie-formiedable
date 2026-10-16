"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { utilisateurEffectif } from "@/lib/impersonate";
import { chargerClientsEmail, envoyerEmailsParLots } from "@/lib/email";

async function chargerRestaurant() {
  const effectif = await utilisateurEffectif();
  if (!effectif) redirect("/login");
  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("id, nom, logo_url, timezone, slug, couleur, owner_id")
    .eq("owner_id", effectif.userId)
    .maybeSingle();
  return { admin, restaurant };
}

// Email PRINCIPAL du commerce (le compte propriétaire, pas le sous-compte) :
// c'est l'adresse à laquelle les clients répondent (reply-to).
async function emailPrincipal(
  admin: ReturnType<typeof createAdminClient>,
  ownerId: string
): Promise<string | null> {
  try {
    const { data } = await admin.auth.admin.getUserById(ownerId);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

// Convertit un input datetime-local (heure murale locale du fuseau du
// commerce) en instant UTC. Ex : 2026-07-11T16:00 en Guadeloupe (-04:00)
// → 2026-07-11T20:00:00Z.
function localeVersUtc(dateLocale: string, timezone: string): Date {
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

type InfoCommerce = {
  id: string;
  nom: string;
  slug: string;
  couleur: string;
  owner_id: string;
};

async function envoyerAuxClients(
  restaurant: InfoCommerce,
  sujet: string,
  message: string
): Promise<number> {
  const admin = createAdminClient();
  const clients = await chargerClientsEmail(admin, restaurant.id);
  if (clients.length === 0) return 0;

  const replyTo = await emailPrincipal(admin, restaurant.owner_id);
  const { envois } = await envoyerEmailsParLots({
    clients,
    sujet,
    nomCommerce: restaurant.nom,
    message,
    replyTo,
    slug: restaurant.slug,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://walletiz.fr",
    couleur: restaurant.couleur ?? "#7A1E2E",
  });
  return envois;
}

export async function envoyerNotificationMaintenant(formData: FormData) {
  const { admin, restaurant } = await chargerRestaurant();
  if (!restaurant) return { erreur: "Commerce introuvable." };

  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { erreur: "Message obligatoire." };
  if (message.length > 2000) return { erreur: "Message trop long (2000 caractères max)." };
  // Objet de l'email (optionnel). Par défaut : le nom du commerce.
  const objet = String(formData.get("objet") ?? "").trim().slice(0, 150);
  const sujet = objet || restaurant.nom;

  const { data: notif, error } = await admin
    .from("notifications_push")
    .insert({
      restaurant_id: restaurant.id,
      titre: sujet,
      message,
      envoyee_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !notif) return { erreur: "Impossible d'enregistrer." };

  let envois = 0;
  try {
    envois = await envoyerAuxClients(restaurant as InfoCommerce, sujet, message);
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
  if (message.length > 2000) return { erreur: "Message trop long (2000 caractères max)." };
  const objet = String(formData.get("objet") ?? "").trim().slice(0, 150);
  const sujet = objet || restaurant.nom;

  const timezone = restaurant.timezone ?? "Europe/Paris";
  const dateUtc = localeVersUtc(dateLocale, timezone);
  if (isNaN(dateUtc.getTime())) return { erreur: "Date invalide." };
  if (dateUtc.getTime() < Date.now() - 60_000)
    return { erreur: "La date programmée doit être dans le futur." };

  const { error } = await admin.from("notifications_push").insert({
    restaurant_id: restaurant.id,
    titre: sujet,
    message,
    date_programmee: dateUtc.toISOString(),
  });
  if (error) return { erreur: "Impossible de programmer l'email." };

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
