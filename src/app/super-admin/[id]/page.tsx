import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TAMPON_ICONES, iconeEmoji } from "@/lib/icons";
import type { ClientFidelite, Restaurant } from "@/lib/types";
import { MotDePasseForm } from "./MotDePasseForm";

// Vue support/debug : lecture seule de la configuration d'un restaurant
export default async function DetailRestaurant({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const admin = createAdminClient();
  const { data: restaurant } = await admin
    .from("restaurants")
    .select("*")
    .eq("id", (await params).id)
    .maybeSingle<Restaurant>();
  if (!restaurant) notFound();

  const { data: proprietaire } = await admin.auth.admin.getUserById(
    restaurant.owner_id
  );

  const { data: clients } = await admin
    .from("clients_fidelite")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .returns<ClientFidelite[]>();

  const nbTampons = (clients ?? []).reduce((s, c) => s + c.tampons_total, 0);
  const nbRecompenses = (clients ?? []).reduce(
    (s, c) => s + c.recompenses_reclamees,
    0
  );

  const config: [string, React.ReactNode][] = [
    ["Nom", restaurant.nom],
    ["Slug / URL publique", <code key="slug">/c/{restaurant.slug}</code>],
    ["Email du restaurateur", proprietaire?.user?.email ?? "—"],
    [
      "Couleur",
      <span key="couleur" className="inline-flex items-center gap-2">
        <span
          className="inline-block h-4 w-4 rounded-full border border-stone-200"
          style={{ backgroundColor: restaurant.couleur }}
        />
        <code>{restaurant.couleur}</code>
      </span>,
    ],
    [
      "Icône du tampon",
      `${iconeEmoji(restaurant.tampon_icone)} ${
        TAMPON_ICONES[restaurant.tampon_icone]?.label ?? restaurant.tampon_icone
      }`,
    ],
    ["Tampons requis", restaurant.nombre_tampons_requis],
    ["Récompense", restaurant.texte_recompense],
    ["Statut", restaurant.actif ? "Actif" : "Désactivé"],
    [
      "Date d'inscription",
      new Date(restaurant.created_at).toLocaleDateString("fr-FR", {
        dateStyle: "long",
      }),
    ],
  ];

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <Link
            href="/super-admin"
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-600 transition hover:bg-stone-100"
          >
            ← Retour
          </Link>
          <h1 className="font-bold text-stone-900">{restaurant.nom}</h1>
          {!restaurant.actif && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              désactivé
            </span>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Clients</p>
            <p className="mt-1 text-3xl font-bold text-bordeaux-800">
              {clients?.length ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Tampons distribués</p>
            <p className="mt-1 text-3xl font-bold text-bordeaux-800">{nbTampons}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="text-sm text-stone-500">Récompenses réclamées</p>
            <p className="mt-1 text-3xl font-bold text-bordeaux-800">{nbRecompenses}</p>
          </div>
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white">
          <h2 className="border-b border-stone-100 px-6 py-4 font-bold text-stone-900">
            Configuration (lecture seule)
          </h2>
          <dl className="divide-y divide-stone-100">
            {config.map(([cle, valeur]) => (
              <div key={String(cle)} className="flex items-center justify-between px-6 py-3 text-sm">
                <dt className="text-stone-500">{cle}</dt>
                <dd className="font-medium text-stone-900">{valeur}</dd>
              </div>
            ))}
          </dl>
        </section>

        <MotDePasseForm ownerId={restaurant.owner_id} />

        <section className="rounded-2xl border border-stone-200 bg-white">
          <h2 className="border-b border-stone-100 px-6 py-4 font-bold text-stone-900">
            Derniers clients fidélité
          </h2>
          {!clients?.length ? (
            <p className="px-6 py-6 text-sm text-stone-500">Aucun client pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-xs text-stone-400">
                    <th className="px-6 py-2 font-medium">Téléphone</th>
                    <th className="px-6 py-2 font-medium">Tampons en cours</th>
                    <th className="px-6 py-2 font-medium">Total</th>
                    <th className="px-6 py-2 font-medium">Récompenses</th>
                    <th className="px-6 py-2 font-medium">Dernier tampon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {clients.slice(0, 50).map((c) => (
                    <tr key={c.id}>
                      <td className="px-6 py-2.5 font-mono">{c.numero_telephone}</td>
                      <td className="px-6 py-2.5">
                        {c.tampons_actuels} / {restaurant.nombre_tampons_requis}
                      </td>
                      <td className="px-6 py-2.5">{c.tampons_total}</td>
                      <td className="px-6 py-2.5">{c.recompenses_reclamees}</td>
                      <td className="px-6 py-2.5">
                        {c.date_dernier_tampon
                          ? new Date(c.date_dernier_tampon).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
