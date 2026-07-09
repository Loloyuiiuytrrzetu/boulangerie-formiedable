"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { quitterImpersonation } from "./actions";

// Bandeau discret quand le super admin consulte le compte d'un restaurateur.
// Le nom du commerce est lu dans le cookie (non-httpOnly côté client).
export function BandeauImpersonation() {
  const router = useRouter();
  const [nom, setNom] = useState<string>("un restaurateur");
  const [enCours, startTransition] = useTransition();

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const c = cookies.find((c) => c.startsWith("walletiz_impersonate_nom="));
    if (c) setNom(decodeURIComponent(c.split("=")[1]));
  }, []);

  function quitter() {
    startTransition(async () => {
      await quitterImpersonation();
      router.push("/super-admin");
      router.refresh();
    });
  }

  return (
    <div className="sticky top-0 z-40 bg-bordeaux-800 px-4 py-2 text-center text-sm text-white shadow">
      👁️ Vous consultez le compte de <strong>{nom}</strong> (accès super admin)
      <button
        onClick={quitter}
        disabled={enCours}
        className="ml-3 rounded-md bg-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/30 disabled:opacity-60"
      >
        {enCours ? "…" : "Quitter"}
      </button>
    </div>
  );
}
