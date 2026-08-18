import { SeedBrandRepository } from "@/feature/brand-library/repositories/SeedBrandRepository";
import type { CandidateRecord, PipelineStage } from "@/feature/crm/models/CandidateRecord";
import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import type { DemoCandidate } from "@/feature/demo/models/DemoScenario";
import type { DemoScenarioRepository } from "@/feature/demo/repositories/DemoScenarioRepository";
import { SeedDemoScenarioRepository } from "@/feature/demo/repositories/SeedDemoScenarioRepository";
import { AssessmentInvitationService } from "../services/AssessmentInvitationService";
import { createDemoCandidateLifecycleService } from "../services/DemoCandidateLifecycleService";
import { demoCandidateOverlayStore } from "../repositories/DemoCandidateOverlayStore";
import { getConferenceReferralHistory } from "@/feature/demo/data/conferenceReferralHistory";

import type { CandidateAttention, CandidateCRMItem, CandidateCRMState } from "../models/CandidateCRMState";

const STAGE_LABELS: Record<PipelineStage, string> = {
  lead: "New Candidate",
  "assessment-started": "Assessment Pending",
  "assessment-completed": "Assessment Complete",
  discovery: "Discovery",
  education: "Education",
  "brand-matching": "Brand Strategy",
  validation: "Validation",
  referral: "Referral / Introduction",
  "fdd-delivered": "FDD Delivered",
  funding: "Funding",
  "meet-the-team": "Meet the Team",
  awarded: "Awarded",
  training: "Training",
  opened: "Opened",
  "closed-lost": "Closed Lost",
};

const STAGE_ORDER = Object.keys(STAGE_LABELS) as PipelineStage[];
const PRIMARY_JOURNEY: readonly PipelineStage[] = [
  "lead", "assessment-started", "assessment-completed", "discovery",
  "brand-matching", "validation", "referral", "awarded",
] as const;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function attentionFor(candidate: DemoCandidate | undefined): CandidateAttention {
  if (!candidate) return "on-track";
  if (candidate.pipelineStage === "awarded") return "on-track";
  if (candidate.pipelineStage === "referral" || candidate.referralReadiness >= 90) return "referral-ready";
  if (candidate.buyingMomentum === "slowing" || candidate.discovery.detectedRisks.length > 0) return "needs-attention";
  return "on-track";
}

export class CandidateCRMRuntime {
  public constructor(
    private readonly candidates: CandidateRepository = new SeedCandidateRepository(),
    private readonly scenarios: DemoScenarioRepository = new SeedDemoScenarioRepository(),
    private readonly brands = new SeedBrandRepository(),
    private readonly invitations = new AssessmentInvitationService(candidates),
  ) {}

  public async load(): Promise<CandidateCRMState> {
    const [records, scenario, brands] = await Promise.all([
      this.candidates.getAll(),
      this.scenarios.getScenario(),
      this.brands.getAll(),
    ]);
    const demoById = new Map(scenario.candidates.map((candidate) => [candidate.id, candidate]));
    const brandsById = new Map(brands.map((brand) => [brand.id, brand.name]));
    const candidates = records.map((record) => this.toItem(record, demoById.get(record.id), brandsById));
    const represented = new Set(candidates.map((candidate) => candidate.pipelineStage));

    return {
      candidates,
      stages: [...PRIMARY_JOURNEY, ...STAGE_ORDER.filter((stage) => represented.has(stage) && !PRIMARY_JOURNEY.includes(stage))]
        .map((stage, sequence) => ({ stage, label: STAGE_LABELS[stage], sequence })),
    };
  }

