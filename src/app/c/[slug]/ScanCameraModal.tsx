"use client";

import { useEffect, useRef } from "react";
import jsQR from "jsqr";
import { useT } from "@/lib/langue";

// Modale caméra réutilisable : ouvre la caméra arrière, cherche un QR code
// et, dès qu'il correspond bien à CE commerce (/scan/<slug> ou /c/<slug>),
// appelle `onDetecte()`. Toute la logique de détection (BarcodeDetector natif
// ou jsQR en secours) est ici pour être partagée entre l'onglet « Scan » et
// le bouton de tampon des cartes.
//
// IMPORTANT (iPhone) : sur iOS, scanner le QR de caisse avec l'appareil photo
// ouvre Safari — jamais l'app installée. Le cookie de scan posé dans Safari
// n'atteint donc PAS la PWA (bacs à cookies séparés). Scanner DEPUIS l'app,
// via cette modale, est le seul moyen fiable de prendre un tampon en mode
// standalone.
export function ScanCameraModal({
  slug,
  onDetecte,
  onErreur,
  onFermer,
}: {
  slug: string;
  onDetecte: () => void;
  onErreur: (msg: string) => void;
  onFermer: () => void;
}) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Empêche de déclencher onDetecte plusieurs fois pour le même scan.
  const detecteRef = useRef(false);

  useEffect(() => {
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
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        interval = setInterval(async () => {
          const v = videoRef.current;
          if (!v || v.readyState < 2 || detecteRef.current) return;

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
            onErreur(t("qr_ne_correspond_pas"));
            return;
          }

          detecteRef.current = true;
          if (interval) clearInterval(interval);
          if (stream) stream.getTracks().forEach((tr) => tr.stop());
          onDetecte();
        }, 300);
      } catch (e) {
        onErreur(t("camera_impossible"));
        console.error(e);
      }
    })();

    return () => {
      annule = true;
      if (interval) clearInterval(interval);
      if (stream) stream.getTracks().forEach((tr) => tr.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onFermer}
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
          onClick={onFermer}
          className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-stone-900"
        >
          {t("fermer")}
        </button>
        <p className="p-3 text-center text-sm text-white">{t("pointez_camera")}</p>
      </div>
    </div>
  );
}
