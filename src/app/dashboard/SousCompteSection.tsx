"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  changerMotDePasseSousCompte,
  creerSousCompte,
  supprimerSousCompte,
  basculerSousCompte,
} from "./actions";
import type { SousCompte } from "@/lib/types";
import { useTDash } from "@/lib/langue-dashboard";

export function SousCompteSection({ sousCompte }: { sousCompte: SousCompte | null }) {
  const t = useTDash();
  const router = useRouter();
  const [creation, setCreation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [identifiants, setIdentifiants] = useState<{ email: string; motDePasse: string } | null>(null);
  const [enCours, startTransition] = useTransition();

  function creer(formData: FormData) {
    setErreur(null);
    startTransition(async () => {
      const r = await creerSousCompte(formData);
      if (r?.erreur) setErreur(r.erreur);
      else if (r?.ok) {
        setIdentifiants({ email: r.email, motDePasse: r.motDePasse });
        setCreation(false);
        router.refresh();
      }
    });
  }

  function supprimer() {
    if (!window.confirm("Supprimer ce sous-compte ? La personne ne pourra plus scanner de tampons.")) return;
    startTransition(async () => {
      const r = await supprimerSousCompte();
      if (r?.erreur) setErreur(r.erreur);
      else router.refresh();
    });
  }

  function basculer() {
    startTransition(async () => {
      const r = await basculerSousCompte(!(sousCompte?.actif ?? false));
      if (r?.erreur) setErreur(r.erreur);
      else router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-bold text-stone-900">{t("sous_compte")}</h2>
      <p className="mt-1 text-sm text-stone-500">{t("sous_compte_desc")}</p>

      {identifiants && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">
            ✅ Sous-compte créé — notez bien ces identifiants :
          </p>
          <p className="mt-2 font-mono text-xs text-green-900">
            Email : <strong>{identifiants.email}</strong>
            <br />
            Mot de passe : <strong>{identifiants.motDePasse}</strong>
          </p>
          <p className="mt-2 text-xs text-green-700">
            Ces identifiants ne s&apos;afficheront plus jamais — copiez-les.
          </p>
        </div>
      )}

      {sousCompte ? (
        <BlocSousCompteExistant
          sousCompte={sousCompte}
          onBasculer={basculer}
          onSupprimer={supprimer}
          enCours={enCours}
        />
      ) : creation ? (
        // Formulaire de création

        <form action={creer} className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-stone-700">
            {t("email_employe")}
            <input
              name="email"
              type="email"
              required
              placeholder="email@exemple.fr"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200"
            />
            <span className="mt-1 block text-xs font-normal text-stone-500">
              {t("email_employe_desc")}
            </span>
          </label>
          <label className="block text-sm font-medium text-stone-700">
            {t("mot_de_passe_initial")}
            <input
              name="mot_de_passe"
              type="text"
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2.5 outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={enCours}
              className="rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
            >
              {enCours ? "…" : t("creer_sous_compte")}
            </button>
            <button
              type="button"
              onClick={() => setCreation(false)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
            >
              {t("annuler")}
            </button>
          </div>
          {erreur && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
          )}
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setCreation(true)}
          className="mt-4 rounded-lg bg-bordeaux-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700"
        >
          + {t("creer_sous_compte")}
        </button>
      )}

      {erreur && !creation && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
      )}
    </section>
  );
}

function BlocSousCompteExistant({
  sousCompte,
  onBasculer,
  onSupprimer,
  enCours,
}: {
  sousCompte: SousCompte;
  onBasculer: () => void;
  onSupprimer: () => void;
  enCours: boolean;
}) {
  const t = useTDash();
  const formRef = useRef<HTMLFormElement>(null);
  const [changeMdp, setChangeMdp] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [pending, startTr] = useTransition();

  function envoyer(formData: FormData) {
    setErreur(null); setSucces(false);
    startTr(async () => {
      const r = await changerMotDePasseSousCompte(formData);
      if (r?.erreur) setErreur(r.erreur);
      else {
        setSucces(true);
        formRef.current?.reset();
        setTimeout(() => setChangeMdp(false), 1500);
      }
    });
  }

  return (
    <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
      <p className="font-semibold text-stone-900">{sousCompte.nom}</p>
      <p className="mt-0.5 font-mono text-xs text-stone-500 break-all">{sousCompte.email}</p>
      {!sousCompte.actif && (
        <p className="mt-1 text-xs font-semibold text-amber-700">
          ⚠️ Compte désactivé
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/dashboard/scanner"
          className="rounded-lg bg-bordeaux-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-bordeaux-700"
        >
          🎯 Ouvrir l&apos;espace scan
        </Link>
        <button
          onClick={() => setChangeMdp(!changeMdp)}
          disabled={enCours || pending}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-white disabled:opacity-60"
        >
          🔑 Changer le mot de passe
        </button>
        <button
          onClick={onBasculer}
          disabled={enCours || pending}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-white disabled:opacity-60"
        >
          {sousCompte.actif ? t("desactiver_sous_compte") : t("activer_sous_compte")}
        </button>
        <button
          onClick={onSupprimer}
          disabled={enCours || pending}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
        >
          {t("supprimer")}
        </button>
      </div>

      {changeMdp && (
        <form ref={formRef} action={envoyer} className="mt-3 flex flex-wrap gap-2">
          <input
            name="mot_de_passe"
            type="text"
            required
            minLength={8}
            placeholder="Nouveau mot de passe (8 car. min)"
            className="flex-1 min-w-0 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-bordeaux-700 focus:ring-2 focus:ring-bordeaux-200"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-bordeaux-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-bordeaux-700 disabled:opacity-60"
          >
            {pending ? "…" : t("enregistrer")}
          </button>
        </form>
      )}
      {erreur && <p className="mt-2 text-xs text-red-600">{erreur}</p>}
      {succes && <p className="mt-2 text-xs text-green-600">Mot de passe changé ✓</p>}

      <p className="mt-3 text-xs text-stone-500">
        Cette personne se connecte sur /login avec l&apos;email ci-dessus et son mot de passe.
      </p>
    </div>
  );
}
