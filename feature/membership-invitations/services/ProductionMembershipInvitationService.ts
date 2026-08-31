import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";

export type InvitationResolution =
  | { status: "available"; organizationName: string; intendedRole: "consultant" | "admin" }
  | { status: "invalid" | "expired" | "revoked" | "accepted"; organizationName: string | null; intendedRole: "consultant" | "admin" | null };

export class ProductionMembershipInvitationService {
  constructor(private readonly client: SupabaseClient<Database>) {}
  async create(input: { organizationId: string; email: string; role: "consultant" | "admin"; token: string }) {
    const { data, error } = await this.client.rpc("create_membership_invitation", { target_organization_id: input.organizationId, proposed_email: input.email, proposed_role: input.role, presented_token: input.token });
    if (error) throw error;
    return data[0];
  }
  async resolve(token: string): Promise<InvitationResolution> {
    const { data, error } = await this.client.rpc("resolve_membership_invitation", { presented_token: token });
    if (error) throw error;
    const row = data[0];
    if (!row) return { status: "invalid", organizationName: null, intendedRole: null };
    return { status: row.resolution as InvitationResolution["status"], organizationName: row.organization_name, intendedRole: row.intended_role } as InvitationResolution;
  }
  async accept(token: string) {
    const { data, error } = await this.client.rpc("accept_membership_invitation", { presented_token: token });
    if (error) throw error;
    return data[0];
  }
  async revoke(invitationId: string): Promise<void> {
    const { error } = await this.client.rpc("revoke_membership_invitation", { target_invitation_id: invitationId });
    if (error) throw error;
  }
}
