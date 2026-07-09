"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { basculerActif, supprimerRestaurant, voirCommerce } from "./actions";
import type { RestaurantAvecStats } from "./page";

export function LigneRestaurant({ restaurant }: { restaurant: RestaurantAvecStats }) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  function basculer() {
    setErreur(null);
    startTransition(async () => {
      const resultat = await basculerActif(restaurant.id, !restaurant.actif);
      if (resultat?.erreur) setErreur(resultat.erreur);
    });
  }

  function supprimer() {
    const confirmation = window.confirm(
      `Supprimer définitivement « ${restaurant.nom} » ?\n\nLe compte du restaurateur, sa configuration et TOUTES les cartes de fidélité de ses clients seront effacés. Cette action est irréversible.`
    );
    if (!confirmation) return;
    setErreur(null);
    startTransition(async () => {
      const resultat = await supprimerRestaurant(restaurant.id);
      if (resultat?.erreur) setErreur(resultat.erreur);
    });
  }

  return (
    <li className="px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {restaurant.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={restaurant.logo_url}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg border border-stone-200 object-cover"
              />
            ) : (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 text-lg"
                style={{ backgroundColor: `${restaurant.couleur}22`, color: restaurant.couleur }}
              >
                {restaurant.nom.charAt(0).toUpperCase()}
              </span>
            )}
            <Link
              href={`/super-admin/${restaurant.id}`}
              className="truncate font-semibold text-stone-900 hover:text-bordeaux-700 hover:underline"
            >
              {restaurant.nom}
            </Link>
            {!restaurant.actif && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                désactivé
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-stone-500">
            {restaurant.email} · inscrit le{" "}
            {new Date(restaurant.created_at).toLocaleDateString("fr-FR")} ·{" "}
            {restaurant.nb_clients} client{restaurant.nb_clients > 1 ? "s" : ""} ·{" "}
            {restaurant.nb_tampons} tampon{restaurant.nb_tampons > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <form
            action={async () => {
              await voirCommerce(restaurant.id);
            }}
          >
            <button
              type="submit"
              className="rounded-lg bg-bordeaux-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-bordeaux-700"
            >
              👁️ Voir le commerce
            </button>
          </form>
          <Link
            href={`/super-admin/${restaurant.id}`}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100"
          >
            Détails
          </Link>
          <button
            onClick={basculer}
            disabled={enCours}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100 disabled:opacity-50"
          >
            {restaurant.actif ? "Désactiver" : "Réactiver"}
          </button>
          <button
            onClick={supprimer}
            disabled={enCours}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>
      </div>
      {erreur && <p className="mt-2 text-xs text-red-600">{erreur}</p>}
    </li>
  );
}
