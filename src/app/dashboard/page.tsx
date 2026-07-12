import { redirect } from "next/navigation";
import QRCode from "qrcode";
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
import { utilisateurEffectif } from "@/lib/impersonate";
import { dateDuJour } from "@/lib/utils";
import { ConfigForm } from "./ConfigForm";
import { CartesSection } from "./CartesSection";
import { SectionsSection } from "./SectionsSection";
import { CreationForm } from "./CreationForm";
import { SousCompteSection } from "./SousCompteSection";
import { GraphiquesTampons } from "./GraphiquesTampons";
import { BandeauImpersonation } from "./BandeauImpersonation";
import { NavigationSidebar } from "./NavigationSidebar";
import { NotificationsPushSection, type NotificationPush } from "./NotificationsPushSection";
import { getVapidPublicKey } from "@/lib/push";

export default async function Dashboard() {
  const effectif = await utilisateurEffectif();
  if (!effectif) redirect("/login");
  // Un super admin non-en-impersonation est renvoyé vers son espace
  if (effectif.role === "super_admin") redirect("/super-admin");

  // Utilise systématiquement le client admin dans les queries : ça permet
  // aussi bien au restaurateur qu'au super admin en impersonation d'avoir
  // le même comportement. La sécurité est faite au niveau du helper.
  const supabase = createAdminClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", effectif.userId)
    .maybeSingle<Restaurant>();

  // Cartes, récompenses et statistiques du commerce
  let cartes: Carte[] = [];
  let recompenses: Recompense[] = [];
  let sections: Section[] = [];
  let sousCompte: SousCompte | null = null;
  let historique: TamponHistorique[] = [];
  let notificationsPush: NotificationPush[] = [];
  let nbAbonnes = 0;
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
    // Tampons distribués aujourd'hui uniquement, selon le fuseau horaire du
    // commerce. Chaque jour à minuit local, ce compteur repart de zéro tout
    // seul — sans opération de maintenance, c'est un filtre à la lecture.
    const aujourdHui = dateDuJour(restaurant.timezone ?? "Europe/Paris");
    nbTampons = historique
      .filter((h) => h.date_attribution === aujourdHui)
      .reduce((somme, h) => somme + h.nombre, 0);
    sousCompte = resSc.data ?? null;
    sections = (resSections.data as Section[]) ?? [];

    const [resNotifs, resAbonnes] = await Promise.all([
      supabase
        .from("notifications_push")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("push_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id),
    ]);
    notificationsPush = (resNotifs.data as NotificationPush[]) ?? [];
    nbAbonnes = resAbonnes.count ?? 0;

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
            "Présentez ce QR code uniquement si le commerçant vous le demande.",
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
    <main className="min-h-screen bg-stone-100">
      {effectif.impersonation && <BandeauImpersonation />}
      <NavigationSidebar userEmail={effectif.email} />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:ml-64 lg:max-w-none lg:px-8">
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

            <div>
              <div className="space-y-8">
                <div className="mb-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-stone-200 bg-white p-5">
                    <p className="text-sm text-stone-500">Clients fidélisés</p>
                    <p className="mt-1 text-3xl font-bold text-bordeaux-800">{nbClients}</p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-5">
                    <p className="text-sm text-stone-500">
                      Tampons distribués aujourd&apos;hui
                    </p>
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

                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <Link
                    href="/dashboard/scanner"
                    className="flex items-center justify-between rounded-xl bg-bordeaux-800 px-4 py-3 font-semibold text-white transition hover:bg-bordeaux-700"
                  >
                    <span>🎯 Attribuer des tampons à un client</span>
                    <span>→</span>
                  </Link>
                </div>

                <div id="graphiques">
                  <GraphiquesTampons
                    historique={historique}
                    couleur={restaurant.couleur}
                  />
                </div>
                <div id="commerce">
                  <ConfigForm restaurant={restaurant} />
                </div>
                <div id="cartes">
                  <CartesSection
                    cartes={cartes}
                    recompenses={recompenses}
                    nomCommerce={restaurant.nom}
                  />
                </div>
                <div id="sections-page">
                  <SectionsSection sections={sections} />
                </div>
                <div id="souscompte">
                  <SousCompteSection sousCompte={sousCompte} />
                </div>
                <div id="notifications">
                  <NotificationsPushSection
                    notifications={notificationsPush}
                    timezone={restaurant.timezone ?? "Europe/Paris"}
                    nbAbonnes={nbAbonnes}
                    pushConfigure={Boolean(getVapidPublicKey())}
                  />
                </div>

                <aside
                  id="qr-code"
                  className="h-fit rounded-2xl border border-stone-200 bg-white p-6 text-center"
                >
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
            </div>
          </>
        )}
      </div>
    </main>
  );
}
