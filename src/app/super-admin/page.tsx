import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Restaurant } from "@/lib/types";
import { BoutonDeconnexion } from "../dashboard/BoutonDeconnexion";
import { CreerRestaurateurForm } from "./CreerRestaurateurForm";
import { LigneRestaurant } from "./LigneRestaurant";

export type RestaurantAvecStats = Restaurant & {
  email: string;
  nb_clients: number;
  nb_tampons: number;
};

export default async function SuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profil?.role !== "super_admin") redirect("/dashboard");

  // Le super admin voit TOUT : on lit via la clé service_role
  const admin = createAdminClient();
  const { data: restaurants } = await admin
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Restaurant[]>();

  const { data: clients } = await admin
    .from("clients_fidelite")
    .select("restaurant_id, tampons_total");

  const { data: utilisateurs } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  const emailParId = new Map(
    (utilisateurs?.users ?? []).map((u) => [u.id, u.email ?? "—"])
  );

  const lignes: RestaurantAvecStats[] = (restaurants ?? []).map((r) => {
    const fiches = (clients ?? []).filter((c) => c.restaurant_id === r.id);
    return {
      ...r,
      email: emailParId.get(r.owner_id) ?? "—",
      nb_clients: fiches.length,
      nb_tampons: fiches.reduce((somme, c) => somme + c.tampons_total, 0),
    };
  });

  // ---------------------------------------------------------------------------
  // REVENUS
  // - Frais de mise en place : 120€ facturés une fois par restaurant créé
  // - Abonnement mensuel : 64€/mois
  // - Abonnement annuel   : 614€/an (614/12 ≈ 51,17€/mois en MRR)
  // Seuls les abonnements 'essai' ou 'actif' comptent dans les revenus
  // récurrents (les 'annule' ou 'expire' sont exclus).
  // ---------------------------------------------------------------------------
  const PRIX_SETUP = 120;
  const PRIX_MENSUEL = 64;
  const PRIX_ANNUEL = 614;

  const actifs = lignes.filter(
    (r) => r.abonnement_statut === "essai" || r.abonnement_statut === "actif"
  );
  const nbMensuels = actifs.filter((r) => r.abonnement_type === "mensuel").length;
  const nbAnnuels = actifs.filter((r) => r.abonnement_type === "annuel").length;

  const mrr = nbMensuels * PRIX_MENSUEL + nbAnnuels * (PRIX_ANNUEL / 12);
  const arr = mrr * 12;
  const totalSetup = lignes.length * PRIX_SETUP;

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="Walletiz"
              className="h-10 w-10 rounded-xl object-cover shadow-sm"
            />
            <div>
              <p className="font-bold text-bordeaux-800">Walletiz — Super admin</p>
              <p className="text-xs text-stone-500">{user.email}</p>
            </div>
          </div>
          <BoutonDeconnexion />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* ============ REVENUS ============ */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
              Clients (restaurants)
            </p>
            <p className="mt-2 text-4xl font-black text-bordeaux-800">
              {lignes.length}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              dont <strong>{nbMensuels}</strong> mensuels ·{" "}
              <strong>{nbAnnuels}</strong> annuels
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
              Revenus récurrents
            </p>
            <p className="mt-2 text-4xl font-black text-bordeaux-800">
              {fmt(mrr)}€
              <span className="text-base font-medium text-stone-500"> / mois</span>
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Soit <strong>{fmt(arr)}€ / an</strong> (ARR)
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
              Frais de service encaissés
            </p>
            <p className="mt-2 text-4xl font-black text-bordeaux-800">
              {fmt(totalSetup)}€
            </p>
            <p className="mt-1 text-xs text-stone-500">
              {lignes.length} × {PRIX_SETUP}€ (frais de mise en place)
            </p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="rounded-2xl border border-stone-200 bg-white">
            <h2 className="border-b border-stone-100 px-6 py-4 font-bold text-stone-900">
              Restaurants ({lignes.length})
            </h2>
            {lignes.length === 0 ? (
              <p className="px-6 py-8 text-sm text-stone-500">
                Aucun restaurant pour le moment. Créez le premier compte
                restaurateur ci-contre.
              </p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {lignes.map((r) => (
                  <LigneRestaurant key={r.id} restaurant={r} />
                ))}
              </ul>
            )}
          </section>

          <CreerRestaurateurForm />
        </div>
      </div>
    </main>
  );
}
