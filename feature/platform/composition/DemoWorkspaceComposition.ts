import "server-only";

import { SeedAssessmentRepository } from "@/feature/assessment-engine/repositories/SeedAssessmentRepository";
import { conferenceAssessmentStore } from "@/feature/assessment-engine/conference/ConferenceAssessmentStore";
import { SeedBrandRepository } from "@/feature/brand-library/repositories/SeedBrandRepository";
import { DemoCalendarRepository } from "@/feature/calendar/repositories/DemoCalendarRepository";
import { DemoEmailRepository } from "@/feature/communications/repositories/DemoEmailRepository";
import { DemoEmailDeliveryService } from "@/feature/communications/services/DemoEmailDeliveryService";
import { DemoCandidateActivityRepository } from "@/feature/crm/repositories/DemoCandidateActivityRepository";
import { DemoCandidateResolutionService } from "@/feature/crm/services/DemoCandidateResolutionService";
import { DemoCandidateIntakeActivitySink } from "@/feature/crm/services/DemoCandidateIntakeActivitySink";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { SeedContactRepository } from "@/feature/contacts/repositories/SeedContactRepository";
import { SeedMarketingRepository } from "@/feature/marketing/repositories/SeedMarketingRepository";
import { SeedMarketingDeliveryRepository } from "@/feature/marketing/delivery/SeedMarketingDeliveryRepository";
import { LocalMarketingDeliveryProvider } from "@/feature/marketing/delivery/providers";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { SeedDemoScenarioRepository } from "@/feature/demo/repositories/SeedDemoScenarioRepository";
import { DemoEngagementPlaybookRepository } from "@/feature/engagement-playbook/repositories/DemoEngagementPlaybookRepository";
import { SeedIntelligenceEngine } from "@/feature/intelligence/services/SeedIntelligenceEngine";
import { DemoConsultantPipelineRepository } from "@/feature/pipeline/repositories/DemoConsultantPipelineRepository";
import { DemoReferralDeliveryService } from "@/feature/referral-package/services/DemoReferralDeliveryService";
import { DemoTaskRepository } from "@/feature/tasks/repositories/DemoTaskRepository";
import { DemoTeamOperationsRepository } from "@/feature/team-mission-control/repositories/DemoTeamOperationsRepository";
import { demoTeamViewer } from "@/feature/team-mission-control/repositories/DemoTeamOperationsRepository";
import { getConferenceDemoUser } from "@/lib/auth/demo-session";
import { capabilitiesForRole } from "@/feature/identity/auth/capabilities";

import type { WorkspaceFeatureAvailability } from "./FeatureAvailability";
import type { DemoWorkspacePresentation } from "./DemoWorkspacePresentation";
import { DemoWorkspaceRuntimeFactory } from "./DemoWorkspaceRuntimeFactory";
import type {
  DemoIdentityId,
  DemoWorkspaceId,
  DemoWorkspaceSession,
  WorkspaceComposer,
  WorkspaceComposition,
  WorkspaceSession,
} from "./WorkspaceComposition";

const demoWorkspaceId = "conference-demo-workspace" as DemoWorkspaceId;

const availableFeature = {
  implementation: { status: "available" },
  authorization: { status: "authorized" },
  provider: { status: "not-applicable" },
  commercialEntitlement: { status: "not-evaluated" },
  usageAllowance: { status: "not-metered" },
  consentAndCompliance: { status: "not-applicable" },
} as const;

const demoFeatures: WorkspaceFeatureAvailability = {
  "mission-control": availableFeature,
  candidates: availableFeature,
  contacts: availableFeature,
  assessments: availableFeature,
  discovery: availableFeature,
  tasks: availableFeature,
  calendar: availableFeature,
  communications: availableFeature,
  "team-mission-control": availableFeature,
  "brand-intelligence": availableFeature,
  "brand-strategy": availableFeature,
  referrals: availableFeature,
  "consultant-settings": availableFeature,
  "pipeline-settings": availableFeature,
};

