import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// Résout l'utilisateur "effectif" pour les pages du dashboard.
// - Cas normal : renvoie l'utilisateur connecté
// - Si super admin AVEC un cookie "walletiz_impersonate" valide :
//   renvoie l'user_id ciblé pour naviguer dans son dashboard sans mdp.
// Le cookie est httpOnly + n'est posé qu'après vérification du rôle
// super admin (voir super-admin/actions.ts > voirCommerce).
export async function utilisateurEffectif(): Promise<{
  userId: string;
  email: string;
  role: "restaurateur" | "super_admin" | "sous_compte";
  impersonation: null | { superAdminEmail: string; nomCommerce: string | null };
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (profil?.role ?? "restaurateur") as
    | "restaurateur"
    | "super_admin"
    | "sous_compte";

  const cookieStore = await cookies();
  const impersonateId = cookieStore.get("walletiz_impersonate")?.value;

  if (role === "super_admin" && impersonateId) {
    return {
      userId: impersonateId,
      email: user.email ?? "",
      role: "restaurateur",
      impersonation: {
        superAdminEmail: user.email ?? "",
        nomCommerce: cookieStore.get("walletiz_impersonate_nom")?.value ?? null,
      },
    };
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    role,
    impersonation: null,
  };
}
