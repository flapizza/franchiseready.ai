import "server-only";

import { capabilitiesForRole } from "@/feature/identity/auth/capabilities";
import type { MembershipRole } from "@/feature/identity/models/WorkspaceIdentity";
import { getPersistenceMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProductionMembershipId, ProductionOrganizationId, SupabaseUserId, WorkspaceResolution } from "./WorkspaceComposition";
import { productionSessionFromContext } from "./ProductionWorkspaceComposition";

type MembershipRow = { id: string; organization_id: string; role: MembershipRole; status: "invited" | "active" | "suspended"; manager_membership_id: string | null; organizations: { id: string; public_id: string; name: string } | null };

export async function resolveProductionWorkspaceSession(): Promise<WorkspaceResolution> {
  if (getPersistenceMode() !== "supabase") throw new Error("Production workspace resolution requires Supabase persistence mode.");
  const client = await createServerSupabaseClient();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError || !authData.user) return { status: "unauthenticated" };
  const identity = { kind: "supabase-user" as const, userId: authData.user.id as SupabaseUserId, email: authData.user.email ?? null };
  const { data, error } = await client.from("organization_memberships")
    .select("id, organization_id, role, status, manager_membership_id, organizations!inner(id, public_id, name)")
    .eq("user_id", authData.user.id).order("created_at", { ascending: true });
  if (error) throw new Error("Production workspace memberships could not be resolved.");
  const memberships = (data ?? []) as unknown as MembershipRow[];
  const active = memberships.filter((item) => item.status === "active" && item.organizations);
  if (active.length > 1) return { status: "workspace-selection-required", identity, memberships: active.map((item) => ({ id: item.id as ProductionMembershipId, organizationId: item.organization_id as ProductionOrganizationId, organizationName: item.organizations!.name })) };
  if (active.length === 1) {
    const membership = active[0]; const organization = membership.organizations!;
    return { status: "resolved", session: productionSessionFromContext({
      user: { id: authData.user.id, email: authData.user.email ?? null },
      organization: { id: organization.id, publicId: organization.public_id, name: organization.name },
      membership: { id: membership.id, role: membership.role, status: "active", managerMembershipId: membership.manager_membership_id },
      capabilities: capabilitiesForRole(membership.role),
    }) };
  }
  const suspended = memberships.find((item) => item.status === "suspended" && item.organizations);
  if (suspended) return { status: "suspended", identity, organizationId: suspended.organization_id as ProductionOrganizationId, membershipId: suspended.id as ProductionMembershipId };
  const invitation = memberships.find((item) => item.status === "invited" && item.organizations);
  if (invitation) return { status: "invitation-available", identity, invitation: { id: invitation.id, organizationName: invitation.organizations!.name } };
  return { status: "needs-workspace-bootstrap", identity };
}
