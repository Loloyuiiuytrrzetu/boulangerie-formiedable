"use client";

import { useState } from "react";
import { useLangueDashboard, useTDash } from "@/lib/langue-dashboard";

export type TamponRecent = {
  id: string;
  identite: string | null;
  telephone: string | null;
  carteTitre: string | null;
  nombre: number;
  created_at: string;
};

// Liste réductible des derniers tampons donnés (visible côté restaurateur ET
// sous-compte). Permet de vérifier rapidement à qui on vient d'attribuer des
// tampons. Le restaurateur/sous-compte peut la réduire s'il ne veut pas la voir.
export function DerniersTampons({
  tampons,
  timezone,
}: {
  tampons: TamponRecent[];
  timezone: string;
}) {
  const t = useTDash();
  const { langue } = useLangueDashboard();
  const [ouvert, setOuvert] = useState(true);

  const fmt = new Intl.DateTimeFormat(langue, {
    timeZone: timezone,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

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
            <ul className="divide-y divide-stone-100">
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
          )}
        </div>
      )}
    </div>
  );
}
