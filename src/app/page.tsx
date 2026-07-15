"use client";

import Link from "next/link";
import { HeroTampons, GrapheAnime, MockupCartes, NotifsAnimees } from "./VitrineAnimations";
import { MenuMobile } from "./MenuMobile";
import { LottieAnim } from "./LottieAnim";
import { LangueProvider, useLangue, useTV } from "@/lib/langue";
import { LANGUES, type Langue } from "@/lib/i18n";

// Vitrine publique de Walletiz. Toute la page est un composant client pour
// permettre le changement de langue à la volée (LangueProvider partagé
// avec la page cliente /c/[slug]).

const EMAIL = "contact@walletiz.fr";
const TEL_AFFICHE = "+590 690 98 85 38";
const TEL_LIEN = "+590690988538";
const CALENDLY = "https://calendly.com/walletiz-fr";
const STRIPE_MENSUEL = "https://buy.stripe.com/4gMeVd5Plcw70LGdUUejK00";
const STRIPE_ANNUEL = "https://buy.stripe.com/5kQ8wP5Pl67J1PKaIIejK01";
const PRIX_SETUP = 120;
const PRIX_ABO = 64;

// Petit sélecteur de langue pour la nav desktop — drapeau seul (compact).
function SelecteurLangueVitrine() {
  const { langue, setLangue } = useLangue();
  return (
    <select
      value={langue}
      onChange={(e) => setLangue(e.target.value as Langue)}
      className="rounded-lg border border-stone-200 bg-white px-2 py-2 text-sm font-semibold text-stone-700 outline-none transition hover:border-bordeaux-300 focus:border-bordeaux-500"
      aria-label="Language"
    >
      {LANGUES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.drapeau} {l.nom}
        </option>
      ))}
    </select>
  );
}

export default function Vitrine() {
  return (
    <LangueProvider>
      <VitrineContenu />
    </LangueProvider>
  );
}

