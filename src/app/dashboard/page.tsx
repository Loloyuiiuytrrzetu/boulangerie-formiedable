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
import { AbonnementSection } from "./AbonnementSection";
import { getVapidPublicKey } from "@/lib/push";
import { LangueDashboardProvider } from "@/lib/langue-dashboard";
import type { Langue } from "@/lib/i18n";
import { tDash } from "@/lib/i18n-dashboard";

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
  let aujourdHui = dateDuJour(restaurant?.timezone ?? "Europe/Paris");
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
    aujourdHui = dateDuJour(restaurant.timezone ?? "Europe/Paris");
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

  // Langue du dashboard : lue depuis restaurant.langue pour le rendu
  // serveur des strings statiques (les composants client utilisent le
  // provider ci-dessous via useTDash).
  const langueDash = ((restaurant?.langue ?? "fr") as Langue);
  const td = (cle: Parameters<typeof tDash>[0], vars?: Parameters<typeof tDash>[2]) =>
    tDash(cle, langueDash, vars);

  return (
    <LangueDashboardProvider langueInitiale={langueDash}>
    <main className="min-h-screen bg-stone-100">
      {effectif.impersonation && <BandeauImpersonation />}
      <NavigationSidebar
        userEmail={effectif.email}
        langueInitiale={((restaurant?.langue ?? "fr") as Langue)}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:ml-64 lg:max-w-none lg:px-8">
        {!restaurant ? (
          <CreationForm />
        ) : (
          <>
            {!restaurant.actif && (
              <p className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {td("commerce_desactive")}
              </p>
            )}

            <div>
              <div className="space-y-8">
                <div className="mb-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-stone-200 bg-white p-5">
                    <p className="text-sm text-stone-500">{td("clients_fidelises")}</p>
                    <p className="mt-1 text-3xl font-bold text-bordeaux-800">{nbClients}</p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-5">
                    <p className="text-sm text-stone-500">
                      {td("tampons_distribues_aujourdhui")}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-bordeaux-800">{nbTampons}</p>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-stone-200 bg-white p-5 sm:col-span-1">
                    <p className="text-sm text-stone-500">{td("votre_page_client")}</p>
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
                    <span>{td("attribuer_tampons_client")}</span>
                    <span>→</span>
                  </Link>
                </div>

                <div id="graphiques" className="scroll-mt-24">
                  <GraphiquesTampons
                    historique={historique}
                    couleur={restaurant.couleur}
                    timezone={restaurant.timezone ?? "Europe/Paris"}
                  />
                </div>
                <div id="commerce" className="scroll-mt-24">
                  <ConfigForm restaurant={restaurant} />
                </div>
                <div id="cartes" className="scroll-mt-24">
                  <CartesSection
                    cartes={cartes}
                    recompenses={recompenses}
                    nomCommerce={restaurant.nom}
                    aujourdHui={aujourdHui}
                  />
                </div>
                <div id="sections-page" className="scroll-mt-24">
                  <SectionsSection sections={sections} />
                </div>
                <div id="souscompte" className="scroll-mt-24">
                  <SousCompteSection sousCompte={sousCompte} />
                </div>
                <div id="notifications" className="scroll-mt-24">
                  <NotificationsPushSection
                    notifications={notificationsPush}
                    timezone={restaurant.timezone ?? "Europe/Paris"}
                    nbAbonnes={nbAbonnes}
                    nbClientsTotal={nbClients}
                    pushConfigure={Boolean(getVapidPublicKey())}
                  />
                </div>
                <div id="abonnement" className="scroll-mt-24">
                  <AbonnementSection restaurant={restaurant} />
                </div>

                <aside
                  id="qr-code"
                  className="h-fit scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6 text-center"
                >
                <h2 className="font-bold text-stone-900">{td("qr_code_titre")}</h2>
                <p className="mt-1 text-sm text-stone-500">{td("qr_code_desc")}</p>
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
                  {td("telecharger_qr")}
                </a>
              </aside>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
    </LangueDashboardProvider>
  );
}
