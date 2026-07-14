"use client";

import { useEffect, useState } from "react";

// Grande scène animée du hero : logo qui pulse + cartes de fidélité qui
// flottent, avec tampons qui apparaissent en temps réel.
export function HeroTampons() {
  const [tampons, setTampons] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTampons((t) => (t >= 6 ? 0 : t + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Particules bordeaux qui montent en fond */}
      <Particules />

      {/* Halo lumineux central */}
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bordeaux-200/40 blur-3xl" />

      {/* Carte principale au centre */}
      <div className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 sm:w-80">
        <div className="anim-glow rounded-3xl border border-stone-200 bg-white p-5 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/exemple-patir.png"
              alt="Pâtir"
              className="h-10 w-10 shrink-0 rounded-xl object-cover"
            />
            <div>
              <p className="font-bold text-stone-900">Carte de fidélité</p>
              <p className="text-xs text-stone-500">Pâtir Boulangerie</p>
            </div>
            <span className="ml-auto text-sm font-bold text-bordeaux-800">
              {tampons} / 6
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Case key={i} rempli={i < tampons} index={i} />
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-bordeaux-50 p-2.5 text-center">
            <p className="text-xs font-semibold text-bordeaux-800">
              {tampons === 6 ? "🎉 Récompense débloquée !" : "1 pain offert à la 6ème visite"}
            </p>
          </div>
        </div>
      </div>

      {/* Mini-carte flottante haut-gauche */}
      <div className="anim-flotter absolute left-0 top-8 hidden w-40 sm:block">
        <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-sm">
              🍕
            </div>
            <p className="text-xs font-bold text-stone-900">Pizzéria</p>
          </div>
          <div className="mt-2 flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-full ${
                  i < 3 ? "bg-red-500" : "border border-dashed border-stone-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mini-carte flottante bas-droite */}
      <div className="anim-flotter-2 absolute bottom-8 right-0 hidden w-44 sm:block">
        <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100 text-sm">
              🍰
            </div>
            <p className="text-xs font-bold text-stone-900">Pâtisserie</p>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className={`h-3 w-3 rotate-45 ${
                  i < 5 ? "bg-pink-500" : "border border-dashed border-stone-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bulle notification en haut-droite */}
      <div className="anim-flotter-3 absolute right-4 top-4 hidden w-52 sm:block">
        <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-xl">
          <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bordeaux-800 text-white">
              🔔
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-stone-900">
                Boulangerie Bio
              </p>
              <p className="mt-0.5 truncate text-xs text-stone-600">
                Croissants -30% ce midi !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Case({ rempli, index }: { rempli: boolean; index: number }) {
  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-xl border-2 ${
        rempli
          ? "border-bordeaux-800"
          : "border-dashed border-stone-300"
      } bg-stone-50`}
      key={`${rempli}-${index}`}
    >
      {/* Logo Pâtir : gris (grayscale + opacity) quand vide, couleur normale
          + petite animation "pop" quand la case se remplit. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/exemple-patir.png"
        alt=""
        className={`h-full w-full object-cover transition ${
          rempli ? "anim-remplir" : "opacity-25 grayscale"
        }`}
      />
    </div>
  );
}

// Particules qui montent en fond du hero (fixe positions pour éviter
// mismatch SSR/CSR).
function Particules() {
  const particules = [
    { left: "5%", size: 4, dur: 14, delay: 0 },
    { left: "15%", size: 6, dur: 18, delay: 3 },
    { left: "28%", size: 3, dur: 12, delay: 6 },
    { left: "42%", size: 5, dur: 16, delay: 1 },
    { left: "58%", size: 4, dur: 15, delay: 8 },
    { left: "72%", size: 6, dur: 20, delay: 4 },
    { left: "85%", size: 3, dur: 13, delay: 10 },
    { left: "92%", size: 5, dur: 17, delay: 2 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particules.map((p, i) => (
        <div
          key={i}
          className="anim-particule absolute bottom-0 rounded-full bg-bordeaux-400"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// iPhone : cadre complet et réaliste (côtés, boutons, Dynamic Island, home
// indicator). L'écran est passé en children. On voit tout le téléphone,
// jamais un demi-appareil coupé.
// ---------------------------------------------------------------------------
export function IPhoneFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative mx-auto w-[280px] shrink-0 sm:w-[320px] ${className}`}
    >
      {/* Boutons latéraux gauche : mode silence + volume + / - */}
      <div className="pointer-events-none absolute -left-[3px] top-[110px] h-8 w-[3px] rounded-l bg-stone-800" />
      <div className="pointer-events-none absolute -left-[3px] top-[160px] h-14 w-[3px] rounded-l bg-stone-800" />
      <div className="pointer-events-none absolute -left-[3px] top-[230px] h-14 w-[3px] rounded-l bg-stone-800" />
      {/* Bouton latéral droit : power */}
      <div className="pointer-events-none absolute -right-[3px] top-[170px] h-20 w-[3px] rounded-r bg-stone-800" />

      {/* Corps du téléphone (bordure épaisse noire = châssis) */}
      <div className="relative rounded-[3rem] border-[12px] border-stone-900 bg-stone-900 shadow-2xl">
        {/* Écran */}
        <div className="relative overflow-hidden rounded-[2.2rem] bg-white">
          {/* Dynamic Island */}
          <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-stone-900" />

          {/* Contenu de l'écran */}
          {children}

          {/* Home indicator */}
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-20 h-1 w-24 -translate-x-1/2 rounded-full bg-stone-900/60" />
        </div>
      </div>
    </div>
  );
}

