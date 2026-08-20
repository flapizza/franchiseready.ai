import "server-only";

import { capabilitiesForRole } from "../auth/capabilities";
import type {
  AuthenticatedWorkspaceContext,
  MembershipRole,
} from "../models/WorkspaceIdentity";
import { getPersistenceMode } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type WorkspaceMembershipRow = {
  id: string;
  organization_id: string;
  role: MembershipRole;
  status: "active";
  manager_membership_id: string | null;
  organizations: { id: string; public_id: string; name: string } | null;
};

export class WorkspaceContextError extends Error {}

/**
 * Server-only DAL boundary for production identity and tenancy. RLS remains
 * authoritative; an organization ID supplied by a cookie, URL, or caller is
 * only a selection hint and cannot manufacture membership.
 */
export async function resolveAuthenticatedWorkspaceContext(
  requestedOrganizationId?: string,
): Promise<AuthenticatedWorkspaceContext | null> {
  if (getPersistenceMode() !== "supabase") {
    throw new WorkspaceContextError(
      "Production workspace context is unavailable in demo persistence mode.",
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;

  let query = supabase
    .from("organization_memberships")
    .select(
      "id, organization_id, role, status, manager_membership_id, organizations!inner(id, public_id, name)",
    )
    .eq("user_id", authData.user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1);

  if (requestedOrganizationId) {
    query = query.eq("organization_id", requestedOrganizationId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new WorkspaceContextError("Active workspace could not be resolved.");
  }
  if (!data) return null;

  const membership = data as unknown as WorkspaceMembershipRow;
  if (!membership.organizations) return null;

  return {
    user: { id: authData.user.id, email: authData.user.email ?? null },
    organization: {
      id: membership.organizations.id,
      publicId: membership.organizations.public_id,
      name: membership.organizations.name,
    },
    membership: {
      id: membership.id,
      role: membership.role,
      status: "active",
      managerMembershipId: membership.manager_membership_id,
    },
    capabilities: capabilitiesForRole(membership.role),
  };
}
