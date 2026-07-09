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

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bordeaux-950 text-lg text-white">⚙️</span>
            <div>
              <p className="font-bold text-bordeaux-800">Walletiz — Super admin</p>
              <p className="text-xs text-stone-500">{user.email}</p>
            </div>
          </div>
          <BoutonDeconnexion />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Restaurants inscrits</p>
            <p className="mt-1 text-3xl font-bold text-bordeaux-800">{lignes.length}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Clients fidélité</p>
            <p className="mt-1 text-3xl font-bold text-bordeaux-800">
              {lignes.reduce((s, r) => s + r.nb_clients, 0)}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Tampons distribués</p>
            <p className="mt-1 text-3xl font-bold text-bordeaux-800">
              {lignes.reduce((s, r) => s + r.nb_tampons, 0)}
            </p>
          </div>
        </div>

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