// Mockup d'un téléphone montrant une carte qui se remplit — pour la
// section "temps réel". iPhone complet.
export function MockupCartes() {
  const [progression, setProgression] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgression((p) => (p >= 8 ? 0 : p + 1));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <IPhoneFrame>
      {/* Barre de statut (heure + icônes) */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-stone-900">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <span>▂▄▆</span>
          <span>􀛨</span>
          <span>􀛩</span>
        </span>
      </div>

      {/* En-tête du commerce */}
      <div
        className="px-4 pb-6 pt-8 text-center text-white"
        style={{ backgroundColor: "#0d4b3e" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/exemple-patir.png"
          alt="Pâtir"
          className="mx-auto h-14 w-14 rounded-2xl border-2 border-white/20 object-cover"
        />
        <p className="mt-2 text-sm font-bold">Pâtir Boulangerie</p>
      </div>

      {/* Onglets */}
      <div className="bg-stone-100 p-1.5">
        <div
          className="rounded-xl py-1.5 text-center text-xs font-semibold text-white"
          style={{ backgroundColor: "#0d4b3e" }}
        >
          Cartes de fidélité
        </div>
      </div>

      {/* Carte */}
      <div className="p-4 pb-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-stone-900">Carte pain</p>
          <span className="text-xs font-bold" style={{ color: "#0d4b3e" }}>
            {progression} / 8
          </span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={`${i}-${i < progression}`}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                i < progression ? "border-[#0d4b3e]" : "border-dashed border-stone-300"
              } bg-stone-50`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/exemple-patir.png"
                alt=""
                className={`h-full w-full object-cover transition ${
                  i < progression ? "anim-remplir" : "opacity-25 grayscale"
                }`}
              />
            </div>
          ))}
        </div>
        <div
          className="mt-3 rounded-lg py-1.5 text-center text-xs font-semibold text-white"
          style={{ backgroundColor: "#0d4b3e" }}
        >
          {progression === 8 ? "🎉 Récompense !" : "1 pain offert à la 8ème"}
        </div>
      </div>
    </IPhoneFrame>
  );
}

// ---------------------------------------------------------------------------
// Graphique animé pour la section "statistiques" — reprend EXACTEMENT le
// design du dashboard restaurateur (GraphiquesTampons) : deux courbes SVG
// avec grille, zone dégradée, points et valeurs. Chiffres volontairement
// gonflés pour la vitrine.
// ---------------------------------------------------------------------------

const TRAIT = "#7A1E2E";
const nfFr = new Intl.NumberFormat("fr-FR");
function formatNb(n: number) {
  return nfFr.format(n);
}

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
  const puissance = Math.pow(10, Math.floor(Math.log10(maxBrut)));
  const bases = [1, 2, 5, 10];
  const max = bases.map((b) => b * puissance).find((v) => v >= maxBrut) ?? maxBrut;
  const paddingBas = 30;
  const paddingHaut = 28;
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
        <path
          d={`${path} L ${points[points.length - 1]?.x ?? 0} ${height - paddingBas} L ${paddingLat} ${height - paddingBas} Z`}
          fill={couleur}
          opacity={0.12}
        />
        <path d={path} fill="none" stroke={couleur} strokeWidth={2.5} />
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

export function GrapheAnime() {
  // Chiffres gonflés pour la vitrine (gros commerce imaginaire)
  const semaineJours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const semaineValeurs = [820, 1420, 1180, 1560, 1780, 2340, 2010];

  const moisNoms = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const moisValeurs = [4200, 4800, 5600, 6300, 7100, 7900, 8600, 8200, 7400, 6800, 6100, 5300];

  const totalSemaine = semaineValeurs.reduce((s, v) => s + v, 0);
  const totalAnnee = moisValeurs.reduce((s, v) => s + v, 0);

  return (
    <section className="w-full max-w-xl space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xl">
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-sm font-bold text-stone-900">Tampons cette semaine</h3>
          <span className="text-xs text-stone-500">
            Total : <strong style={{ color: TRAIT }}>{formatNb(totalSemaine)}</strong>
          </span>
        </div>
        <Courbe labels={semaineJours} valeurs={semaineValeurs} />
        <p className="mt-1 text-xs text-stone-400">
          Les 7 derniers jours (aujourd&apos;hui à droite).
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xl">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold text-stone-900">Tampons par mois</h3>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs font-semibold text-stone-700">
              2026
            </span>
            <span className="text-xs text-stone-500">
              Total : <strong style={{ color: TRAIT }}>{formatNb(totalAnnee)}</strong>
            </span>
          </div>
        </div>
        <Courbe labels={moisNoms} valeurs={moisValeurs} />
        <p className="mt-1 text-xs text-stone-400">
          Historique conservé — vous pouvez revenir sur les années précédentes.
        </p>
      </div>
    </section>
  );
}

// Téléphone qui reçoit des notifications push — iPhone complet.
export function NotifsAnimees() {
  return (
    <IPhoneFrame>
      {/* Écran verrouillé sombre */}
      <div className="bg-gradient-to-b from-stone-800 to-stone-900 pb-10">
        {/* Barre de statut blanche (lock screen) */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-white">
          <span>9:41</span>
          <span className="flex items-center gap-1 opacity-80">
            <span>▂▄▆</span>
            <span>􀛨</span>
            <span>􀛩</span>
          </span>
        </div>

        <div className="mt-8 px-4 pb-4">
          <p className="text-center text-xs font-medium text-white/70">
            lun. 14 juil.
          </p>
          <p className="text-center text-6xl font-thin text-white">14:30</p>
        </div>

        <div className="space-y-2 px-3">
          <NotifCard delay={0} logo="🥐" nom="Boulangerie Bio" msg="Croissants -30% ce midi jusqu'à 14h !" />
          <NotifCard delay={2.5} logo="☕" nom="Café du Coin" msg="Votre récompense vous attend ✨" />
        </div>
      </div>
    </IPhoneFrame>
  );
}

function NotifCard({
  delay,
  logo,
  nom,
  msg,
}: {
  delay: number;
  logo: string;
  nom: string;
  msg: string;
}) {
  return (
    <div
      className="anim-notif rounded-2xl bg-white/90 p-3 backdrop-blur"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bordeaux-100 text-lg">
          {logo}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-xs font-bold text-stone-900">{nom}</p>
            <span className="shrink-0 text-[10px] text-stone-500">maintenant</span>
          </div>
          <p className="mt-0.5 text-xs text-stone-700">{msg}</p>
        </div>
      </div>
    </div>
  );
}
