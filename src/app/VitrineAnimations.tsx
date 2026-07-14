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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bordeaux-800 text-lg text-white">
              🥐
            </div>
            <div>
              <p className="font-bold text-stone-900">Carte de fidélité</p>
              <p className="text-xs text-stone-500">Café du Coin</p>
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
              {tampons === 6 ? "🎉 Récompense débloquée !" : "1 café offert à la 6ème visite"}
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
      className={`aspect-square rounded-xl border-2 ${
        rempli
          ? "border-bordeaux-800 bg-bordeaux-800"
          : "border-dashed border-stone-200 bg-stone-50"
      } flex items-center justify-center text-lg`}
      key={`${rempli}-${index}`}
    >
      {rempli && <span className="anim-remplir text-white">✓</span>}
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

// Mockup d'un téléphone montrant une carte qui se remplit — pour la
// section "temps réel".
export function MockupCartes() {
  const [progression, setProgression] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgression((p) => (p >= 8 ? 0 : p + 1));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Cadre téléphone */}
      <div className="relative w-64 rounded-[2.5rem] border-[10px] border-stone-900 bg-white shadow-2xl sm:w-72">
        <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-stone-900" />
        <div className="overflow-hidden rounded-[1.8rem]">
          {/* En-tête du commerce */}
          <div className="bg-bordeaux-800 px-4 py-6 text-center text-white">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
              🥐
            </div>
            <p className="mt-2 text-sm font-bold">Boulangerie du Coin</p>
          </div>

          {/* Onglets */}
          <div className="bg-stone-100 p-1.5">
            <div className="rounded-xl bg-bordeaux-800 py-1.5 text-center text-xs font-semibold text-white">
              Cartes de fidélité
            </div>
          </div>

          {/* Carte */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-stone-900">Carte café</p>
              <span className="text-xs font-bold text-bordeaux-800">
                {progression} / 8
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={`${i}-${i < progression}`}
                  className={`aspect-square rounded-lg border-2 ${
                    i < progression
                      ? "border-bordeaux-800 bg-bordeaux-800"
                      : "border-dashed border-stone-200 bg-stone-50"
                  } flex items-center justify-center text-xs`}
                >
                  {i < progression && (
                    <span className="anim-remplir text-white">☕</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-bordeaux-50 py-1.5 text-center text-xs font-semibold text-bordeaux-800">
              {progression === 8 ? "🎉 Récompense !" : "1 café offert à la 8ème"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Graphique animé pour la section "statistiques temps réel".
export function GrapheAnime() {
  const jours = ["L", "M", "M", "J", "V", "S", "D"];
  const valeurs = [45, 62, 38, 71, 88, 95, 52];
  const max = Math.max(...valeurs);

  return (
    <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Cette semaine
          </p>
          <p className="mt-1 text-2xl font-black text-bordeaux-800">451 tampons</p>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
          +18%
        </span>
      </div>

      <div className="flex h-40 items-end justify-between gap-2">
        {valeurs.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end">
              <div
                className="anim-barre w-full rounded-t-md bg-gradient-to-t from-bordeaux-800 to-bordeaux-500"
                style={{
                  height: `${(v / max) * 100}%`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            </div>
            <span className="text-xs font-medium text-stone-500">{jours[i]}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4">
        <div>
          <p className="text-xs text-stone-500">Clients fidèles</p>
          <p className="text-xl font-bold text-stone-900">128</p>
        </div>
        <div>
          <p className="text-xs text-stone-500">Aujourd&apos;hui</p>
          <p className="text-xl font-bold text-stone-900">
            <span className="anim-pulse inline-block h-2 w-2 rounded-full bg-green-500 align-middle" />{" "}
            52
          </p>
        </div>
      </div>
    </div>
  );
}

// Téléphone qui reçoit des notifications push en boucle.
export function NotifsAnimees() {
  return (
    <div className="relative w-64 sm:w-72">
      <div className="relative rounded-[2.5rem] border-[10px] border-stone-900 bg-gradient-to-b from-stone-800 to-stone-900 pb-8 shadow-2xl">
        <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black" />
        <div className="mt-6 px-4 pb-4">
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
    </div>
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
