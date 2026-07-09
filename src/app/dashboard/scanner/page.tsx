import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Carte } from "@/lib/types";
import { ScannerForm } from "./ScannerForm";
import { BoutonDeconnexion } from "../BoutonDeconnexion";

export const dynamic = "force-dynamic";

// Accessible au restaurateur ET à son sous-compte.
// Attribue manuellement N tampons à un client :
//   - par téléphone (saisie manuelle)
//   - ou automatiquement via ?c=<token> venant du QR code du client
export default async function Scanner({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  // Si un token client est passé (venant d'un scan de QR), on pré-charge
  // ses infos pour éviter d'avoir à retaper son téléphone.
  const { c: tokenClient } = await searchParams;
  let clientPrecharge: { telephone: string; identite: string | null } | null = null;
  if (tokenClient) {
    const { data: cli } = await admin
      .from("clients_fidelite")
      .select("numero_telephone, identite, restaurant_id")
      .eq("token_public", tokenClient)
      .maybeSingle();
    if (cli && cli.restaurant_id === restaurant.id) {
      clientPrecharge = { telephone: cli.numero_telephone, identite: cli.identite };
    }
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
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

      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-lg sm:p-6">
          <h1 className="text-xl font-bold text-stone-900">
            {clientPrecharge
              ? "Client identifié ✓"
              : "Scanner le QR code du client"}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {clientPrecharge
              ? "Choisissez la carte et le nombre de tampons à attribuer."
              : "Demandez au client d'ouvrir son onglet Info sur sa page Walletiz, puis scannez son QR code personnel."}
          </p>

          <ScannerForm
            cartes={cartes ?? []}
            telephonePrecharge={clientPrecharge?.telephone ?? ""}
            identitePrecharge={clientPrecharge?.identite ?? null}
          />
        </div>
      </div>
    </main>
  );
}
