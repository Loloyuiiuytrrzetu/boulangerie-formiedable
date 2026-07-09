"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Scanner de QR code via la caméra du navigateur.
// Utilise l'API native BarcodeDetector (Chrome / Safari 17+). Sinon, message
// pour utiliser l'appareil photo natif du téléphone.
export function ScannerCamera({ slugRestaurant }: { slugRestaurant?: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [supporte, setSupporte] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // @ts-expect-error API non typée
    setSupporte(typeof window.BarcodeDetector === "function");
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    let stream: MediaStream | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    let annule = false;

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

        // @ts-expect-error API non typée
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        interval = setInterval(async () => {
          try {
            const codes = await detector.detect(video);
            if (codes.length > 0) {
              const raw = codes[0].rawValue as string;
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
                // Pas une URL, ignore
              }
              setErreur("Ce QR code n'est pas un QR code client Walletiz.");
            }
          } catch {
            // Erreur de détection ponctuelle, ignore
          }
        }, 400);
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

  if (supporte === false) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        📷 Votre navigateur ne peut pas scanner directement. <strong>Ouvrez l&apos;
        appareil photo natif de votre téléphone</strong> et pointez-le sur le QR
        code du client : il détectera le QR et ouvrira directement cette page
        avec le client identifié.
      </div>
    );
  }

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
              className="aspect-square w-full rounded-2xl object-cover"
            />
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
