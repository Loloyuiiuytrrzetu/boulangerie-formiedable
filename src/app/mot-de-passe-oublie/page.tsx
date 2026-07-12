"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/mot-de-passe-reset`,
    });
    setEnCours(false);
    if (error) setErreur("Impossible d'envoyer l'email. Vérifiez l'adresse.");
    else setEnvoye(true);
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
          <h1 className="text-xl font-bold text-stone-900">Mot de passe oublié</h1>
          <p className="mt-1 text-sm text-stone-500">
            Entrez votre email. Nous vous envoyons un lien pour choisir un
            nouveau mot de passe.
          </p>

          {envoye ? (
            <div className="mt-6 rounded-lg bg-green-50 px-3 py-4 text-sm text-green-800">
              ✅ Email envoyé à <strong>{email}</strong>. Vérifiez votre boîte
              de réception (et les spams).
            </div>
          ) : (
            <form onSubmit={envoyer} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-stone-900 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200"
                  placeholder="vous@exemple.fr"
                />
              </div>
              {erreur && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
              )}
              <button
                type="submit"
                disabled={enCours}
                className="w-full rounded-lg bg-bordeaux-800 px-4 py-2.5 font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
              >
                {enCours ? "Envoi…" : "Envoyer le lien"}
              </button>
            </form>
          )}

          <Link
            href="/login"
            className="mt-4 block text-center text-sm text-stone-500 hover:text-bordeaux-700"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </main>
  );
}
