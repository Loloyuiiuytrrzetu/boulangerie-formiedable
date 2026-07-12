"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Écran atteint via le lien envoyé par email. Supabase a déjà validé le
// token et créé une session temporaire. Il suffit de choisir un nouveau
// mot de passe pour la finaliser.
export default function MotDePasseReset() {
  const router = useRouter();
  const [mdp, setMdp] = useState("");
  const [mdp2, setMdp2] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [ok, setOk] = useState(false);

  async function valider(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (mdp.length < 8) return setErreur("Mot de passe trop court (8 caractères minimum).");
    if (mdp !== mdp2) return setErreur("Les deux mots de passe ne correspondent pas.");
    setEnCours(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: mdp });
    setEnCours(false);
    if (error) return setErreur("Impossible de changer le mot de passe. Redemandez un lien.");
    setOk(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="Walletiz"
            className="h-16 w-16 rounded-2xl object-cover shadow-md"
          />
          <span className="text-3xl font-extrabold text-bordeaux-800">Walletiz</span>
        </Link>
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-stone-900">Nouveau mot de passe</h1>
          {ok ? (
            <div className="mt-6 rounded-lg bg-green-50 px-3 py-4 text-sm text-green-800">
              ✅ Mot de passe changé. Redirection vers la connexion…
            </div>
          ) : (
            <form onSubmit={valider} className="mt-6 space-y-4">
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Nouveau mot de passe"
                value={mdp}
                onChange={(e) => setMdp(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200"
              />
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Confirmer le mot de passe"
                value={mdp2}
                onChange={(e) => setMdp2(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200"
              />
              {erreur && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
              )}
              <button
                type="submit"
                disabled={enCours}
                className="w-full rounded-lg bg-bordeaux-800 px-4 py-2.5 font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
              >
                {enCours ? "Mise à jour…" : "Enregistrer"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
