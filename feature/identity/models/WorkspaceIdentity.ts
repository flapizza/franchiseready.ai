export type MembershipRole = "owner" | "admin" | "manager" | "consultant";
export type MembershipStatus = "invited" | "active" | "suspended";

export type WorkspaceCapability =
  | "organization:view"
  | "organization:manage"
  | "memberships:view_descendants"
  | "memberships:manage"
  | "hierarchy:view_descendants"
  | "hierarchy:manage";

export interface AuthenticatedWorkspaceContext {
  user: { id: string; email: string | null };
  organization: { id: string; publicId: string; name: string };
  membership: {
    id: string;
    role: MembershipRole;
    status: "active";
    managerMembershipId: string | null;
  };
  capabilities: readonly WorkspaceCapability[];
}
