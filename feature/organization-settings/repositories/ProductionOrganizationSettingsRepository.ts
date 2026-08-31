import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { Database } from "@/types/database.generated";
import type { OrganizationSettings } from "../models/OrganizationSettings";

export class ProductionOrganizationSettingsRepository {
  constructor(private readonly client: SupabaseClient<Database>, private readonly workspace: AuthenticatedWorkspaceContext) {}
  async get(): Promise<OrganizationSettings | null> {
    const { data, error } = await this.client.from("organization_settings").select("organization_id,display_name,website_url,branding_version").eq("organization_id", this.workspace.organization.id).maybeSingle();
    if (error) throw error;
    return data ? { organizationId: data.organization_id, displayName: data.display_name, websiteUrl: data.website_url, brandingVersion: data.branding_version } : null;
  }
  async save(input: Pick<OrganizationSettings, "displayName" | "websiteUrl">): Promise<OrganizationSettings> {
    const { data, error } = await this.client.rpc("save_organization_settings", { target_organization_id: this.workspace.organization.id, proposed_display_name: input.displayName ?? "", proposed_website_url: input.websiteUrl ?? "" });
    if (error) throw error;
    return { organizationId: data.organization_id, displayName: data.display_name, websiteUrl: data.website_url, brandingVersion: data.branding_version };
  }
}
