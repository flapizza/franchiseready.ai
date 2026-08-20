import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getAdminEnvironment } from "@/lib/env";
import type { Database } from "@/types/database.generated";

/**
 * Service-role access bypasses RLS. Keep this server-only module out of normal
 * user-scoped repositories. It is reserved for verified webhooks, controlled
 * background jobs, and audited system administration.
 */
export function createAdminSupabaseClient() {
  const environment = getAdminEnvironment();

  return createClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
