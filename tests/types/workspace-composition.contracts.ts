import type {
  DemoIdentityId,
  DemoWorkspaceId,
  DemoWorkspaceSession,
  ProductionMembershipId,
  ProductionOrganizationId,
  ProductionWorkspaceSession,
  SupabaseUserId,
  WorkspaceComposer,
  WorkspaceComposition,
  WorkspaceResolution,
  WorkspaceSession,
  WorkspaceSessionResolver,
} from "../../feature/platform/composition/WorkspaceComposition";
import type {
  FeatureAvailability,
  WorkspaceFeatureAvailability,
} from "../../feature/platform/composition/FeatureAvailability";
import { createProductionWorkspaceComposition } from "../../feature/platform/composition/ProductionWorkspaceComposition";

declare const demoIdentityId: DemoIdentityId;
declare const demoWorkspaceId: DemoWorkspaceId;
declare const supabaseUserId: SupabaseUserId;
declare const membershipId: ProductionMembershipId;
declare const organizationId: ProductionOrganizationId;

const demoSession: DemoWorkspaceSession = {
  kind: "demo",
  isDemo: true,
  identity: { kind: "demo-identity", id: demoIdentityId, displayName: "Demo" },
  workspace: {
    kind: "demo-workspace",
    id: demoWorkspaceId,
    displayName: "Demo Workspace",
  },
  capabilities: [],
};

const productionSession: ProductionWorkspaceSession = {
  kind: "production",
  isDemo: false,
  identity: { kind: "supabase-user", userId: supabaseUserId, email: null },
  organization: {
    kind: "production-organization",
    id: organizationId,
    publicId: "org_public",
    name: "Production",
  },
  membership: {
    kind: "production-membership",
    id: membershipId,
    organizationId,
    role: "consultant",
    status: "active",
    managerMembershipId: null,
  },
  capabilities: ["organization:view"],
};

const discriminate = (session: WorkspaceSession) => {
  if (session.kind === "demo") {
    const identity: DemoIdentityId = session.identity.id;
    return identity;
  }

  const identity: SupabaseUserId = session.identity.userId;
  const membership: ProductionMembershipId = session.membership.id;
  return `${identity}:${membership}`;
};

discriminate(demoSession);
discriminate(productionSession);

declare const resolver: WorkspaceSessionResolver;
const resolution: Promise<WorkspaceResolution> = resolver.resolve();

declare const productionIdentity: ProductionWorkspaceSession["identity"];
const bootstrapResolution: WorkspaceResolution = {
  status: "needs-workspace-bootstrap",
  identity: productionIdentity,
};
const invalidInvitationResolution: WorkspaceResolution = {
  status: "invitation-unavailable",
  reason: "expired",
};
const selectionResolution: WorkspaceResolution = {
  status: "workspace-selection-required",
  identity: productionIdentity,
  memberships: [],
};

interface CandidateDependencies {
  candidates: { readonly kind: "candidate-repository" };
}

declare const composer: WorkspaceComposer<CandidateDependencies>;
const composition: Promise<WorkspaceComposition<CandidateDependencies>> =
  composer.compose(productionSession);
void resolution;
void bootstrapResolution;
void invalidInvitationResolution;
void selectionResolution;
void composition;

createProductionWorkspaceComposition(productionSession);
// @ts-expect-error demo sessions cannot masquerade as production sessions
createProductionWorkspaceComposition(demoSession);

// A demo identifier cannot stand in for a Supabase user or membership.
// @ts-expect-error opaque demo identity is not a Supabase user identity
const invalidUser: SupabaseUserId = demoIdentityId;
// @ts-expect-error opaque demo identity is not a production membership
const invalidMembership: ProductionMembershipId = demoIdentityId;
void invalidUser;
void invalidMembership;

const availability: FeatureAvailability = {
  implementation: { status: "not-implemented" },
  authorization: { status: "not-authorized" },
  provider: { status: "not-evaluated" },
  commercialEntitlement: { status: "not-evaluated" },
  usageAllowance: { status: "not-evaluated" },
  consentAndCompliance: { status: "not-evaluated" },
};

declare const allFeatures: WorkspaceFeatureAvailability;
const candidateAvailability: FeatureAvailability = allFeatures.candidates;
void availability;
void candidateAvailability;
