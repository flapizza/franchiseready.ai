import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";

export interface WorkspaceBootstrapOutcome {
  organizationId: string;
  organizationPublicId: string;
  organizationName: string;
  membershipId: string;
  created: boolean;
}

export class ProductionWorkspaceBootstrapService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async bootstrap(input: { organizationName: string; consultantDisplayName: string }): Promise<WorkspaceBootstrapOutcome> {
    const { data, error } = await this.client.rpc("bootstrap_first_workspace", {
      proposed_organization_name: input.organizationName,
      proposed_consultant_display_name: input.consultantDisplayName,
    });
    if (error) throw error;
    const row = data[0];
    if (!row) throw new Error("Workspace bootstrap returned no outcome.");
    return { organizationId: row.organization_id, organizationPublicId: row.organization_public_id, organizationName: row.organization_name, membershipId: row.membership_id, created: row.created };
  }
}
