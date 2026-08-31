import "server-only";

import type {
  MembershipRole,
  WorkspaceCapability,
} from "@/feature/identity/models/WorkspaceIdentity";
import type { WorkspaceFeatureAvailability } from "./FeatureAvailability";

declare const demoIdentityIdBrand: unique symbol;
declare const demoWorkspaceIdBrand: unique symbol;
declare const supabaseUserIdBrand: unique symbol;
declare const productionMembershipIdBrand: unique symbol;
declare const productionOrganizationIdBrand: unique symbol;

/** Opaque identity types prevent accidental structural interchange. */
export type DemoIdentityId = string & {
  readonly [demoIdentityIdBrand]: "DemoIdentityId";
};
export type DemoWorkspaceId = string & {
  readonly [demoWorkspaceIdBrand]: "DemoWorkspaceId";
};
export type SupabaseUserId = string & {
  readonly [supabaseUserIdBrand]: "SupabaseUserId";
};
export type ProductionMembershipId = string & {
  readonly [productionMembershipIdBrand]: "ProductionMembershipId";
};
export type ProductionOrganizationId = string & {
  readonly [productionOrganizationIdBrand]: "ProductionOrganizationId";
};

export interface DemoWorkspaceIdentity {
  kind: "demo-identity";
  id: DemoIdentityId;
  displayName: string;
}

export interface SupabaseWorkspaceIdentity {
  kind: "supabase-user";
  userId: SupabaseUserId;
  email: string | null;
}

export interface ProductionWorkspaceMembership {
  kind: "production-membership";
  id: ProductionMembershipId;
  organizationId: ProductionOrganizationId;
  role: MembershipRole;
  status: "active";
  managerMembershipId: ProductionMembershipId | null;
}

export interface DemoWorkspaceSession {
  kind: "demo";
  isDemo: true;
  identity: DemoWorkspaceIdentity;
  workspace: {
    kind: "demo-workspace";
    id: DemoWorkspaceId;
    displayName: string;
  };
  capabilities: readonly WorkspaceCapability[];
}

export interface ProductionWorkspaceSession {
  kind: "production";
  isDemo: false;
  identity: SupabaseWorkspaceIdentity;
  organization: {
    kind: "production-organization";
    id: ProductionOrganizationId;
    publicId: string;
    name: string;
  };
  membership: ProductionWorkspaceMembership;
  capabilities: readonly WorkspaceCapability[];
}

export type WorkspaceSession =
  | DemoWorkspaceSession
  | ProductionWorkspaceSession;

export type WorkspaceResolution =
  | { status: "unauthenticated" }
  | {
      status: "needs-workspace-bootstrap";
      identity: SupabaseWorkspaceIdentity;
    }
  | {
      status: "invitation-available";
      identity: SupabaseWorkspaceIdentity;
      invitation: {
        id: string;
        organizationName: string;
      };
    }
  | {
      status: "invitation-unavailable";
      reason: "invalid" | "expired" | "revoked";
    }
  | {
      status: "onboarding-incomplete";
      identity: SupabaseWorkspaceIdentity;
      organizationId: ProductionOrganizationId;
    }
  | {
      status: "suspended";
      identity: SupabaseWorkspaceIdentity;
      organizationId: ProductionOrganizationId;
      membershipId: ProductionMembershipId;
    }
  | {
      status: "workspace-selection-required";
      identity: SupabaseWorkspaceIdentity;
      memberships: readonly {
        id: ProductionMembershipId;
        organizationId: ProductionOrganizationId;
        organizationName: string;
      }[];
    }
  | { status: "resolved"; session: WorkspaceSession };

/** Resolves identity and workspace state without selecting feature adapters. */
export interface WorkspaceSessionResolver {
  resolve(): Promise<WorkspaceResolution>;
}

export type WorkspaceDependencies = object;

/**
 * Contract only. Checkpoints 2 and 3 will provide the demo and production
 * adapters; Checkpoint 1 intentionally creates no composition factory.
 */
export interface WorkspaceComposition<
  TDependencies extends WorkspaceDependencies = WorkspaceDependencies,
> {
  session: WorkspaceSession;
  features: WorkspaceFeatureAvailability;
  dependencies: Readonly<TDependencies>;
}

/** Composes dependencies only after a workspace session has been resolved. */
export interface WorkspaceComposer<
  TDependencies extends WorkspaceDependencies = WorkspaceDependencies,
> {
  compose(
    session: WorkspaceSession,
  ): Promise<WorkspaceComposition<TDependencies>>;
}
