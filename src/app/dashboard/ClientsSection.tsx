"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { listerClients } from "./actions";
import { useTDash } from "@/lib/langue-dashboard";
import type { ClientListe } from "@/lib/types";

// Intervalle de rafraîchissement automatique de la page courante (ms).
// La liste reflète ainsi « en direct » les désinscriptions et les
// changements de nom, sans que le restaurateur ait à recharger.
const RAFRAICHIR_MS = 10000;

export function ClientsSection({
  clientsInitiaux,
  totalInitial,
  timezone,
  parPage,
}: {
  clientsInitiaux: ClientListe[];
  totalInitial: number;
  timezone: string;
  parPage: number;
}) {
  const t = useTDash();
  const [clients, setClients] = useState<ClientListe[]>(clientsInitiaux);
  const [total, setTotal] = useState(totalInitial);
  const [page, setPage] = useState(0);
  const [enCours, startTransition] = useTransition();
  // Ref pour que le rafraîchissement automatique lise toujours la page courante.
  const pageRef = useRef(0);
  pageRef.current = page;

  const nbPages = Math.max(1, Math.ceil(total / parPage));

  // Charge une page. En mode « silencieux » (rafraîchissement auto), on ne
  // déclenche pas d'état de chargement visible pour éviter tout clignotement.
  const charger = useCallback(
    (p: number, silencieux = false) => {
      const cible = Math.max(0, p);
      const faire = async () => {
        const r = await listerClients(cible);
        if (!("ok" in r) || !r.ok) return;
        // Si la page demandée est désormais vide (des clients ont disparu) et
        // qu'on n'est pas sur la première page, on recule d'une page.
        if (r.clients.length === 0 && cible > 0) {
          setPage(cible - 1);
          return;
        }
        setClients(r.clients);
        setTotal(r.total);
        setPage(r.page);
      };
      if (silencieux) faire();
      else startTransition(faire);
    },
    []
  );

  // Rafraîchissement automatique + au retour sur l'onglet.
  useEffect(() => {
    const id = setInterval(() => charger(pageRef.current, true), RAFRAICHIR_MS);
    const surFocus = () => {
      if (document.visibilityState === "visible") charger(pageRef.current, true);
    };
    document.addEventListener("visibilitychange", surFocus);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", surFocus);
    };
  }, [charger]);

  function allerA(p: number) {
    if (p < 0 || p >= nbPages || enCours) return;
    charger(p);
  }

  // Glissement tactile gauche/droite pour changer de page.
  const toucheX = useRef<number | null>(null);
  function surTouchStart(e: React.TouchEvent) {
    toucheX.current = e.touches[0]?.clientX ?? null;
  }
  function surTouchEnd(e: React.TouchEvent) {
    if (toucheX.current === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - toucheX.current;
    toucheX.current = null;
    if (delta < -50) allerA(page + 1); // glissé vers la gauche → page suivante
    else if (delta > 50) allerA(page - 1); // glissé vers la droite → précédente
  }

  function formaterDate(d: string | null): string {
    if (!d) return t("jamais_visite");
    try {
      return new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: timezone,
      }).format(new Date(d + "T12:00:00"));
    } catch {
      return d;
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-stone-900">👤 {t("mes_clients")}</h2>
        <span className="text-sm font-medium text-stone-500">
          {t("clients_au_total", { n: String(total) })}
        </span>
      </div>
      <p className="mt-1 text-sm text-stone-500">{t("mes_clients_desc")}</p>

      {clients.length === 0 ? (
        <p className="mt-6 rounded-xl bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
          {t("aucun_client")}
        </p>
      ) : (
        <>
          <div
            className="mt-5 overflow-hidden rounded-xl border border-stone-200"
            onTouchStart={surTouchStart}
            onTouchEnd={surTouchEnd}
          >
            {/* En-têtes (cachés en très petit écran) */}
            <div className="hidden bg-stone-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-500 sm:grid sm:grid-cols-[1.4fr_1.2fr_0.7fr_1fr_auto] sm:gap-3">
              <span>{t("col_nom")}</span>
              <span>{t("col_telephone")}</span>
              <span className="text-center">{t("col_tampons")}</span>
              <span>{t("col_derniere_visite")}</span>
              <span className="w-6" />
            </div>

            <ul className={`divide-y divide-stone-100 ${enCours ? "opacity-50" : ""}`}>
              {clients.map((c) => (
                <li
                  key={c.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3 text-sm sm:grid-cols-[1.4fr_1.2fr_0.7fr_1fr_auto]"
                >
                  <span className="min-w-0 truncate font-semibold text-stone-900">
                    {c.identite?.trim() || (
                      <span className="italic text-stone-400">
                        {t("client_sans_nom")}
                      </span>
                    )}
                  </span>
                  <span className="truncate text-stone-600">
                    {c.numero_telephone}
                  </span>
                  <span className="text-stone-700 sm:text-center">
                    <span className="sm:hidden">{t("col_tampons")}: </span>
                    <span className="font-semibold text-bordeaux-800">
                      {c.tampons_total}
                    </span>
                  </span>
                  <span className="text-stone-500">
                    <span className="sm:hidden">{t("col_derniere_visite")}: </span>
                    {formaterDate(c.date_dernier_tampon)}
                  </span>
                  <span
                    className="justify-self-end text-base"
                    title={
                      c.notifications_push_actif
                        ? t("notifs_actives_client")
                        : t("notifs_inactives_client")
                    }
                  >
                    {c.notifications_push_actif ? "🔔" : "🔕"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination : boutons + indicateur. Le glissement tactile fait
              la même chose sur mobile. */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => allerA(page - 1)}
              disabled={page <= 0 || enCours}
              className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-bordeaux-300 hover:text-bordeaux-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹ {t("page_precedente")}
            </button>

            <span className="text-sm font-medium text-stone-600">
              {t("page_x_sur_y", {
                page: String(page + 1),
                pages: String(nbPages),
              })}
            </span>

            <button
              type="button"
              onClick={() => allerA(page + 1)}
              disabled={page >= nbPages - 1 || enCours}
              className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-bordeaux-300 hover:text-bordeaux-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("page_suivante")} ›
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-stone-400 sm:hidden">
            {t("glisser_pages_clients")}
          </p>
        </>
      )}
    </section>
  );
}
