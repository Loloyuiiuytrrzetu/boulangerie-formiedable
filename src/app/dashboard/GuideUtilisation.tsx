"use client";

import { useLangueDashboard } from "@/lib/langue-dashboard";
import type { Langue } from "@/lib/i18n";
import type { GuideVideo } from "@/lib/types";

// Titres traduits en local (petit vocabulaire dédié → pas besoin de charger
// tout l'i18n du dashboard).
const TITRE: Record<Langue, string> = {
  fr: "Guide d'utilisation",
  en: "How-to guide",
  es: "Guía de uso",
  de: "Anleitung",
  zh: "使用指南",
  ar: "دليل الاستخدام",
  ru: "Руководство",
};
const DESC: Record<Langue, string> = {
  fr: "Des vidéos courtes pour prendre en main Walletiz.",
  en: "Short videos to get started with Walletiz.",
  es: "Vídeos cortos para empezar con Walletiz.",
  de: "Kurze Videos für den Einstieg in Walletiz.",
  zh: "帮助您快速上手 Walletiz 的短视频。",
  ar: "مقاطع فيديو قصيرة للبدء مع Walletiz.",
  ru: "Короткие видео для знакомства с Walletiz.",
};

// Guide d'utilisation en vidéo, affiché en bas du dashboard restaurateur.
// Rien ne s'affiche s'il n'y a aucune vidéo (le super admin ne les a pas
// encore ajoutées).
export function GuideUtilisation({ guides }: { guides: GuideVideo[] }) {
  const { langue } = useLangueDashboard();
  if (!guides || guides.length === 0) return null;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-bold text-stone-900">
        🎥 {TITRE[langue] ?? TITRE.fr}
      </h2>
      <p className="mt-1 text-sm text-stone-500">{DESC[langue] ?? DESC.fr}</p>

      {/* Rangée de petites vidéos carrées que l'on fait défiler
          horizontalement (comme un carrousel). Chaque vidéo se lit en plein
          écran au tap. */}
      <div className="-mx-2 mt-5 flex snap-x gap-4 overflow-x-auto px-2 pb-2">
        {guides.map((g) => (
          <div key={g.id} className="w-44 shrink-0 snap-start">
            <video
              src={g.video_url}
              controls
              preload="metadata"
              className="h-44 w-44 rounded-xl border border-stone-200 bg-black object-cover"
            />
            <p className="mt-2 truncate text-sm font-semibold text-stone-800">
              {g.titre}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
