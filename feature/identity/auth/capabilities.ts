import type {
  MembershipRole,
  WorkspaceCapability,
} from "../models/WorkspaceIdentity";

const roleCapabilities = {
  owner: [
    "organization:view",
    "organization:manage",
    "memberships:view_descendants",
    "memberships:manage",
    "hierarchy:view_descendants",
    "hierarchy:manage",
  ],
  admin: [
    "organization:view",
    "organization:manage",
    "memberships:view_descendants",
    "memberships:manage",
    "hierarchy:view_descendants",
    "hierarchy:manage",
  ],
  manager: [
    "organization:view",
    "memberships:view_descendants",
    "hierarchy:view_descendants",
  ],
  consultant: ["organization:view"],
} as const satisfies Record<MembershipRole, readonly WorkspaceCapability[]>;

export function capabilitiesForRole(
  role: MembershipRole,
): readonly WorkspaceCapability[] {
  return roleCapabilities[role];
}

export function roleHasCapability(
  role: MembershipRole,
  capability: WorkspaceCapability,
): boolean {
  return (roleCapabilities[role] as readonly WorkspaceCapability[]).includes(
    capability,
  );
}
