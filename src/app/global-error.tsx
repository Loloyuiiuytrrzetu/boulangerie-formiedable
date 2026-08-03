"use client";

import { useEffect } from "react";

// Barrière d'erreur de tout dernier recours (erreur dans le layout racine).
// Même logique que error.tsx : on récupère automatiquement d'un ChunkLoadError
// après redéploiement au lieu de rester bloqué sur un écran blanc.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = `${error?.name ?? ""} ${error?.message ?? ""}`;
    const estChunk =
      /ChunkLoadError|Loading chunk|dynamically imported module|Importing a module script failed|Failed to fetch/i.test(
        msg
      );
    if (estChunk && typeof window !== "undefined") {
      try {
        const cle = "walletiz_dernier_reload";
        const dernier = Number(sessionStorage.getItem(cle) || 0);
        if (Date.now() - dernier > 8000) {
          sessionStorage.setItem(cle, String(Date.now()));
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fafaf9",
          margin: 0,
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ fontSize: 40, margin: 0 }}>😕</p>
          <h1 style={{ fontSize: 18, color: "#1c1917" }}>
            Un petit souci est survenu
          </h1>
          <div
            style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}
          >
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#7A1E2E",
                color: "#fff",
                border: 0,
                borderRadius: 8,
                padding: "10px 20px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Recharger la page
            </button>
            <button
              onClick={() => reset()}
              style={{
                background: "#fff",
                color: "#57534e",
                border: "1px solid #d6d3d1",
                borderRadius: 8,
                padding: "10px 20px",
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
