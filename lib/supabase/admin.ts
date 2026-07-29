import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getAdminEnvironment } from "@/lib/env";

export function createAdminSupabaseClient() {
  const environment = getAdminEnvironment();

  return createClient(
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
