import type { createAdminClient } from "./supabase/admin";
import type { Section } from "./types";

type Admin = ReturnType<typeof createAdminClient>;

// Les 2 sections par défaut (toujours présentes, non supprimables) : l'onglet
// des cartes de fidélité et l'onglet Info + QR code.
function sectionsParDefaut(restaurantId: string) {
  return [
    {
      restaurant_id: restaurantId,
      type: "cartes" as const,
      titre: "Cartes de fidélité",
      ordre: 0,
      supprimable: false,
    },
    {
      restaurant_id: restaurantId,
      type: "info" as const,
      titre: "Info",
      texte:
        "Présentez ce QR code uniquement si le commerçant vous le demande.",
      ordre: 100,
      supprimable: false,
    },
  ];
}

// Garantit exactement UNE section « cartes » et UNE section « info » pour un
// restaurant, et supprime tout doublon.
//
// Pourquoi : la création des sections par défaut vivait à plusieurs endroits
// (création du commerce + auto-réparations dans les pages) et n'était pas
// atomique — deux exécutions concurrentes pouvaient créer 4 sections (2
// « Cartes » + 2 « Info »). Ce helper est DÉTERMINISTE : on garde toujours la
// plus ancienne de chaque type et on supprime les suivantes, donc deux appels
// concurrents convergent vers le même résultat sans doublon persistant. Il est
// idempotent et s'auto-répare à chaque chargement de page.
//
// Optimisé : si on lui passe les sections déjà chargées et qu'elles sont
// correctes (aucun doublon, aucune manquante), il ne fait AUCUNE écriture.
export async function assurerSectionsParDefaut(
  admin: Admin,
  restaurantId: string,
  sectionsInitiales: Section[]
): Promise<Section[]> {
  let sections = [...sectionsInitiales];

  // 1) Repère les doublons des types par défaut (cartes / info) : on garde le
  //    premier rencontré (tri ordre puis ancienneté), on supprime les autres.
  const tries = [...sections].sort((a, b) => {
    if (a.ordre !== b.ordre) return a.ordre - b.ordre;
    return (a.created_at ?? "").localeCompare(b.created_at ?? "");
  });
  const aSupprimer: string[] = [];
  const vus = new Set<string>();
  for (const s of tries) {
    if (s.type === "cartes" || s.type === "info") {
      if (vus.has(s.type)) aSupprimer.push(s.id);
      else vus.add(s.type);
    }
  }

  // 2) Détermine les sections par défaut manquantes.
  const manquantes = sectionsParDefaut(restaurantId).filter(
    (d) => !vus.has(d.type)
  );

  // Rien à faire : cas courant, aucune écriture.
  if (aSupprimer.length === 0 && manquantes.length === 0) return sections;

  if (aSupprimer.length > 0) {
    await admin.from("sections").delete().in("id", aSupprimer);
  }
  if (manquantes.length > 0) {
    await admin.from("sections").insert(manquantes);
  }

  // On relit l'état final propre.
  const { data } = await admin
    .from("sections")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("ordre", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<Section[]>();
  sections = data ?? sections.filter((s) => !aSupprimer.includes(s.id));
  return sections;
}
