"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import jsQR from "jsqr";
import { scannerEtAjouterTampon } from "./actions";
import type { CarteAffichee } from "./EspaceClient";
import { useT } from "@/lib/langue";
import { useAutoTraduitListe } from "@/lib/auto-traduction";

// Scanner accessible depuis l'onglet "Scan" côté client : le client scanne
// lui-même le QR code affiché en caisse du commerce. Si le QR correspond
// bien à ce commerce, on lui attribue 1 tampon automatiquement (règle du
// restaurateur : 1 tampon/jour, respect du mode manuel, etc.).
export function ScannerClient({
  slug,
  couleur,
  cartes,
  onAnimation,
}: {
  slug: string;
  couleur: string;
  cartes: CarteAffichee[];
  onAnimation: () => void;
}) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [carteId, setCarteId] = useState<string>(cartes[0]?.id ?? "");
  const [enCours, startTransition] = useTransition();
  const carteChoisie = cartes.find((c) => c.id === carteId) ?? cartes[0];
  // Noms de cartes traduits automatiquement dans la langue du client
  const titresTraduits = useAutoTraduitListe(cartes.map((c) => c.titre));

  useEffect(() => {
    if (!ouvert) return;
    let stream: MediaStream | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    let annule = false;

    const winTyped = window as unknown as {
      BarcodeDetector?: new (o?: { formats?: string[] }) => {
        detect(v: HTMLVideoElement): Promise<{ rawValue?: string }[]>;
      };
    };
    const supportNatif = typeof winTyped.BarcodeDetector === "function";
    const detector = supportNatif
      ? new winTyped.BarcodeDetector!({ formats: ["qr_code"] })
      : null;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (annule) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        interval = setInterval(async () => {
          const v = videoRef.current;
          if (!v || v.readyState < 2) return;

          let raw: string | null = null;
          if (detector) {
            try {
              const codes = await detector.detect(v);
              if (codes.length > 0 && codes[0].rawValue) raw = codes[0].rawValue;
            } catch {
              // ignore
            }
          } else {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const w = v.videoWidth;
            const h = v.videoHeight;
            if (!w || !h) return;
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return;
            ctx.drawImage(v, 0, 0, w, h);
            const img = ctx.getImageData(0, 0, w, h);
            const code = jsQR(img.data, w, h, { inversionAttempts: "attemptBoth" });
            if (code?.data) raw = code.data;
          }

          if (!raw) return;

          // Le QR doit être le QR du commerce (/scan/<slug> ou /c/<slug>)
          let valide = false;
          try {
            const u = new URL(raw);
            const parts = u.pathname.split("/").filter(Boolean);
            valide =
              (parts[0] === "scan" || parts[0] === "c") && parts[1] === slug;
          } catch {
            valide = false;
          }
          if (!valide) {
            setErreur(t("qr_ne_correspond_pas"));
            return;
          }

          if (interval) clearInterval(interval);
          if (stream) stream.getTracks().forEach((t) => t.stop());
          setOuvert(false);

          startTransition(async () => {
            const r = await scannerEtAjouterTampon(slug, carteId);
            if (r?.erreur) setErreur(r.erreur);
            else if ("ok" in r && r.ok) {
              setSucces(t("tampon_ajoute"));
              if ("recompense" in r && r.recompense) {
                onAnimation();
              }
            }
          });
        }, 300);
      } catch (e) {
        setErreur(t("camera_impossible"));
        console.error(e);
      }
    })();

    return () => {
      annule = true;
      if (interval) clearInterval(interval);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvert, slug, carteId, onAnimation]);

  if (cartes.length === 0) {
    return (
      <div className="rounded-2xl bg-stone-50 p-6 text-center text-sm text-stone-500">
        {t("aucune_carte")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-stone-600">
        {t("scannez_pour_recevoir")}
      </p>

      {cartes.length > 1 && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-stone-600">
            {t("sur_quelle_carte")}
          </label>
          <select
            value={carteId}
            onChange={(e) => setCarteId(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:outline-none"
          >
            {cartes.map((c, i) => (
              <option key={c.id} value={c.id}>
                {titresTraduits[i] || c.titre} ({c.tampons_actuels}/{c.nombre_tampons_requis})
              </option>
            ))}
          </select>
        </div>
      )}

      {carteChoisie?.tampon_pris_aujourdhui ? (
        <div className="rounded-xl bg-stone-50 px-4 py-3 text-center text-sm text-stone-600">
          {t("tampon_deja_pris")}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setErreur(null);
            setSucces(null);
            setOuvert(true);
          }}
          disabled={enCours}
          className="w-full rounded-2xl px-6 py-6 text-lg font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: couleur }}
        >
          {enCours ? t("ajout_tampon_en_cours") : t("scanner_qr_commerce")}
        </button>
      )}

      {succes && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
          {succes}
        </p>
      )}
      {erreur && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {erreur}
        </p>
      )}

      {ouvert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOuvert(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="aspect-square w-full rounded-2xl object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="pointer-events-none absolute inset-8 rounded-2xl border-4 border-white/70" />
            <button
              type="button"
              onClick={() => setOuvert(false)}
              className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-stone-900"
            >
              {t("fermer")}
            </button>
            <p className="p-3 text-center text-sm text-white">
              {t("pointez_camera")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
