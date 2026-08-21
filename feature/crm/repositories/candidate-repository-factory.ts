import "server-only";

import { getPersistenceMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveAuthenticatedWorkspaceContext } from "@/feature/identity/data/workspace-context";
import { SeedCandidateRepository } from "./SeedCandidateRepository";
import { SupabaseCandidateRepository, type CandidateDatabase } from "./SupabaseCandidateRepository";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createCandidateRepository() {
  if (getPersistenceMode() === "demo") {
    return { mode: "demo" as const, repository: new SeedCandidateRepository(), workspace: null };
  }
  const workspace = await resolveAuthenticatedWorkspaceContext();
  if (!workspace) return null;
  const client = await createServerSupabaseClient();
  return { mode: "supabase" as const, repository: new SupabaseCandidateRepository(client as unknown as SupabaseClient<CandidateDatabase>, workspace), workspace };
}
