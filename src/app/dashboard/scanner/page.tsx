import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Carte } from "@/lib/types";
import { ScannerForm } from "./ScannerForm";
import { BoutonDeconnexion } from "../BoutonDeconnexion";

export const dynamic = "force-dynamic";

// Espace disponible pour le restaurateur ET son sous-compte :
// attribuer manuellement N tampons à un client par téléphone.
export default async function Scanner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Restaurant : soit possédé, soit rattaché via sous-compte actif
  const admin = createAdminClient();
  const { data: restoOwn } = await admin
    .from("restaurants")
    .select("id, nom, slug")
    .eq("owner_id", user.id)
    .maybeSingle();
  let restaurant = restoOwn;
  let sousCompte = false;
  if (!restaurant) {
    const { data: sc } = await admin
      .from("sous_comptes")
      .select("restaurant_id")
      .eq("user_id", user.id)
      .eq("actif", true)
      .maybeSingle();
    if (sc) {
      const { data: r } = await admin
        .from("restaurants")
        .select("id, nom, slug")
        .eq("id", sc.restaurant_id)
        .maybeSingle();
      restaurant = r;
      sousCompte = true;
    }
  }
  if (!restaurant) redirect("/login");

  const { data: cartes } = await admin
    .from("cartes")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("actif", true)
    .order("created_at", { ascending: true })
    .returns<Carte[]>();

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bordeaux-800 text-lg text-white">
              🎯
            </span>
            <div>
              <p className="font-bold text-bordeaux-800">Walletiz</p>
              <p className="text-xs text-stone-500">
                {sousCompte ? "Sous-compte — " : ""}
                {restaurant.nom}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!sousCompte && (
              <Link
                href="/dashboard"
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600 transition hover:bg-stone-100"
              >
                ← Dashboard
              </Link>
            )}
            <BoutonDeconnexion />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-6 py-8">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg">
          <h1 className="text-xl font-bold text-stone-900">Attribuer des tampons</h1>
          <p className="mt-1 text-sm text-stone-500">
            Entrez le numéro du client, choisissez la carte et le nombre de
            tampons. Si la carte se remplit, la récompense est créditée
            automatiquement dans son compte.
          </p>

          <ScannerForm cartes={cartes ?? []} />
        </div>
      </div>
    </main>
  );
}
