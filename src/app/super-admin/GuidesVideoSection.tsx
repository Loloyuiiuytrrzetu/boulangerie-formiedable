"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { GuideVideo } from "@/lib/types";
import {
  enregistrerGuideVideo,
  supprimerGuideVideo,
  deplacerGuideVideo,
  renommerGuideVideo,
} from "./guides-actions";

// Nettoie un nom de fichier pour un chemin de Storage sûr.
function nomSur(nom: string) {
  const ext = nom.split(".").pop()?.toLowerCase() ?? "mp4";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

// Gestion du GUIDE D'UTILISATION vidéo (super admin uniquement).
// L'upload du fichier se fait EN DIRECT vers Supabase Storage (navigateur →
// Storage), donc aucune limite de taille côté serveur Next : parfait pour des
// vidéos lourdes. Une fois le fichier envoyé, on enregistre juste la fiche.
export function GuidesVideoSection({ guides }: { guides: GuideVideo[] }) {
  const router = useRouter();
  const [titre, setTitre] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [progression, setProgression] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const inputFichier = useRef<HTMLInputElement>(null);

  async function ajouter() {
    setErreur(null);
    if (!titre.trim()) {
      setErreur("Donne un titre à la vidéo.");
      return;
    }
    if (!fichier) {
      setErreur("Choisis un fichier vidéo.");
      return;
    }
    if (!fichier.type.startsWith("video/")) {
      setErreur("Le fichier doit être une vidéo (MP4, MOV…).");
      return;
    }

    setEnvoi(true);
    setProgression(0);
    try {
      const supabase = createClient();
      const chemin = nomSur(fichier.name);
      const { error: errUp } = await supabase.storage
        .from("guides")
        .upload(chemin, fichier, {
          contentType: fichier.type,
          upsert: false,
        });
      if (errUp) {
        setErreur(`Échec de l'envoi : ${errUp.message}`);
        setEnvoi(false);
        return;
      }
      const { data } = supabase.storage.from("guides").getPublicUrl(chemin);
      const r = await enregistrerGuideVideo({
        titre,
        videoUrl: data.publicUrl,
        chemin,
      });
      if (r?.erreur) {
        setErreur(r.erreur);
        setEnvoi(false);
        return;
      }
      setTitre("");
      setFichier(null);
      if (inputFichier.current) inputFichier.current.value = "";
      router.refresh();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inattendue.");
    } finally {
      setEnvoi(false);
      setProgression(0);
    }
  }

  function supprimer(id: string) {
    if (!confirm("Supprimer cette vidéo du guide ?")) return;
    startTransition(async () => {
      await supprimerGuideVideo(id);
      router.refresh();
    });
  }

  function deplacer(id: string, sens: "haut" | "bas") {
    startTransition(async () => {
      await deplacerGuideVideo(id, sens);
      router.refresh();
    });
  }

  function renommer(id: string, actuel: string) {
    const nouveau = prompt("Nouveau titre :", actuel);
    if (nouveau === null) return;
    startTransition(async () => {
      await renommerGuideVideo(id, nouveau);
      router.refresh();
    });
  }

  return (
    <section className="mt-8 rounded-2xl border border-stone-200 bg-white">
      <div className="border-b border-stone-100 px-6 py-4">
        <h2 className="font-bold text-stone-900">
          🎥 Guide d&apos;utilisation (vidéos)
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Ces vidéos s&apos;affichent en bas du dashboard de tous les
          restaurateurs. Tu enregistres ta vidéo puis tu l&apos;ajoutes ici.
        </p>
      </div>

      {/* Formulaire d'ajout */}
      <div className="border-b border-stone-100 px-6 py-5">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre (ex. Comment scanner un client)"
            disabled={envoi}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <input
            ref={inputFichier}
            type="file"
            accept="video/*"
            onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
            disabled={envoi}
            className="text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-bordeaux-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-bordeaux-800"
          />
          <button
            type="button"
            onClick={ajouter}
            disabled={envoi}
            className="w-fit rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
          >
            {envoi
              ? progression > 0
                ? `Envoi… ${progression}%`
                : "Envoi en cours…"
              : "Ajouter la vidéo"}
          </button>
          {envoi && (
            <p className="text-xs text-stone-500">
              L&apos;envoi peut prendre un moment selon la taille de la vidéo. Ne
              ferme pas cette page.
            </p>
          )}
          {erreur && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {erreur}
            </p>
          )}
        </div>
      </div>

      {/* Liste des vidéos */}
      {guides.length === 0 ? (
        <p className="px-6 py-6 text-sm text-stone-500">
          Aucune vidéo pour l&apos;instant.
        </p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {guides.map((g, i) => (
            <li key={g.id} className="flex items-center gap-3 px-6 py-4">
              <span className="text-sm font-bold text-stone-400">{i + 1}</span>
              <video
                src={g.video_url}
                controls
                preload="metadata"
                className="h-20 w-32 shrink-0 rounded-lg bg-black object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-900">
                  {g.titre}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => deplacer(g.id, "haut")}
                  disabled={i === 0 || enCours}
                  title="Monter"
                  className="rounded-md border border-stone-300 px-2 py-1 text-xs text-stone-600 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => deplacer(g.id, "bas")}
                  disabled={i === guides.length - 1 || enCours}
                  title="Descendre"
                  className="rounded-md border border-stone-300 px-2 py-1 text-xs text-stone-600 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => renommer(g.id, g.titre)}
                  disabled={enCours}
                  className="rounded-md border border-stone-300 px-2 py-1 text-xs text-stone-600"
                >
                  Renommer
                </button>
                <button
                  type="button"
                  onClick={() => supprimer(g.id)}
                  disabled={enCours}
                  className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600"
                >
                  Suppr.
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
