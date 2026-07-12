"use client";

import { useRef, useState } from "react";
import {
  envoyerNotificationMaintenant,
  programmerNotification,
  supprimerNotification,
} from "./notifications-actions";

export type NotificationPush = {
  id: string;
  titre: string;
  message: string;
  date_programmee: string | null;
  envoyee_at: string | null;
  nb_envois: number;
  created_at: string;
};

function formaterDate(iso: string | null, timezone: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// Datetime-local minimum : maintenant, en heure locale du fuseau du commerce
function nowLocaleForInput(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
}

export function NotificationsPushSection({
  notifications,
  timezone,
  nbAbonnes,
  pushConfigure,
}: {
  notifications: NotificationPush[];
  timezone: string;
  nbAbonnes: number;
  pushConfigure: boolean;
}) {
  const [ongletActif, setOngletActif] = useState<"immediat" | "programme">("immediat");
  const [msgImmediat, setMsgImmediat] = useState<string | null>(null);
  const [msgProgramme, setMsgProgramme] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const programmees = notifications.filter((n) => !n.envoyee_at && n.date_programmee);
  const envoyees = notifications.filter((n) => n.envoyee_at);

  // Refs synchrones pour éviter les doubles envois : setState est
  // asynchrone, un clic rapide peut soumettre 2-3 fois avant que le
  // bouton ne soit désactivé visuellement.
  const envoiEnCoursRef = useRef(false);
  const programmationEnCoursRef = useRef(false);

  async function submitImmediat(formData: FormData) {
    if (envoiEnCoursRef.current) return;
    envoiEnCoursRef.current = true;
    setEnCours(true);
    setMsgImmediat(null);
    try {
      const res = await envoyerNotificationMaintenant(formData);
      if (res?.erreur) setMsgImmediat("❌ " + res.erreur);
      else setMsgImmediat(`✅ Notification envoyée à ${res?.envois ?? 0} abonné(s).`);
    } finally {
      envoiEnCoursRef.current = false;
      setEnCours(false);
    }
  }

  async function submitProgramme(formData: FormData) {
    if (programmationEnCoursRef.current) return;
    programmationEnCoursRef.current = true;
    setEnCours(true);
    setMsgProgramme(null);
    try {
      const res = await programmerNotification(formData);
      if (res?.erreur) setMsgProgramme("❌ " + res.erreur);
      else setMsgProgramme("✅ Notification programmée.");
    } finally {
      programmationEnCoursRef.current = false;
      setEnCours(false);
    }
  }

  return (
    <section className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-bold text-stone-900">🔔 Notifications push</h2>
        <p className="mt-1 text-sm text-stone-600">
          Envoyez un message à tous vos clients abonnés — il apparaîtra comme
          une notification sur leur téléphone avec le logo de votre commerce.
        </p>
        <p className="mt-2 text-xs text-stone-500">
          {nbAbonnes === 0
            ? "Aucun client abonné pour le moment."
            : `${nbAbonnes} client${nbAbonnes > 1 ? "s" : ""} abonné${nbAbonnes > 1 ? "s" : ""}.`}
          {" · Fuseau : "}
          <span className="font-medium">{timezone}</span>
        </p>
      </div>

      {!pushConfigure && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Les clés VAPID ne sont pas configurées sur le serveur. Les envois
          échoueront tant que les variables{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code>{" "}
          et <code className="rounded bg-amber-100 px-1">VAPID_PRIVATE_KEY</code>{" "}
          ne sont pas renseignées.
        </div>
      )}

      <div className="flex gap-2 border-b border-stone-200">
        <button
          onClick={() => setOngletActif("immediat")}
          className={`px-4 py-2 text-sm font-semibold transition ${
            ongletActif === "immediat"
              ? "border-b-2 border-bordeaux-800 text-bordeaux-800"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Envoi immédiat
        </button>
        <button
          onClick={() => setOngletActif("programme")}
          className={`px-4 py-2 text-sm font-semibold transition ${
            ongletActif === "programme"
              ? "border-b-2 border-bordeaux-800 text-bordeaux-800"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Programmer
        </button>
      </div>

      {ongletActif === "immediat" ? (
        <form action={submitImmediat} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-600">Message</label>
            <textarea
              name="message"
              required
              maxLength={300}
              rows={3}
              placeholder="Ex : -20% sur tous les croissants ce samedi."
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-bordeaux-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={enCours}
            className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
          >
            {enCours ? "Envoi…" : "Envoyer maintenant"}
          </button>
          {msgImmediat && <p className="text-sm">{msgImmediat}</p>}
        </form>
      ) : (
        <form action={submitProgramme} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-600">Message</label>
            <textarea
              name="message"
              required
              maxLength={300}
              rows={3}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-bordeaux-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600">
              Date et heure (fuseau {timezone})
            </label>
            <input
              type="datetime-local"
              name="date_locale"
              required
              min={nowLocaleForInput(timezone)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-bordeaux-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-stone-500">
              La notification sera envoyée à l&apos;heure locale de votre commerce.
            </p>
          </div>
          <button
            type="submit"
            disabled={enCours}
            className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
          >
            {enCours ? "…" : "Programmer"}
          </button>
          {msgProgramme && <p className="text-sm">{msgProgramme}</p>}
        </form>
      )}

      {programmees.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-stone-800">Programmées</h3>
          <ul className="space-y-2">
            {programmees.map((n) => (
              <li
                key={n.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-900">
                    {n.titre}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-stone-600">{n.message}</p>
                  <p className="mt-1 text-xs text-bordeaux-700">
                    ⏰ {formaterDate(n.date_programmee, timezone)}
                  </p>
                </div>
                <form action={async (fd) => { await supprimerNotification(fd); }}>
                  <input type="hidden" name="id" value={n.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-red-600 hover:text-red-800"
                  >
                    Annuler
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      {envoyees.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-stone-800">Historique</h3>
          <ul className="space-y-2">
            {envoyees.slice(0, 10).map((n) => (
              <li
                key={n.id}
                className="rounded-xl border border-stone-200 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-stone-900">
                    {n.titre}
                  </p>
                  <span className="shrink-0 text-xs text-stone-500">
                    {formaterDate(n.envoyee_at, timezone)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-stone-600">{n.message}</p>
                <p className="mt-1 text-xs text-stone-500">
                  Envoyée à {n.nb_envois} abonné{n.nb_envois > 1 ? "s" : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