  private toItem(record: CandidateRecord, demo: DemoCandidate | undefined, brands: Map<string, string>): CandidateCRMItem {
    const assessmentPending = !record.intelligence;
    const attention = attentionFor(demo);
    const invitation = this.invitations.getForCandidate(record.id);
    const lifecycleAction = createDemoCandidateLifecycleService(this.candidates).getRecommendedAction(record);
    const overlayReferrals = demoCandidateOverlayStore.getCandidateReferrals(record.id);
    const referrals = overlayReferrals.length ? overlayReferrals : getConferenceReferralHistory(record.id);
    const awaitingApproval = referrals.filter((item) => item.status === "ready-for-review").length;
    const approvedReferrals = referrals.filter((item) => item.status === "approved");
    const workflowAction = record.pipelineStage === "awarded"
      ? { actionLabel: referrals.length ? "View Referral History" : "Open Candidate", actionHref: referrals.length ? `/crm/candidates/${record.id}/referral` : `/crm/candidates/${record.id}`, actionKind: "navigate" as const }
      : referrals.length
      ? { actionLabel: approvedReferrals.length ? `Record ${approvedReferrals[0].brandName} Introduction` : awaitingApproval ? `Review ${awaitingApproval} Referral Package${awaitingApproval === 1 ? "" : "s"}` : "View Referrals", actionHref: `/crm/candidates/${record.id}/referral`, actionKind: "navigate" as const }
      : record.pipelineStage === "referral"
      ? { actionLabel: "Prepare Referral", actionHref: `/crm/candidates/${record.id}/referral`, actionKind: "navigate" as const }
      : record.pipelineStage === "brand-matching"
      ? { actionLabel: "Review Brand Strategy", actionHref: `/crm/candidates/${record.id}/strategy`, actionKind: "navigate" as const }
      : lifecycleAction
      ? { actionLabel: lifecycleAction.label, actionHref: `/crm/candidates/${record.id}`, actionKind: "lifecycle" as const }
      : record.pipelineStage === "lead"
      ? { actionLabel: "Send Assessment", actionHref: `/crm/candidates/${record.id}`, actionKind: "navigate" as const }
      : record.pipelineStage === "assessment-started" && invitation
        ? { actionLabel: "Open Assessment", actionHref: invitation.assessmentUrl, actionKind: "navigate" as const }
        : record.pipelineStage === "assessment-started"
          ? { actionLabel: "Send Assessment", actionHref: `/crm/candidates/${record.id}`, actionKind: "navigate" as const }
          : attention === "needs-attention"
            ? { actionLabel: "Review Context", actionHref: `/crm/candidates/${record.id}`, actionKind: "navigate" as const }
            : { actionLabel: "Open Candidate", actionHref: `/crm/candidates/${record.id}`, actionKind: "navigate" as const };

    return {
      id: record.id,
      fullName: `${record.firstName} ${record.lastName}`,
      initials: demo?.initials ?? `${record.firstName[0] ?? ""}${record.lastName[0] ?? ""}`,
      email: record.email,
      location: [record.city, record.state].filter(Boolean).join(", "),
      status: record.status,
      pipelineStage: record.pipelineStage,
      stageLabel: STAGE_LABELS[record.pipelineStage],
      readiness: record.intelligence?.overallReadiness ?? null,
      readinessLabel: assessmentPending ? (record.pipelineStage === "lead" ? "Not Yet Evaluated" : "Assessment Pending") : `${record.intelligence!.overallReadiness}%`,
      bestBrand: demo ? brands.get(demo.recommendedBrands[0]?.brandId) ?? null : null,
      lastActivityLabel: formatDate(record.lastActivityAt),
      nextAction: record.pipelineStage === "awarded" ? "Prepare Onboarding" : referrals.length ? `${referrals.length} referral${referrals.length === 1 ? "" : "s"} · ${referrals.filter((item) => item.status === "introduced").length} introduced` : demo?.nextBestAction ?? (record.pipelineStage === "lead" ? "Send Assessment Invitation" : record.pipelineStage === "assessment-started" ? "Complete Assessment" : "Review Candidate Intelligence"),
      attention,
      attentionLabel: record.pipelineStage === "awarded" ? "Placement Complete" : attention === "needs-attention" ? "Needs Attention" : attention === "referral-ready" ? "Referral Ready" : "On Track",
      momentum: demo?.buyingMomentum ?? "steady",
      referralReady: record.pipelineStage !== "awarded" && (record.pipelineStage === "referral" || (demo?.referralReadiness ?? 0) >= 90),
      href: `/crm/candidates/${record.id}`,
      ...workflowAction,
      momentumLabel: demo?.buyingMomentum === "accelerating" ? "Accelerating" : demo?.buyingMomentum === "slowing" ? "Slowing" : "Steady",
    };
  }
}
