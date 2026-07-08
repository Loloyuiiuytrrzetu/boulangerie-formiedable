"use client";

import { deconnexion } from "./actions";

export function BoutonDeconnexion() {
  return (
    <form action={deconnexion}>
      <button
        type="submit"
        className="rounded-lg border border-stone-300 px-3.5 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
      >
        Se déconnecter
      </button>
    </form>
  );
}