function VitrineContenu() {
  const t = useTV();
  const prixAnnuelParMois = Math.round(PRIX_ABO * 0.8);
  const prixAnnuelTotal = Math.round(PRIX_ABO * 12 * 0.8);
  const eco = Math.round(PRIX_ABO * 12 * 0.2);

  return (
    <main className="min-h-screen bg-white pt-[60px] text-stone-800">
      {/* ==================== NAV ==================== */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-stone-100 bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="Walletiz" className="h-9 w-9 rounded-xl object-cover" />
            <span className="text-lg font-extrabold text-bordeaux-800">Walletiz</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#comment" className="text-sm font-medium text-stone-600 hover:text-bordeaux-700">
              {t("nav_comment")}
            </a>
            <a href="#fonctions" className="text-sm font-medium text-stone-600 hover:text-bordeaux-700">
              {t("nav_fonctions")}
            </a>
            <a href="#tarif" className="text-sm font-medium text-stone-600 hover:text-bordeaux-700">
              {t("nav_tarif")}
            </a>
            <a href="#sites-web" className="text-sm font-medium text-stone-600 hover:text-bordeaux-700">
              {t("nav_sites_web")}
            </a>
            <a href="#contact" className="text-sm font-medium text-stone-600 hover:text-bordeaux-700">
              {t("nav_contact")}
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block">
              <SelecteurLangueVitrine />
            </div>
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg bg-bordeaux-50 px-4 py-2 text-sm font-semibold text-bordeaux-800 transition hover:bg-bordeaux-100 sm:inline-block"
            >
              {t("nav_prendre_rdv")}
            </a>
            <Link
              href="/login"
              className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-bordeaux-700"
            >
              {t("nav_connexion")}
            </Link>
            <MenuMobile />
          </div>
        </div>
      </nav>

      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden">
        <div
          className="anim-gradient absolute inset-0 opacity-90"
          style={{
            background:
              "linear-gradient(135deg, #fdf2f4 0%, #ffffff 25%, #fbe3e7 60%, #ffffff 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #7A1E2E 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="anim-apparaitre">
            <span className="inline-flex items-center gap-2 rounded-full border border-bordeaux-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-bordeaux-800 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="anim-pulse absolute inline-flex h-full w-full rounded-full bg-bordeaux-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-bordeaux-600" />
              </span>
              {t("hero_badge")}
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              {t("hero_titre_1")}{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-bordeaux-800 to-bordeaux-500 bg-clip-text text-transparent">
                  {t("hero_titre_2")}
                </span>
                <span
                  className="absolute inset-x-0 bottom-1 z-0 h-3 rounded-sm bg-bordeaux-100/80"
                  aria-hidden="true"
                />
              </span>{" "}
              {t("hero_titre_3")}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-600 sm:text-xl">
              {t("hero_soustitre")}
            </p>
            <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row">
              <a
                href={CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                className="anim-glow group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-bordeaux-800 px-6 py-4 text-base font-bold text-white shadow-xl transition hover:bg-bordeaux-700 sm:w-auto"
              >
                {t("hero_cta_rdv")}
                <span className="transition group-hover:translate-x-1">→</span>
              </a>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-stone-200 bg-white px-6 py-4 text-base font-semibold text-stone-700 transition hover:border-bordeaux-300 hover:text-bordeaux-700 sm:w-auto"
              >
                {t("hero_cta_compte")}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-stone-500">
              <div className="flex items-center gap-2"><span className="text-lg">✅</span><span>{t("hero_check_1")}</span></div>
              <div className="flex items-center gap-2"><span className="text-lg">✅</span><span>{t("hero_check_2")}</span></div>
              <div className="flex items-center gap-2"><span className="text-lg">✅</span><span>{t("hero_check_3")}</span></div>
            </div>
          </div>
          <div className="relative h-[420px] sm:h-[500px] lg:h-[560px]">
            <HeroTampons />
          </div>
        </div>
      </section>

      {/* ==================== BANDEAU CHIFFRES ==================== */}
      <section className="border-y border-bordeaux-100 bg-bordeaux-50/40 py-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 text-center sm:grid-cols-4 sm:px-6">
          {[
            { chiffre: "10 s", label: t("chiffre_inscription") },
            { chiffre: "0 €", label: t("chiffre_materiel") },
            { chiffre: "7", label: t("chiffre_langues") },
            { chiffre: "24/7", label: t("chiffre_notifs") },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold text-bordeaux-800 sm:text-3xl">{s.chiffre}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-stone-500 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== COMMENT ÇA MARCHE ==================== */}
      <section id="comment" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">{t("cm_eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-5xl">{t("cm_titre")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">{t("cm_soustitre")}</p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {([
              { num: "1", video: "/qrscan.webm", titre: t("cm_1_titre"), desc: t("cm_1_desc") },
              { num: "2", lottie: "/signup.json", titre: t("cm_2_titre"), desc: t("cm_2_desc") },
              { num: "3", lottie: "/welcome.json", titre: t("cm_3_titre"), desc: t("cm_3_desc") },
            ] as Array<{ num: string; titre: string; desc: string; video?: string; lottie?: string }>).map((e, i) => (
              <div key={e.num} className="relative rounded-3xl border border-stone-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-bordeaux-300 hover:shadow-lg" style={{ animationDelay: `${i * 0.15}s` }}>
                {e.video ? (
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-bordeaux-800 to-bordeaux-600 shadow-lg">
                    <video src={e.video} autoPlay loop muted playsInline className="h-14 w-14 object-cover" />
                  </div>
                ) : e.lottie ? (
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-stone-200">
                    <LottieAnim src={e.lottie} className="h-14 w-14" />
                  </div>
                ) : null}
                <div className="absolute right-6 top-6 text-6xl font-black text-bordeaux-100">{e.num}</div>
                <h3 className="mt-5 text-xl font-bold text-stone-900">{e.titre}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TEMPS RÉEL ==================== */}
      <section className="bg-stone-50/60 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">{t("tr_eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              {t("tr_titre_1")} <span className="text-bordeaux-800">{t("tr_titre_2")}</span> {t("tr_titre_3")}
            </h2>
            <p className="mt-4 text-lg text-stone-600">{t("tr_soustitre")}</p>
            <ul className="mt-8 space-y-3 text-stone-700">
              <li className="flex items-start gap-3"><span className="mt-0.5 text-bordeaux-700">✓</span><span><strong>{t("tr_bullet_1_bold")}</strong>{t("tr_bullet_1")}</span></li>
              <li className="flex items-start gap-3"><span className="mt-0.5 text-bordeaux-700">✓</span><span><strong>{t("tr_bullet_2_bold")}</strong>{t("tr_bullet_2")}</span></li>
              <li className="flex items-start gap-3"><span className="mt-0.5 text-bordeaux-700">✓</span><span><strong>{t("tr_bullet_3_bold")}</strong>{t("tr_bullet_3")}</span></li>
            </ul>
          </div>
          <div className="flex items-center justify-center"><MockupCartes /></div>
        </div>
      </section>

      {/* ==================== DASHBOARD ==================== */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div className="order-2 flex items-center justify-center lg:order-1"><GrapheAnime /></div>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">{t("ds_eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              {t("ds_titre_1")} <span className="text-bordeaux-800">{t("ds_titre_2")}</span>
            </h2>
            <p className="mt-4 text-lg text-stone-600">{t("ds_soustitre")}</p>
            <ul className="mt-8 space-y-3 text-stone-700">
              <li className="flex items-start gap-3"><span className="mt-0.5 text-bordeaux-700">✓</span><span><strong>{t("ds_bullet_1_bold")}</strong>{t("ds_bullet_1")}</span></li>
              <li className="flex items-start gap-3"><span className="mt-0.5 text-bordeaux-700">✓</span><span><strong>{t("ds_bullet_2_bold")}</strong>{t("ds_bullet_2")}</span></li>
              <li className="flex items-start gap-3"><span className="mt-0.5 text-bordeaux-700">✓</span><span><strong>{t("ds_bullet_3_bold")}</strong>{t("ds_bullet_3")}</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==================== NOTIFICATIONS PUSH ==================== */}
      <section className="border-y border-bordeaux-100 bg-gradient-to-br from-bordeaux-50 via-white to-bordeaux-50/40 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">{t("np_eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              {t("np_titre_1")} <span className="text-bordeaux-800">{t("np_titre_2")}</span>.
            </h2>
            <p className="mt-4 text-lg text-stone-600">{t("np_soustitre")}</p>
            <ul className="mt-8 space-y-3 text-stone-700">
              <li className="flex items-start gap-3"><span className="mt-0.5 text-bordeaux-700">✓</span><span><strong>{t("np_bullet_1_bold")}</strong>{t("np_bullet_1")}</span></li>
              <li className="flex items-start gap-3"><span className="mt-0.5 text-bordeaux-700">✓</span><span><strong>{t("np_bullet_2_bold")}</strong>{t("np_bullet_2")}</span></li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 text-bordeaux-700">📱</span>
                <span>
                  <strong>{t("np_iphone_intro_bold")}</strong>{t("np_iphone_intro")}
                  <ol className="mt-2 ml-1 list-decimal space-y-1 pl-4 text-sm text-stone-600">
                    <li><strong>{t("np_iphone_etape_1_bold")}</strong> — {t("np_iphone_etape_1")}</li>
                    <li>{t("np_iphone_etape_2_bold")}</li>
                    <li>{t("np_iphone_etape_3")} <strong>{t("np_iphone_etape_3_bold")}</strong></li>
                  </ol>
                  <span className="mt-2 block text-xs text-stone-500">{t("np_iphone_final")}</span>
                </span>
              </li>
            </ul>
          </div>
          <div className="flex items-center justify-center"><NotifsAnimees /></div>
        </div>
      </section>

      {/* ==================== FONCTIONNALITÉS ==================== */}
      <section id="fonctions" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">{t("fc_eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-5xl">{t("fc_titre")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">{t("fc_soustitre")}</p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {([
              { icone: "🎨", titre: t("fc_couleurs"), desc: t("fc_couleurs_desc") },
              { lottie: "/payment.json", titre: t("fc_plusieurs_cartes"), desc: t("fc_plusieurs_cartes_desc") },
              { icone: "🎁", titre: t("fc_recompenses"), desc: t("fc_recompenses_desc") },
              { icone: "🔔", titre: t("fc_notifs"), desc: t("fc_notifs_desc") },
              { icone: "📊", titre: t("fc_stats"), desc: t("fc_stats_desc") },
              { icone: "🛡️", titre: t("fc_manuel"), desc: t("fc_manuel_desc") },
              { icone: "👥", titre: t("fc_sous_compte"), desc: t("fc_sous_compte_desc") },
              { icone: "🌍", titre: t("fc_langues"), desc: t("fc_langues_desc") },
              { icone: "📱", titre: t("fc_installable"), desc: t("fc_installable_desc") },
            ] as Array<{ icone?: string; lottie?: string; titre: string; desc: string }>).map((f) => (
              <div key={f.titre} className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-bordeaux-300 hover:shadow-lg">
                {f.lottie ? (
                  <div className="mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-stone-200 transition group-hover:scale-110">
                    <LottieAnim src={f.lottie} className="h-12 w-12" />
                  </div>
                ) : (
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-bordeaux-50 text-2xl transition group-hover:scale-110 group-hover:bg-bordeaux-100">
                    {f.icone}
                  </div>
                )}
                <h3 className="text-base font-bold text-stone-900">{f.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== POUR QUI ==================== */}
      <section className="relative overflow-hidden bg-bordeaux-950 py-20 text-white sm:py-24">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-5xl">{t("pour_qui")}</h2>
        </div>
      </section>

      {/* ==================== TARIF ==================== */}
      <section id="tarif" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">{t("tarif_eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-5xl">{t("tarif_titre")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
              {t("tarif_intro", { setup: String(PRIX_SETUP) })}
            </p>
            <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-900">
              {t("tarif_badge_72h")}
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-2 lg:items-stretch">
            {/* Plan mensuel */}
            <div className="relative flex flex-col rounded-3xl border-2 border-stone-200 bg-white p-8 shadow-sm transition hover:border-bordeaux-300 hover:shadow-lg sm:p-10">
              <div className="flex items-center gap-3">
                <span className="inline-block rounded-full bg-bordeaux-800 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white">{t("tarif_plan_pro")}</span>
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-green-800">{t("tarif_7_jours_gratuits")}</span>
              </div>
              <p className="mt-6 text-sm text-stone-500">{t("tarif_facture_chaque_mois")}</p>
              <p className="mt-1 text-5xl font-black text-bordeaux-800 sm:text-6xl">
                {PRIX_ABO}€<span className="text-lg font-medium text-stone-500"> {t("tarif_par_mois")}</span>
              </p>
              <p className="mt-2 text-sm text-stone-500">{t("tarif_sans_engagement")}</p>

              <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-bold text-stone-900">{t("tarif_setup_titre")}</p>
                  <p className="whitespace-nowrap text-lg font-bold text-bordeaux-800">
                    {PRIX_SETUP}€ <span className="text-xs font-medium text-stone-500">{t("tarif_setup_une_fois")}</span>
                  </p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">{t("tarif_setup_desc")}</p>
              </div>

              <ul className="mt-6 space-y-2.5 text-sm text-stone-700">
                {[
                  t("tarif_avantage_cartes"),
                  t("tarif_avantage_clients"),
                  t("tarif_avantage_notifs"),
                  t("tarif_avantage_sous_compte"),
                  t("tarif_avantage_stats"),
                  t("tarif_avantage_langues"),
                  t("tarif_avantage_support"),
                ].map((a) => (
                  <li key={a} className="flex items-start gap-2"><span className="mt-0.5 text-bordeaux-700">✓</span><span>{a}</span></li>
                ))}
              </ul>

              <a href={STRIPE_MENSUEL} target="_blank" rel="noopener noreferrer"
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border-2 border-bordeaux-800 bg-white px-6 py-4 text-base font-bold text-bordeaux-800 transition hover:bg-bordeaux-50 lg:pt-4">
                {t("tarif_choisir_mensuel")}
              </a>
            </div>

            {/* Plan annuel — recommandé */}
            <div className="anim-glow relative flex flex-col rounded-3xl border-2 border-bordeaux-800 bg-gradient-to-br from-white via-bordeaux-50/50 to-white p-8 shadow-2xl sm:p-10">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-bordeaux-800 px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg">
                {t("tarif_recommande")}
              </span>
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-bordeaux-100 opacity-40 blur-2xl" />

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-block rounded-full bg-bordeaux-800 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white">{t("tarif_plan_pro_annuel")}</span>
                <span className="inline-block rounded-full bg-green-600 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">-20%</span>
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-green-800">{t("tarif_7_jours_gratuits")}</span>
              </div>

              <p className="mt-6 text-sm text-stone-500">{t("tarif_facture_une_fois_an")}</p>
              <p className="mt-1 text-5xl font-black text-bordeaux-800 sm:text-6xl">
                {prixAnnuelParMois}€<span className="text-lg font-medium text-stone-500"> {t("tarif_par_mois")}</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-green-800">
                {t("tarif_soit_par_an", { annuel: String(prixAnnuelTotal) })}{" "}
                <span className="font-bold">{t("tarif_economisez", { eco: String(eco) })}</span>
              </p>
              <p className="mt-2 text-xs text-stone-500">{t("tarif_annulable")}</p>

              <div className="mt-6 rounded-xl border border-bordeaux-100 bg-white/70 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-bold text-stone-900">{t("tarif_setup_titre")}</p>
                  <p className="whitespace-nowrap text-lg font-bold text-bordeaux-800">
                    {PRIX_SETUP}€ <span className="text-xs font-medium text-stone-500">{t("tarif_setup_une_fois")}</span>
                  </p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">{t("tarif_setup_desc")}</p>
              </div>

              <ul className="mt-6 space-y-2.5 text-sm text-stone-700">
                <li className="flex items-start gap-2 font-semibold text-bordeaux-800">
                  <span className="mt-0.5">✓</span><span>{t("tarif_avantage_tout_mensuel")}</span>
                </li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-bordeaux-700">✓</span><span>{t("tarif_avantage_reduction")}</span></li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-bordeaux-700">✓</span><span>{t("tarif_avantage_priorite")}</span></li>
              </ul>

              <a href={STRIPE_ANNUEL} target="_blank" rel="noopener noreferrer"
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-bordeaux-800 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-bordeaux-700">
                {t("tarif_choisir_annuel")} <span>→</span>
              </a>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-xl text-center text-xs text-stone-400">{t("tarif_footer_note")}</p>
        </div>
      </section>

      {/* ==================== SITES WEB SUR MESURE ==================== */}
      <section id="sites-web" className="relative overflow-hidden border-y border-bordeaux-100 bg-gradient-to-br from-bordeaux-50/60 via-white to-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-bordeaux-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-bordeaux-800 shadow-sm">
              {t("sw_badge")}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold text-stone-900 sm:text-5xl">
              {t("sw_titre_1")}{" "}
              <span className="bg-gradient-to-r from-bordeaux-800 to-bordeaux-500 bg-clip-text text-transparent">
                {t("sw_titre_2")}
              </span>
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              <strong>{t("sw_intro_bold")}</strong> {t("sw_intro")}
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icone: "🏪", titre: t("sw_f1_titre"), desc: t("sw_f1_desc") },
              { icone: "🛒", titre: t("sw_f2_titre"), desc: t("sw_f2_desc") },
              { icone: "📅", titre: t("sw_f3_titre"), desc: t("sw_f3_desc") },
              { icone: "🎨", titre: t("sw_f4_titre"), desc: t("sw_f4_desc") },
              { icone: "📱", titre: t("sw_f5_titre"), desc: t("sw_f5_desc") },
              { icone: "🔗", titre: t("sw_f6_titre"), desc: t("sw_f6_desc") },
            ].map((f) => (
              <div key={f.titre} className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-bordeaux-300 hover:shadow-lg">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-bordeaux-50 text-2xl transition group-hover:scale-110 group-hover:bg-bordeaux-100">{f.icone}</div>
                <h3 className="text-base font-bold text-stone-900">{f.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-2xl rounded-3xl border-2 border-bordeaux-200 bg-white p-8 text-center shadow-xl sm:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">{t("sw_devis_eyebrow")}</p>
            <h3 className="mt-3 text-2xl font-extrabold text-stone-900 sm:text-3xl">{t("sw_devis_titre")}</h3>
            <p className="mt-3 text-stone-600">{t("sw_devis_desc")}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-bordeaux-800 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-bordeaux-700 sm:w-auto">
                {t("sw_devis_rdv")}<span>→</span>
              </a>
              <a href={`mailto:${EMAIL}?subject=Custom%20website%20request`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-stone-200 bg-white px-6 py-4 text-base font-semibold text-stone-700 transition hover:border-bordeaux-300 hover:text-bordeaux-700 sm:w-auto">
                {t("sw_devis_contact")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CONTACT ==================== */}
      <section id="contact" className="relative overflow-hidden border-t border-stone-100 bg-gradient-to-br from-white via-bordeaux-50/30 to-white py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-sm font-bold uppercase tracking-widest text-bordeaux-700">{t("ct_eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-5xl">{t("ct_titre")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">{t("ct_soustitre")}</p>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border-2 border-stone-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-bordeaux-400 hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bordeaux-100 text-2xl">📅</div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-stone-500">{t("ct_rdv")}</p>
              <p className="mt-1 font-bold text-stone-900">{t("ct_rdv_reserver")}</p>
              <p className="mt-2 text-sm text-stone-600">{t("ct_rdv_desc")}</p>
              <p className="mt-3 text-sm font-semibold text-bordeaux-700 group-hover:underline">calendly.com/walletiz-fr →</p>
            </a>

            <a href={`mailto:${EMAIL}`} className="group rounded-2xl border-2 border-stone-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-bordeaux-400 hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bordeaux-100 text-2xl">✉️</div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-stone-500">{t("ct_email")}</p>
              <p className="mt-1 font-bold text-stone-900">{t("ct_email_ecrire")}</p>
              <p className="mt-2 text-sm text-stone-600">{t("ct_email_desc")}</p>
              <p className="mt-3 text-sm font-semibold text-bordeaux-700 group-hover:underline">{EMAIL} →</p>
            </a>

            <a href={`tel:${TEL_LIEN}`} className="group rounded-2xl border-2 border-stone-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-bordeaux-400 hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bordeaux-100 text-2xl">📞</div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-stone-500">{t("ct_tel")}</p>
              <p className="mt-1 font-bold text-stone-900">{t("ct_tel_appeler")}</p>
              <p className="mt-2 text-sm text-stone-600">{t("ct_tel_desc")}</p>
              <p className="mt-3 text-sm font-semibold text-bordeaux-700 group-hover:underline">{TEL_AFFICHE} →</p>
            </a>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-stone-200 bg-stone-50 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="h-7 w-7 rounded-md object-cover" />
            <span className="text-sm text-stone-600">
              © {new Date().getFullYear()} <strong className="text-bordeaux-800">Walletiz</strong> — {t("footer_desc")}
            </span>
          </div>
          <div className="flex items-center gap-5 text-sm text-stone-500">
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="hover:text-bordeaux-700">{t("ct_rdv")}</a>
            <a href={`mailto:${EMAIL}`} className="hover:text-bordeaux-700">{t("ct_email")}</a>
            <a href={`tel:${TEL_LIEN}`} className="hover:text-bordeaux-700">{t("ct_tel")}</a>
            <Link href="/login" className="hover:text-bordeaux-700">{t("nav_connexion")}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