export interface DemoWorkspaceDependencies {
  assessments: SeedAssessmentRepository;
  conferenceAssessments: typeof conferenceAssessmentStore;
  brands: SeedBrandRepository;
  candidates: SeedCandidateRepository;
  contacts: SeedContactRepository;
  marketing: SeedMarketingRepository;
  marketingDelivery: SeedMarketingDeliveryRepository;
  marketingDeliveryProvider: LocalMarketingDeliveryProvider;
  scenarios: SeedDemoScenarioRepository;
  candidateActivities: DemoCandidateActivityRepository;
  pipeline: DemoConsultantPipelineRepository;
  tasks: DemoTaskRepository;
  calendar: DemoCalendarRepository;
  emailMessages: DemoEmailRepository;
  emailDelivery: DemoEmailDeliveryService;
  engagementPlaybook: DemoEngagementPlaybookRepository;
  referralDelivery: DemoReferralDeliveryService;
  teamOperations: DemoTeamOperationsRepository;
  intelligence: SeedIntelligenceEngine;
  candidateResolution: DemoCandidateResolutionService;
  candidateIntakeActivities: DemoCandidateIntakeActivitySink;
}

export interface DemoWorkspaceComposition
  extends WorkspaceComposition<DemoWorkspaceDependencies> {
  session: DemoWorkspaceSession;
  presentation: DemoWorkspacePresentation;
  runtimes: DemoWorkspaceRuntimeFactory;
}

export async function resolveDemoWorkspaceSession(): Promise<
  DemoWorkspaceSession | null
> {
  const user = await getConferenceDemoUser();
  if (!user) return null;

  return {
    kind: "demo",
    isDemo: true,
    identity: {
      kind: "demo-identity",
      id: user.id as DemoIdentityId,
      displayName: demoConsultant.displayName,
    },
    workspace: {
      kind: "demo-workspace",
      id: demoWorkspaceId,
      displayName: "Conference Demo Workspace",
    },
    capabilities: capabilitiesForRole(demoTeamViewer.role),
  };
}

export class DemoWorkspaceComposer
  implements WorkspaceComposer<DemoWorkspaceDependencies>
{
  async compose(session: WorkspaceSession): Promise<DemoWorkspaceComposition> {
    if (session.kind !== "demo") {
      throw new Error("Demo composition requires an active demo session.");
    }

    const candidates = new SeedCandidateRepository();
    const marketing = new SeedMarketingRepository();
    const dependencies: DemoWorkspaceDependencies = {
      assessments: new SeedAssessmentRepository(), conferenceAssessments: conferenceAssessmentStore,
      brands: new SeedBrandRepository(), candidates, contacts: new SeedContactRepository(candidates), scenarios: new SeedDemoScenarioRepository(),
      marketing, marketingDelivery: new SeedMarketingDeliveryRepository(marketing), marketingDeliveryProvider: new LocalMarketingDeliveryProvider(),
      candidateActivities: new DemoCandidateActivityRepository(), pipeline: new DemoConsultantPipelineRepository(),
      tasks: new DemoTaskRepository(), calendar: new DemoCalendarRepository(), emailMessages: new DemoEmailRepository(),
      emailDelivery: new DemoEmailDeliveryService(), engagementPlaybook: new DemoEngagementPlaybookRepository(),
      referralDelivery: new DemoReferralDeliveryService(), teamOperations: new DemoTeamOperationsRepository(),
      intelligence: new SeedIntelligenceEngine(), candidateResolution: new DemoCandidateResolutionService(candidates),
      candidateIntakeActivities: new DemoCandidateIntakeActivitySink(),
    };
    return {
      session,
      features: demoFeatures,
      runtimes: new DemoWorkspaceRuntimeFactory(dependencies),
      presentation: {
        kind: "demo",
        workspace: {
          name: session.workspace.displayName,
          organizationPublicId: null,
        },
        identity: {
          displayName: demoConsultant.displayName,
          greetingName: demoConsultant.firstName,
          email: demoConsultant.email ?? null,
          title: demoConsultant.title,
          initials: demoConsultant.initials,
        },
        role: demoTeamViewer.role,
        capabilities: session.capabilities,
        features: demoFeatures,
        temporaryDataIndicator: {
          label: "Demo Workspace — temporary data",
          detail: "Changes may reset and are not production records.",
        },
      },
      dependencies,
    };
  }
}

export async function resolveDemoWorkspaceComposition(): Promise<
  DemoWorkspaceComposition | null
> {
  const session = await resolveDemoWorkspaceSession();
  return session ? new DemoWorkspaceComposer().compose(session) : null;
}
