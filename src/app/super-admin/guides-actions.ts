"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Garde-fou : seul le super admin peut gérer le guide vidéo.
async function exigerSuperAdmin() {
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
}

// Enregistre en base une vidéo déjà uploadée (l'upload du fichier se fait en
// direct depuis le navigateur vers le Storage, cf. GuidesVideoSection).
export async function enregistrerGuideVideo(input: {
  titre: string;
  videoUrl: string;
  chemin: string;
}) {
  await exigerSuperAdmin();
  const titre = input.titre.trim();
  if (!titre) return { erreur: "Le titre est obligatoire." };
  if (!input.videoUrl) return { erreur: "Vidéo manquante." };

  const admin = createAdminClient();
  const { data: derniere } = await admin
    .from("guides_video")
    .select("ordre")
    .order("ordre", { ascending: false })
    .limit(1)
    .maybeSingle();
  const ordre = ((derniere?.ordre as number | undefined) ?? 0) + 1;

  const { error } = await admin.from("guides_video").insert({
    titre,
    video_url: input.videoUrl,
    chemin: input.chemin,
    ordre,
  });
  if (error) return { erreur: "Impossible d'enregistrer la vidéo." };

  revalidatePath("/super-admin");
  revalidatePath("/dashboard");
  return { ok: true };
}

// Renomme une vidéo.
export async function renommerGuideVideo(id: string, titre: string) {
  await exigerSuperAdmin();
  const t = titre.trim();
  if (!t) return { erreur: "Le titre est obligatoire." };
  const admin = createAdminClient();
  const { error } = await admin
    .from("guides_video")
    .update({ titre: t })
    .eq("id", id);
  if (error) return { erreur: "Impossible de renommer." };
  revalidatePath("/super-admin");
  revalidatePath("/dashboard");
  return { ok: true };
}

// Supprime une vidéo (fiche + fichier dans le Storage).
export async function supprimerGuideVideo(id: string) {
  await exigerSuperAdmin();
  const admin = createAdminClient();
  const { data: g } = await admin
    .from("guides_video")
    .select("chemin")
    .eq("id", id)
    .maybeSingle();
  const chemin = (g?.chemin as string | null) ?? null;
  if (chemin) await admin.storage.from("guides").remove([chemin]);
  const { error } = await admin.from("guides_video").delete().eq("id", id);
  if (error) return { erreur: "Impossible de supprimer." };
  revalidatePath("/super-admin");
  revalidatePath("/dashboard");
  return { ok: true };
}

// Déplace une vidéo vers le haut ou le bas (échange d'ordre avec sa voisine).
export async function deplacerGuideVideo(id: string, sens: "haut" | "bas") {
  await exigerSuperAdmin();
  const admin = createAdminClient();
  const { data: liste } = await admin
    .from("guides_video")
    .select("id, ordre")
    .order("ordre", { ascending: true });
  if (!liste) return { erreur: "Erreur." };
  const idx = liste.findIndex((x) => x.id === id);
  const voisin = sens === "haut" ? idx - 1 : idx + 1;
  if (idx < 0 || voisin < 0 || voisin >= liste.length) return { ok: true };
  const a = liste[idx];
  const b = liste[voisin];
  await admin.from("guides_video").update({ ordre: b.ordre }).eq("id", a.id);
  await admin.from("guides_video").update({ ordre: a.ordre }).eq("id", b.id);
  revalidatePath("/super-admin");
  revalidatePath("/dashboard");
  return { ok: true };
}
