"use client";

import { useMemo, useState } from "react";
import type { TamponHistorique } from "@/lib/types";
import { useTDash } from "@/lib/langue-dashboard";

// Palette du composant : bordeaux + reprise de la couleur principale.
const TRAIT = "#7A1E2E";

// ---------------------------------------------------------------------------
// TIMEZONE — Tout le calcul de "aujourd'hui" et "derniers 7 jours" est fait
// dans le fuseau horaire DU COMMERCE (pas du navigateur), et la date-clé
// utilisée est la même chaîne "YYYY-MM-DD" que celle stockée en base
// (date_attribution). Historiquement, mélanger new Date() côté client
// (fuseau du navigateur) avec des date_attribution stockées en fuseau
// commerce faisait "glisser" les tampons d'un jour à l'autre pour tout
// utilisateur consultant depuis un fuseau différent du commerce.
// ---------------------------------------------------------------------------

// Date du jour dans un fuseau horaire donné, au format "YYYY-MM-DD".
function dateDuJour(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Soustrait n jours à une date ISO "YYYY-MM-DD" (arithmétique UTC pour
// éviter tout effet de fuseau horaire ou d'heure d'été).
function isoMoinsJours(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d) - n * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

// Jour de la semaine (0 = dimanche, 6 = samedi) pour une date ISO — calculé
// en UTC pour rester cohérent quel que soit le navigateur.
function jourSemaine(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

// Chaîne "YYYY-MM-DD" -> Date UTC (pour extraire année/mois sans dérive)
function parseDateUTC(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// Formate un nombre pour l'axe / les points :
//   0-999      : "42"
//   1 000+     : "6 000"  (séparateur milliers)
const nfFr = new Intl.NumberFormat("fr-FR");
function formatNb(n: number) {
  return nfFr.format(n);
}

// Composant SVG générique — courbe + points + valeurs
function Courbe({
  labels,
  valeurs,
  couleur = TRAIT,
  height = 220,
}: {
  labels: string[];
  valeurs: number[];
  couleur?: string;
  height?: number;
}) {
  const largeur = 900;
  const maxBrut = Math.max(1, ...valeurs);
  // Arrondit le max au multiple supérieur "propre" (1,2,5,10,20,50,100…)
  const puissance = Math.pow(10, Math.floor(Math.log10(maxBrut)));
  const bases = [1, 2, 5, 10];
  const max = bases.map((b) => b * puissance).find((v) => v >= maxBrut) ?? maxBrut;
  const paddingBas = 30;
  const paddingHaut = 28;
  // paddingLat adaptatif : "10 000" prend plus de place que "50"
  const paddingLat = formatNb(max).length > 4 ? 70 : 50;

  const zoneLargeur = largeur - paddingLat - 20;
  const points = valeurs.map((v, i) => {
    const x =
      paddingLat + (i / Math.max(1, labels.length - 1)) * zoneLargeur;
    const y =
      paddingHaut +
      (1 - v / max) * (height - paddingBas - paddingHaut);
    return { x, y };
  });
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${largeur} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grille */}
        {[0, 1, 2, 3, 4].map((i) => {
          const y = paddingHaut + (i / 4) * (height - paddingBas - paddingHaut);
          const valeur = Math.round(max - (i / 4) * max);
          return (
            <g key={i}>
              <line
                x1={paddingLat}
                x2={largeur - 10}
                y1={y}
                y2={y}
                stroke="#e7e5e4"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLat - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                fill="#78716c"
                fontWeight={500}
              >
                {formatNb(valeur)}
              </text>
            </g>
          );
        })}
        {/* Zone sous la courbe */}
        <path
          d={`${path} L ${points[points.length - 1]?.x ?? 0} ${height - paddingBas} L ${paddingLat} ${height - paddingBas} Z`}
          fill={couleur}
          opacity={0.12}
        />
        {/* Courbe */}
        <path d={path} fill="none" stroke={couleur} strokeWidth={2.5} />
        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill={couleur} />
            {valeurs[i] > 0 && (
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fontSize={11}
                fill={couleur}
                fontWeight={600}
              >
                {formatNb(valeurs[i])}
              </text>
            )}
          </g>
        ))}
        {/* Labels axe X */}
        {labels.map((l, i) => (
          <text
            key={i}
            x={points[i]?.x ?? 0}
            y={height - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#78716c"
          >
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function GraphiquesTampons({
  historique,
  couleur = TRAIT,
  timezone = "Europe/Paris",
}: {
  historique: TamponHistorique[];
  couleur?: string;
  timezone?: string;
}) {
  // "Aujourd'hui" côté commerce (pas côté navigateur). Toute la suite est
  // calculée à partir de cette chaîne ISO, jamais d'un objet Date local.
  const aujourdHuiIso = useMemo(() => dateDuJour(timezone), [timezone]);

  // Années disponibles dans l'historique (au moins l'année en cours au sens
  // du fuseau du commerce).
  const anneeCourante = parseDateUTC(aujourdHuiIso).getUTCFullYear();
  const annees = useMemo(() => {
    const set = new Set<number>([anneeCourante]);
    historique.forEach((h) =>
      set.add(parseDateUTC(h.date_attribution).getUTCFullYear())
    );
    return Array.from(set).sort((a, b) => b - a);
  }, [historique, anneeCourante]);

  const [annee, setAnnee] = useState(anneeCourante);

  // Graphique 1 : 7 derniers jours (aujourd'hui inclus) — dans le fuseau
  // du commerce, avec des ISO strictement égales à celles de la base.
  const semaine = useMemo(() => {
    const jours: string[] = [];
    const valeurs: number[] = [];
    const jourNoms = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    for (let i = 6; i >= 0; i--) {
      const iso = isoMoinsJours(aujourdHuiIso, i);
      jours.push(jourNoms[jourSemaine(iso)]);
      const total = historique
        .filter((h) => h.date_attribution === iso)
        .reduce((s, h) => s + h.nombre, 0);
      valeurs.push(total);
    }
    return { jours, valeurs };
  }, [historique, aujourdHuiIso]);

  // Graphique 2 : 12 mois de l'année sélectionnée — mois calculé en UTC
  // à partir de la date_attribution (elle-même stockée en fuseau commerce).
  const mois = useMemo(() => {
    const noms = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const valeurs = new Array(12).fill(0) as number[];
    historique.forEach((h) => {
      const d = parseDateUTC(h.date_attribution);
      if (d.getUTCFullYear() === annee) valeurs[d.getUTCMonth()] += h.nombre;
    });
    return { noms, valeurs };
  }, [historique, annee]);

  const totalSemaine = semaine.valeurs.reduce((s, v) => s + v, 0);
  const totalAnnee = mois.valeurs.reduce((s, v) => s + v, 0);
  const t = useTDash();

  return (
    <section className="space-y-4">
      {/* Graphique semaine */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-sm font-bold text-stone-900">{t("tampons_cette_semaine")}</h3>
          <span className="text-xs text-stone-500">
            {t("total")} : <strong style={{ color: couleur }}>{totalSemaine}</strong>
          </span>
        </div>
        <Courbe labels={semaine.jours} valeurs={semaine.valeurs} couleur={couleur} />
        <p className="mt-1 text-xs text-stone-400">
          {t("sept_derniers_jours")}
        </p>
      </div>

      {/* Graphique mois de l'année */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold text-stone-900">{t("tampons_par_mois")}</h3>
          <div className="flex items-center gap-2">
            <select
              value={annee}
              onChange={(e) => setAnnee(parseInt(e.target.value, 10))}
              className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs font-semibold text-stone-700"
            >
              {annees.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <span className="text-xs text-stone-500">
              {t("total")} : <strong style={{ color: couleur }}>{totalAnnee}</strong>
            </span>
          </div>
        </div>
        <Courbe labels={mois.noms} valeurs={mois.valeurs} couleur={couleur} />
        <p className="mt-1 text-xs text-stone-400">
          {t("historique_conserve")}
        </p>
      </div>
    </section>
  );
}
