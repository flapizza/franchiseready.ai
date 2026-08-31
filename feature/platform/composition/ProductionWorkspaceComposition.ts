import "server-only";

import { SupabaseAssessmentRepository } from "@/feature/assessment-engine/production/SupabaseAssessmentRepository";
import { ProductionCommunicationsWorkspaceRuntime } from "@/feature/communications/runtime/ProductionCommunicationsWorkspaceRuntime";
import { ProductionEmailRepository } from "@/feature/communications/repositories/ProductionEmailRepository";
import { ProductionEmailMessageService } from "@/feature/communications/services/ProductionEmailMessageService";
import { ConnectedEmailAccountRepository } from "@/feature/connected-email/repositories/ConnectedEmailAccountRepository";
import { OAuthTransactionRepository } from "@/feature/connected-email/repositories/OAuthTransactionRepository";
import { GoogleConnectionService } from "@/feature/connected-email/services/GoogleConnectionService";
import { GoogleConnectionProvider } from "@/feature/connected-email/providers/google/GoogleConnectionProvider";
import { SupabaseCandidateRepository } from "@/feature/crm/repositories/SupabaseCandidateRepository";
import { ProductionCandidateResolutionService } from "@/feature/crm/services/ProductionCandidateResolutionService";
import { ProductionCandidateCRMRuntime } from "@/feature/crm/runtime/ProductionCandidateCRMRuntime";
import { SupabaseDiscoveryRepository } from "@/feature/discovery/production/SupabaseDiscoveryRepository";
import { ProductionConsultantProfileRepository } from "@/feature/consultant-profile/repositories/ProductionConsultantProfileRepository";
import { ProductionOrganizationSettingsRepository } from "@/feature/organization-settings/repositories/ProductionOrganizationSettingsRepository";
import { ProductionMembershipOnboardingRepository } from "@/feature/onboarding/repositories/ProductionMembershipOnboardingRepository";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { WorkspacePresentation } from "@/feature/layout/models/WorkspacePresentation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import type { FeatureAvailability, WorkspaceFeatureAvailability } from "./FeatureAvailability";
import type {
  ProductionMembershipId,
  ProductionOrganizationId,
  ProductionWorkspaceSession,
  SupabaseUserId,
  WorkspaceComposition,
} from "./WorkspaceComposition";

const available = (provider: FeatureAvailability["provider"] = { status: "not-applicable" }): FeatureAvailability => ({
  implementation: { status: "available" },
  authorization: { status: "authorized" },
  provider,
  commercialEntitlement: { status: "not-evaluated" },
  usageAllowance: { status: "not-evaluated" },
  consentAndCompliance: { status: "not-evaluated" },
});

const unavailable: FeatureAvailability = {
  implementation: { status: "not-implemented" },
  authorization: { status: "authorized" },
  provider: { status: "not-evaluated" },
  commercialEntitlement: { status: "not-evaluated" },
  usageAllowance: { status: "not-evaluated" },
  consentAndCompliance: { status: "not-evaluated" },
};

const productionFeatures: WorkspaceFeatureAvailability = {
  "mission-control": unavailable,
  candidates: available(),
  assessments: available(),
  discovery: available(),
  tasks: unavailable,
  calendar: unavailable,
  communications: available({ status: "not-evaluated" }),
  "team-mission-control": unavailable,
  "brand-intelligence": unavailable,
  "brand-strategy": unavailable,
  referrals: unavailable,
  "consultant-settings": available(),
  "pipeline-settings": unavailable,
};

export interface ProductionWorkspaceDependencies {
  workspaceContext: AuthenticatedWorkspaceContext;
  candidates: SupabaseCandidateRepository;
  assessments: SupabaseAssessmentRepository;
  discovery: SupabaseDiscoveryRepository;
  emailAccounts: ConnectedEmailAccountRepository;
  emailAccountSummaries: () => Promise<ReturnType<typeof ConnectedEmailAccountRepository.toSummary>[]>;
  oauthTransactions: OAuthTransactionRepository;
  googleConnections: GoogleConnectionService;
  googleProvider: GoogleConnectionProvider;
  emailMessages: ProductionEmailRepository;
  emailDelivery: ProductionEmailMessageService;
  communications: ProductionCommunicationsWorkspaceRuntime;
  candidateResolution: ProductionCandidateResolutionService;
  candidateCRM: ProductionCandidateCRMRuntime;
  consultantProfile: ProductionConsultantProfileRepository;
  organizationSettings: ProductionOrganizationSettingsRepository;
  membershipOnboarding: ProductionMembershipOnboardingRepository;
}

