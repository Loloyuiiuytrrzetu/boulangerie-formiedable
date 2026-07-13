"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";

// Scanner QR code via la caméra du navigateur. Utilise l'API BarcodeDetector
// si disponible (Chrome Android), sinon jsQR côté JS (marche partout —
// iOS Safari inclus). Le scanner est intégré au site : aucune app native
// requise, le restaurateur clique sur le bouton et scan directement.
export function ScannerCamera({ slugRestaurant }: { slugRestaurant?: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!ouvert) return;
    let stream: MediaStream | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    let annule = false;

    // Détecte le support natif BarcodeDetector (Chrome / Android) sinon
    // on retombera sur jsQR (pure JS, marche partout).
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
        // iOS Safari nécessite playsInline pour ne pas basculer en fullscreen.
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
            // Fallback jsQR : dessine le frame vidéo sur un canvas, extrait
            // les pixels, décode.
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

          if (raw) {
            try {
              const u = new URL(raw);
              const c = u.searchParams.get("c");
              if (c) {
                setOuvert(false);
                router.push(`/dashboard/scanner?c=${c}`);
                router.refresh();
                return;
              }
            } catch {
              // Pas une URL
            }
            setErreur("Ce QR code n'est pas un QR code client Walletiz.");
          }
        }, 300);
      } catch (e) {
        setErreur(
          "Impossible d'accéder à la caméra. Autorisez l'accès dans les réglages du navigateur."
        );
        console.error(e);
      }
    })();

    return () => {
      annule = true;
      if (interval) clearInterval(interval);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [ouvert, router, slugRestaurant]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErreur(null);
          setOuvert(true);
        }}
        className="w-full rounded-2xl bg-bordeaux-800 px-6 py-6 text-lg font-bold text-white shadow-lg transition hover:bg-bordeaux-700"
      >
        📷 Scanner le QR code du client
      </button>
      <p className="mt-2 text-center text-xs text-stone-500">
        Le client vous montre son QR code (onglet Info de sa page)
      </p>

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
              ✕ Fermer
            </button>
            <p className="p-3 text-center text-sm text-white">
              Pointez la caméra vers le QR code du client
            </p>
            {erreur && (
              <p className="mx-3 mb-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
                {erreur}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
