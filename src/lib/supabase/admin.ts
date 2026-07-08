import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client "admin" avec la clé service_role : contourne RLS.
// À utiliser UNIQUEMENT côté serveur, pour :
//  - les opérations des clients fidélité anonymes (tampons, récompenses)
//  - la gestion des comptes restaurateurs par le super admin
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
