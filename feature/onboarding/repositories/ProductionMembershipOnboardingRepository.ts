import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { Database } from "@/types/database.generated";
import type { MembershipOnboardingState } from "../models/MembershipOnboardingState";

export class ProductionMembershipOnboardingRepository {
  constructor(private readonly client: SupabaseClient<Database>, private readonly workspace: AuthenticatedWorkspaceContext) {}
  async getOwn(): Promise<MembershipOnboardingState | null> {
    const { data, error } = await this.client.from("membership_onboarding").select("membership_id,organization_id,status,current_step,completed_steps,onboarding_version").eq("membership_id", this.workspace.membership.id).maybeSingle();
    if (error) throw error;
    return data ? { membershipId: data.membership_id, organizationId: data.organization_id, status: data.status, currentStep: data.current_step, completedSteps: data.completed_steps, onboardingVersion: data.onboarding_version } : null;
  }
  async saveOwn(input: Pick<MembershipOnboardingState, "status" | "currentStep" | "completedSteps">): Promise<void> {
    const { error } = await this.client.rpc("set_membership_onboarding_state", { target_organization_id: this.workspace.organization.id, proposed_status: input.status, proposed_current_step: input.currentStep ?? "", proposed_completed_steps: input.completedSteps });
    if (error) throw error;
  }
}
