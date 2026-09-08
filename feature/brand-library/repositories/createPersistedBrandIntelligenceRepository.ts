import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../types/database.generated.ts";
import type { AuthenticatedWorkspaceContext } from "../../identity/models/WorkspaceIdentity.ts";
import type { BrandIntelligenceRepository } from "./BrandIntelligenceRepository.ts";
import { SupabaseBrandIntelligenceRepository } from "./SupabaseBrandIntelligenceRepository.ts";

/** Explicit opt-in for a user-scoped local or hosted client. No env selection or fallback.
 * Used by authenticated workspace composition, never candidate matching. */
export function createPersistedBrandIntelligenceRepository(client: SupabaseClient<Database>, workspace: AuthenticatedWorkspaceContext): BrandIntelligenceRepository {
  return new SupabaseBrandIntelligenceRepository(client, workspace);
}
