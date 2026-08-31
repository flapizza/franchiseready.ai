import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { Database } from "@/types/database.generated";
import type { ConsultantProfileInput, PersistedConsultantProfile } from "../models/PersistedConsultantProfile";

type Row = Database["public"]["Tables"]["consultant_profiles"]["Row"];
const map = (row: Row): PersistedConsultantProfile => ({ membershipId: row.membership_id, organizationId: row.organization_id, displayName: row.display_name, professionalTitle: row.professional_title, professionalEmail: row.professional_email, professionalPhone: row.professional_phone, linkedInUrl: row.linkedin_url, schedulingUrl: row.scheduling_url });

export class ProductionConsultantProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>, private readonly workspace: AuthenticatedWorkspaceContext) {}
  async getOwn(): Promise<PersistedConsultantProfile | null> {
    const { data, error } = await this.client.from("consultant_profiles").select("*").eq("membership_id", this.workspace.membership.id).maybeSingle();
    if (error) throw error;
    return data ? map(data) : null;
  }
  async saveOwn(input: ConsultantProfileInput): Promise<PersistedConsultantProfile> {
    const { data, error } = await this.client.rpc("save_consultant_profile", { target_organization_id: this.workspace.organization.id, proposed_display_name: input.displayName ?? "", proposed_professional_title: input.professionalTitle ?? "", proposed_professional_email: input.professionalEmail ?? "", proposed_professional_phone: input.professionalPhone ?? "", proposed_linkedin_url: input.linkedInUrl ?? "", proposed_scheduling_url: input.schedulingUrl ?? "" });
    if (error) throw error;
    return map(data);
  }
}
