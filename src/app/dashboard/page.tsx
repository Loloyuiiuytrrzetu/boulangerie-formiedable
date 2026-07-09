import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type {
  Carte,
  Recompense,
  Restaurant,
  Section,
  SousCompte,
  TamponHistorique,
} from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { ConfigForm } from "./ConfigForm";
import { CartesSection } from "./CartesSection";
import { SectionsSection } from "./SectionsSection";
import { CreationForm } from "./CreationForm";
import { BoutonDeconnexion } from "./BoutonDeconnexion";
import { SousCompteSection } from "./SousCompteSection";
import { GraphiquesTampons } from "./GraphiquesTampons";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Un super admin est redirigé vers son propre espace
  const { data: profil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profil?.role === "super_admin") redirect("/super-admin");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle<Restaurant>();

  // Cartes, récompenses et statistiques du commerce
  let cartes: Carte[] = [];
  let recompenses: Recompense[] = [];
  let sections: Section[] = [];
  let sousCompte: SousCompte | null = null;
  let historique: TamponHistorique[] = [];
  let nbClients = 0;
  let nbTampons = 0;
  if (restaurant) {
    const [resCartes, resRecompenses, resClients, resSc, resSections] = await Promise.all([
      supabase
        .from("cartes")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("recompenses")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("clients_fidelite")
        .select("tampons_total")
        .eq("restaurant_id", restaurant.id),
      supabase
        .from("sous_comptes")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .maybeSingle<SousCompte>(),
      supabase
        .from("sections")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("ordre", { ascending: true }),
    ]);
    // Historique des tampons (tout, pour permettre la navigation entre années)
    const { data: resHistorique } = await supabase
      .from("tampons_historique")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("date_attribution", { ascending: true });
    historique = (resHistorique as TamponHistorique[]) ?? [];

    cartes = (resCartes.data as Carte[]) ?? [];
    recompenses = (resRecompenses.data as Recompense[]) ?? [];
    nbClients = resClients.data?.length ?? 0;
    nbTampons = resClients.data?.reduce((somme, c) => somme + c.tampons_total, 0) ?? 0;
    sousCompte = resSc.data ?? null;
    sections = (resSections.data as Section[]) ?? [];

    // Auto-réparation si aucune section (migration incomplète)
    if (sections.length === 0) {
      const admin = createAdminClient();
      await admin.from("sections").insert([
        {
          restaurant_id: restaurant.id,
          type: "cartes",
          titre: "Cartes de fidélité",
          ordre: 0,
          supprimable: false,
        },
        {
          restaurant_id: restaurant.id,
          type: "info",
          titre: "Info",
          texte:
            "Présentez ce QR code au commerçant à chaque passage pour recevoir vos tampons.",
          ordre: 100,
          supprimable: false,
        },
      ]);
      const { data: refetch } = await admin
        .from("sections")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("ordre", { ascending: true });
      sections = (refetch as Section[]) ?? [];
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const urlPublique = restaurant ? `${siteUrl}/c/${restaurant.slug}` : null;
  // Le QR code pointe vers /scan/[slug] : cette route pose un cookie de
  // "scan valide 15 min" avant de rediriger vers la page client.
  const urlScan = restaurant ? `${siteUrl}/scan/${restaurant.slug}` : null;
  const qrDataUrl = urlScan
    ? await QRCode.toDataURL(urlScan, {
        width: 480,
        margin: 2,
        color: { dark: restaurant?.couleur_qr ?? "#380b15", light: "#ffffff" },
      })
    : null;

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bordeaux-800 text-lg text-white">✦</span>
            <div>
              <p className="font-bold text-bordeaux-800">Walletiz</p>
              <p className="text-xs text-stone-500">{user.email}</p>
            </div>
          </div>
          <BoutonDeconnexion />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {!restaurant ? (
          <CreationForm />
        ) : (
          <>
            {!restaurant.actif && (
              <p className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Votre commerce est actuellement <strong>désactivé</strong> : la page
                client n&apos;est plus accessible. Contactez l&apos;équipe Walletiz.
              </p>
            )}

            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <p className="text-sm text-stone-500">Clients fidélité</p>
                <p className="mt-1 text-3xl font-bold text-bordeaux-800">{nbClients}</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <p className="text-sm text-stone-500">Tampons distribués</p>
                <p className="mt-1 text-3xl font-bold text-bordeaux-800">{nbTampons}</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-stone-200 bg-white p-5 sm:col-span-1">
                <p className="text-sm text-stone-500">Votre page client</p>
                <a
                  href={urlPublique!}
                  target="_blank"
                  className="mt-1 block truncate text-sm font-semibold text-bordeaux-700 underline"
                >
                  /c/{restaurant.slug}
                </a>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-8">
                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <Link
                    href="/dashboard/scanner"
                    className="flex items-center justify-between rounded-xl bg-bordeaux-800 px-4 py-3 font-semibold text-white transition hover:bg-bordeaux-700"
                  >
                    <span>🎯 Attribuer des tampons à un client</span>
                    <span>→</span>
                  </Link>
                </div>
                <GraphiquesTampons
                  historique={historique}
                  couleur={restaurant.couleur}
                />
                <ConfigForm restaurant={restaurant} />
                <CartesSection cartes={cartes} recompenses={recompenses} />
                <SectionsSection sections={sections} />
                <SousCompteSection sousCompte={sousCompte} />
              </div>

              <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6 text-center">
                <h2 className="font-bold text-stone-900">Votre QR code</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Imprimez-le et affichez-le en caisse : vos clients le scannent
                  pour ouvrir leurs cartes de fidélité.
                </p>
                {qrDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR code vers ${urlPublique}`}
                    className="mx-auto mt-4 w-56 rounded-xl border border-stone-100"
                  />
                )}
                <a
                  href={qrDataUrl!}
                  download={`qrcode-${restaurant.slug}.png`}
                  className="mt-4 inline-block rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700"
                >
                  Télécharger le QR code
                </a>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
