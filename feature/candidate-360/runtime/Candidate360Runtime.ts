import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import type { CandidateRecord } from "@/feature/crm/models/CandidateRecord";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { AssessmentInvitationService } from "@/feature/crm/services/AssessmentInvitationService";
import type { Activity, ActivityType } from "@/feature/crm/models/Activity";
import type { CandidateActivityRepository } from "@/feature/crm/repositories/CandidateActivityRepository";
import { DemoCandidateActivityRepository } from "@/feature/crm/repositories/DemoCandidateActivityRepository";
import type { DemoScenarioRepository } from "@/feature/demo/repositories/DemoScenarioRepository";
import { SeedDemoScenarioRepository } from "@/feature/demo/repositories/SeedDemoScenarioRepository";
import { createDemoCandidateLifecycleService } from "@/feature/crm/services/DemoCandidateLifecycleService";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import { getConferenceReferralHistory } from "@/feature/demo/data/conferenceReferralHistory";
import { CandidateBrandStrategyRuntime } from "@/feature/brand-strategy/runtime/CandidateBrandStrategyRuntime";

import type { Candidate360State, CandidateActivityState } from "../models/Candidate360State";

function formatStage(stage: string): string {
  if (stage === "lead") return "New Candidate";
  if (stage === "assessment-started") return "Assessment Pending";
  if (stage === "assessment-completed") return "Assessment Complete";
  return stage
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

const activityPresentation: Record<ActivityType, Pick<CandidateActivityState, "icon" | "tone">> = {
  "candidate-created": { icon: "candidate", tone: "blue" },
  "assessment-started": { icon: "assessment", tone: "teal" },
  "assessment-completed": { icon: "assessment", tone: "emerald" },
  "discovery-started": { icon: "discovery", tone: "blue" },
  "discovery-completed": { icon: "discovery", tone: "teal" },
  "validation-started": { icon: "stage", tone: "amber" },
  "brand-presented": { icon: "brand", tone: "blue" },
  "brand-strategy-ready": { icon: "brand", tone: "emerald" },
  "referral-ready": { icon: "referral", tone: "emerald" },
  "referral-generated": { icon: "referral", tone: "blue" },
  "candidate-introduced": { icon: "referral", tone: "teal" },
  "validation-completed": { icon: "stage", tone: "emerald" },
  "fdd-delivered": { icon: "activity", tone: "blue" },
  "funding-updated": { icon: "activity", tone: "amber" },
  "meet-the-team": { icon: "activity", tone: "teal" },
  award: { icon: "referral", tone: "emerald" },
  "note-added": { icon: "activity", tone: "slate" },
  "task-completed": { icon: "activity", tone: "emerald" },
  "email-sent": { icon: "assessment", tone: "teal" },
  "status-changed": { icon: "stage", tone: "blue" },
};

function formatActivityDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export class Candidate360Runtime {
  public constructor(
    private readonly candidates: CandidateRepository =
      new SeedCandidateRepository(),
    private readonly scenarios: DemoScenarioRepository =
      new SeedDemoScenarioRepository(),
    private readonly activityRepository: CandidateActivityRepository =
      new DemoCandidateActivityRepository(),
  ) {}

  public async load(candidateId: string): Promise<Candidate360State | null> {
    const candidate = await this.candidates.getById(candidateId);

    if (!candidate) return null;

    const invitation = new AssessmentInvitationService(this.candidates).getForCandidate(candidate.id);
    const scenarioCandidate = await this.scenarios.getCandidateById(candidate.id);
    const intelligence = candidate.intelligence;
    const lifecycleAction = createDemoCandidateLifecycleService(this.candidates).getRecommendedAction(candidate);
    const overlayReferrals = demoCandidateOverlayStore.getCandidateReferrals(candidate.id);
    const referrals = overlayReferrals.length ? overlayReferrals : getConferenceReferralHistory(candidate.id);
    const brandStrategy = ["brand-matching", "referral", "awarded"].includes(candidate.pipelineStage) ? await new CandidateBrandStrategyRuntime().load(candidate.id) : null;
    const awaitingApproval = referrals.filter((item) => item.status === "ready-for-review").length;
    const approvedReferrals = referrals.filter((item) => item.status === "approved").length;
    const assessmentStatus = candidate.pipelineStage === "assessment-started"
      ? "pending" as const
      : intelligence ? "completed" as const : "not-completed" as const;
    const lifecycleDetail = this.lifecycleDetail(candidate.pipelineStage);
    const assessment = assessmentStatus === "completed"
      ? { label: candidate.pipelineStage === "awarded" ? "Placement Awarded" : "Assessment Complete", detail: lifecycleDetail, invitationSent: Boolean(invitation), actionLabel: candidate.pipelineStage === "awarded" ? "View Referral History" : "Open Candidate Workspace", actionHref: candidate.pipelineStage === "awarded" ? `/crm/candidates/${candidate.id}/referral` : `/crm/${candidate.id}/discovery` }
      : assessmentStatus === "pending"
        ? { label: "Assessment Pending", detail: invitation ? `Invitation sent to ${invitation.candidateEmail}. The candidate has not completed the assessment yet.` : "The assessment is pending, but an active invitation link is not available. Send a new invitation to continue.", invitationSent: Boolean(invitation), actionLabel: invitation ? "Open Assessment" : "Send Assessment", actionHref: invitation?.assessmentUrl }
        : { label: "Assessment Not Started", detail: "No completed assessment or Candidate Intelligence is available.", invitationSent: false, actionLabel: "Send Assessment" };

    const overlayActivities = await this.activityRepository.getByCandidateId(candidate.id);
    const baselineActivities: CandidateActivityState[] = (scenarioCandidate?.recentActivity ?? []).map((activity) => ({
      id: activity.id, title: activity.title, description: activity.detail,
      timestamp: activity.occurredAt, dateLabel: formatActivityDate(activity.occurredAt), icon: "activity", tone: "slate",
    }));
    const activities = [...baselineActivities, ...overlayActivities.map((activity) => this.toActivity(activity))]
      .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp));

    return {
      id: candidate.id,
      fullName: `${candidate.firstName} ${candidate.lastName}`,
      currentStage: formatStage(candidate.pipelineStage),
      hasIntelligence: intelligence !== null,
      assessmentStatus,
      assessmentUrl: invitation?.assessmentUrl,
      readinessScore: intelligence?.overallReadiness ?? null,
      buyingConfidence: intelligence?.timing.confidence ?? null,
      recommendationConfidence: intelligence?.overallReadiness ?? null,
      executiveSummary: intelligence?.executiveSummary ?? "Assessment not completed. Candidate Intelligence will become available after assessment completion.",
      financialReadiness: intelligence?.financial.financingLikelihood ?? null,
      leadershipReadiness: intelligence?.competencies.leadership ?? null,
      lifestyleAlignment: intelligence?.behavioral.adaptability ?? null,
      coachability: intelligence?.behavioral.coachability ?? null,
      nextBestAction: candidate.pipelineStage === "awarded" ? "Prepare Onboarding" : lifecycleAction?.label ?? scenarioCandidate?.nextBestAction ?? (assessmentStatus === "pending" && invitation ? "Complete the assessment" : "Send the assessment invitation"),
      knownInformation: [
        { label: "Email", value: candidate.email, icon: "email" },
        { label: "Phone", value: candidate.phone || "Not provided", icon: "phone" },
        { label: "Location", value: [candidate.city, candidate.state].filter(Boolean).join(", ") || "Not provided", icon: "location" },
        { label: "Preferred Territory", value: candidate.preferredTerritory || "Not provided", icon: "territory" },
        { label: "Lead Source", value: candidate.leadSource || "Not provided", icon: "source" },
      ],
      assessment,
      activities,
      lifecycleAction: lifecycleAction ? { label: lifecycleAction.label } : null,
      brandStrategyHref: ["brand-matching", "referral", "awarded"].includes(candidate.pipelineStage)
        ? `/crm/candidates/${candidate.id}/strategy`
        : undefined,
      brandStrategy: brandStrategy?.available ? { recommendations: brandStrategy.recommendations.length, presented: brandStrategy.workflow.presented,
        strongInterest: brandStrategy.workflow.strongInterest, referralSelections: brandStrategy.workflow.referralSelections, statusLabel: brandStrategy.workflow.label } : undefined,
      referralAction: referrals.length
        ? { label: candidate.pipelineStage === "awarded" ? "View Referral History" : approvedReferrals ? "Record Introduction" : awaitingApproval ? `Review ${awaitingApproval} Referral Package${awaitingApproval === 1 ? "" : "s"}` : "View Referrals", href: `/crm/candidates/${candidate.id}/referral` }
        : candidate.pipelineStage === "referral"
          ? { label: "Prepare Referral", href: `/crm/candidates/${candidate.id}/referral` }
          : undefined,
      referrals: referrals.length ? { total: referrals.length, introduced: referrals.filter((item) => item.status === "introduced").length,
        items: referrals.map((item) => ({ brandName: item.brandName, statusLabel: item.status.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ") })) } : undefined,
    };
  }

  private lifecycleDetail(stage: CandidateRecord["pipelineStage"]): string {
    const details: Partial<Record<CandidateRecord["pipelineStage"], string>> = {
      lead: "Assessment not completed.", "assessment-started": "Assessment is in progress.", "assessment-completed": "Candidate Intelligence is available and ready to guide Discovery.",
      discovery: "Discovery is in progress.", validation: "Discovery is complete. Validation remains before Brand Strategy.", "brand-matching": "Discovery intelligence is validated and ready to support Brand Strategy.",
      referral: "Candidate is progressing through franchisor introductions.", awarded: "Placement awarded. Referral history is complete.",
    };
    return details[stage] ?? "Candidate relationship history is available.";
  }

  private toActivity(activity: Activity): CandidateActivityState {
    return { id: activity.id, title: activity.title, description: activity.description, timestamp: activity.createdAt,
      dateLabel: formatActivityDate(activity.createdAt), ...activityPresentation[activity.type] };
  }
}