export interface ProductionWorkspaceComposition
  extends WorkspaceComposition<ProductionWorkspaceDependencies> {
  session: ProductionWorkspaceSession;
  presentation: WorkspacePresentation & { kind: "production"; temporaryDataIndicator: null };
}

function contextFromSession(session: ProductionWorkspaceSession): AuthenticatedWorkspaceContext {
  return {
    user: { id: session.identity.userId, email: session.identity.email },
    organization: {
      id: session.organization.id,
      publicId: session.organization.publicId,
      name: session.organization.name,
    },
    membership: {
      id: session.membership.id,
      role: session.membership.role,
      status: "active",
      managerMembershipId: session.membership.managerMembershipId,
    },
    capabilities: session.capabilities,
  };
}

function identityPresentation(email: string | null, role: ProductionWorkspaceSession["membership"]["role"], persistedName?: string | null, persistedTitle?: string | null) {
  const displayName = persistedName ?? email ?? "Authenticated consultant";
  const initials = displayName.split(/[^A-Za-z0-9]+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]?.toUpperCase()).join("") || "FC";
  const title = persistedTitle ?? { owner: "Organization Owner", admin: "Organization Administrator", manager: "Franchise Manager", consultant: "Franchise Consultant" }[role];
  return { displayName, greetingName: displayName, email, title, initials };
}

export async function createProductionWorkspaceComposition(
  session: ProductionWorkspaceSession,
): Promise<ProductionWorkspaceComposition> {
  const client = await createServerSupabaseClient();
  const context = contextFromSession(session);
  const consultantProfile = new ProductionConsultantProfileRepository(client, context);
  const profile = await consultantProfile.getOwn();

  return {
    session,
    features: productionFeatures,
    presentation: {
      kind: "production",
      workspace: {
        name: session.organization.name,
        organizationPublicId: session.organization.publicId,
      },
      identity: identityPresentation(session.identity.email, session.membership.role, profile?.displayName, profile?.professionalTitle),
      role: session.membership.role,
      capabilities: session.capabilities,
      features: productionFeatures,
      temporaryDataIndicator: null,
    },
    dependencies: (() => { const candidates = new SupabaseCandidateRepository(client, context); return {
      workspaceContext: context,
      candidates,
      assessments: new SupabaseAssessmentRepository(client, context),
      discovery: new SupabaseDiscoveryRepository(client),
      emailAccounts: new ConnectedEmailAccountRepository(),
      emailAccountSummaries: async () => (await new ConnectedEmailAccountRepository().listOwn(context)).map(ConnectedEmailAccountRepository.toSummary),
      oauthTransactions: new OAuthTransactionRepository(),
      googleConnections: new GoogleConnectionService(),
      googleProvider: new GoogleConnectionProvider(),
      emailMessages: new ProductionEmailRepository(context),
      emailDelivery: new ProductionEmailMessageService(context),
      communications: new ProductionCommunicationsWorkspaceRuntime(context),
      candidateResolution: new ProductionCandidateResolutionService(),
      candidateCRM: new ProductionCandidateCRMRuntime(candidates),
      consultantProfile,
      organizationSettings: new ProductionOrganizationSettingsRepository(client, context),
      membershipOnboarding: new ProductionMembershipOnboardingRepository(client, context),
    }; })(),
  };
}

export function productionSessionFromContext(
  context: AuthenticatedWorkspaceContext,
): ProductionWorkspaceSession {
  return {
    kind: "production",
    isDemo: false,
    identity: {
      kind: "supabase-user",
      userId: context.user.id as SupabaseUserId,
      email: context.user.email,
    },
    organization: {
      kind: "production-organization",
      id: context.organization.id as ProductionOrganizationId,
      publicId: context.organization.publicId,
      name: context.organization.name,
    },
    membership: {
      kind: "production-membership",
      id: context.membership.id as ProductionMembershipId,
      organizationId: context.organization.id as ProductionOrganizationId,
      role: context.membership.role,
      status: "active",
      managerMembershipId: context.membership.managerMembershipId as ProductionMembershipId | null,
    },
    capabilities: context.capabilities,
  };
}
