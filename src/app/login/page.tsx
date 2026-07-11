"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function FormulaireLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: motDePasse,
    });

    if (error) {
      setErreur("Email ou mot de passe incorrect.");
      setChargement(false);
      return;
    }

    // Redirection selon le rôle (super admin -> /super-admin)
    const { data: profil } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const redirect = searchParams.get("redirect");
    if (profil?.role === "super_admin") {
      router.push(redirect?.startsWith("/super-admin") ? redirect : "/super-admin");
    } else if (profil?.role === "sous_compte") {
      router.push("/dashboard/scanner");
    } else {
      router.push(redirect?.startsWith("/dashboard") ? redirect : "/dashboard");
    }
    router.refresh();
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
          <h1 className="text-xl font-bold text-stone-900">Espace commerçant</h1>
          <p className="mt-1 text-sm text-stone-500">
            Connectez-vous pour gérer votre carte de fidélité.
          </p>

          <form
            onSubmit={seConnecter}
            method="post"
            action="#"
            name="login"
            className="mt-6 space-y-4"
          >
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
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-stone-900 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200"
                placeholder="••••••••"
              />
            </div>

            {erreur && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="w-full rounded-lg bg-bordeaux-800 px-4 py-2.5 font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
            >
              {chargement ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <Link
            href="/mot-de-passe-oublie"
            className="mt-4 block text-center text-sm text-stone-500 hover:text-bordeaux-700"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          Pas encore de compte ? Contactez l&apos;équipe Walletiz pour rejoindre la plateforme.
        </p>
      </div>
    </main>
  );
}

export default function PageLogin() {
  return (
    <Suspense>
      <FormulaireLogin />
    </Suspense>
  );
}
