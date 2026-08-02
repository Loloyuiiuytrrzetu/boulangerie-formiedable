"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useLangueDashboard, useTDash } from "@/lib/langue-dashboard";
import { listerTamponsRecents } from "./actions";

export type TamponRecent = {
  id: string;
  identite: string | null;
  telephone: string | null;
  carteTitre: string | null;
  nombre: number;
  created_at: string;
};

const RAFRAICHIR_MS = 12000;

// Liste PAGINÉE et réductible des derniers tampons donnés (visible côté
// restaurateur ET sous-compte). Page par page pour ne jamais avoir une liste
// interminable. Se rafraîchit automatiquement (nouveaux tampons en direct).
export function DerniersTampons({
  tampons: tamponsInitiaux,
  totalInitial,
  parPage,
  timezone,
}: {
  tampons: TamponRecent[];
  totalInitial: number;
  parPage: number;
  timezone: string;
}) {
  const t = useTDash();
  const { langue } = useLangueDashboard();
  const [ouvert, setOuvert] = useState(true);
  const [tampons, setTampons] = useState<TamponRecent[]>(tamponsInitiaux);
  const [total, setTotal] = useState(totalInitial);
  const [page, setPage] = useState(0);
  const [enCours, startTransition] = useTransition();
  const pageRef = useRef(0);
  pageRef.current = page;

  const nbPages = Math.max(1, Math.ceil(total / parPage));

  const fmt = new Intl.DateTimeFormat(langue, {
    timeZone: timezone,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const charger = useCallback(
    (p: number, silencieux = false) => {
      const cible = Math.max(0, p);
      const faire = async () => {
        const r = await listerTamponsRecents(cible);
        if (!("ok" in r) || !r.ok) return;
        if (r.tampons.length === 0 && cible > 0) {
          setPage(cible - 1);
          return;
        }
        setTampons(r.tampons);
        setTotal(r.total);
        setPage(r.page);
      };
      if (silencieux) faire();
      else startTransition(faire);
    },
    []
  );

  // Rafraîchit la page courante régulièrement (nouveaux tampons en direct).
  useEffect(() => {
    const id = setInterval(() => charger(pageRef.current, true), RAFRAICHIR_MS);
    return () => clearInterval(id);
  }, [charger]);

  function allerA(p: number) {
    if (p < 0 || p >= nbPages || enCours) return;
    charger(p);
  }

  return (
    <div className="mx-auto mt-5 max-w-xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-bold text-stone-900">
          🧾 {t("derniers_tampons")}
        </span>
        <span className="text-xs font-medium text-stone-500">
          {ouvert ? `▲ ${t("reduire_liste")}` : `▼ ${t("afficher_liste")}`}
        </span>
      </button>

      {ouvert && (
        <div className="border-t border-stone-100">
          {tampons.length === 0 ? (
            <p className="px-5 py-4 text-sm text-stone-500">
              {t("aucun_tampon_recent")}
            </p>
          ) : (
            <>
              <ul className={`divide-y divide-stone-100 ${enCours ? "opacity-50" : ""}`}>
                {tampons.map((tp) => (
                  <li
                    key={tp.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-900">
                        {tp.identite?.trim() || tp.telephone || "—"}
                      </p>
                      <p className="truncate text-xs text-stone-500">
                        {tp.carteTitre ?? ""}
                        {tp.telephone && tp.identite ? ` · ${tp.telephone}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-bordeaux-800">
                        +{tp.nombre}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {fmt.format(new Date(tp.created_at))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination page par page */}
              <div className="flex items-center justify-between gap-3 border-t border-stone-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => allerA(page - 1)}
                  disabled={page <= 0 || enCours}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-bordeaux-300 hover:text-bordeaux-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹ {t("page_precedente")}
                </button>
                <span className="text-xs font-medium text-stone-600">
                  {t("page_x_sur_y", {
                    page: String(page + 1),
                    pages: String(nbPages),
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => allerA(page + 1)}
                  disabled={page >= nbPages - 1 || enCours}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-bordeaux-300 hover:text-bordeaux-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("page_suivante")} ›
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
