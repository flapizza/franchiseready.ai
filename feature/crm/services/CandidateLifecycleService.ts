import type { Activity, ActivityType } from "../models/Activity";
import type { CandidateRecord, PipelineStage } from "../models/CandidateRecord";
import type { CandidateRepository } from "../repositories/CandidateRepository";
import type { CandidateActivityRepository } from "../repositories/CandidateActivityRepository";
import { ReferralReadinessEvaluator } from "@/feature/decision-engine/evaluators/ReferralReadinessEvaluator";
import { defaultStageIdForLegacy } from "@/feature/pipeline/data/defaultPipeline";

export type CandidateTransitionKind =
  | "assessment-invited" | "assessment-completed" | "assessment-first-completed"
  | "discovery-started" | "discovery-completed" | "validation-completed"
  | "referral-approved" | "candidate-awarded";

export interface CandidateTransitionRequest {
  candidateId: string;
  targetStage: PipelineStage;
  context: { kind: CandidateTransitionKind; reason: string; metadata?: Record<string, string | number | boolean> };
}

export type CandidateTransitionResult =
  | { status: "success"; candidateId: string; previousStage: PipelineStage; newStage: PipelineStage; activity: Activity }
  | { status: "invalid-transition"; candidateId: string; previousStage: PipelineStage; requestedStage: PipelineStage; reason: string }
  | { status: "candidate-not-found"; candidateId: string };

export interface CandidateLifecycleAction {
  label: string;
  targetStage: PipelineStage;
  kind: CandidateTransitionKind;
  reason: string;
  returnPath?: string;
}

type TransitionRule = { from: PipelineStage; to: PipelineStage; kinds: readonly CandidateTransitionKind[] };

export const CANDIDATE_TRANSITION_GRAPH: readonly TransitionRule[] = [
  { from: "lead", to: "assessment-started", kinds: ["assessment-invited"] },
  { from: "lead", to: "assessment-completed", kinds: ["assessment-first-completed"] },
  { from: "assessment-started", to: "assessment-completed", kinds: ["assessment-completed"] },
  { from: "assessment-completed", to: "discovery", kinds: ["discovery-started"] },
  { from: "discovery", to: "validation", kinds: ["discovery-completed"] },
  { from: "discovery", to: "brand-matching", kinds: ["discovery-completed"] },
  { from: "validation", to: "brand-matching", kinds: ["validation-completed"] },
  { from: "brand-matching", to: "referral", kinds: ["referral-approved"] },
  { from: "referral", to: "awarded", kinds: ["candidate-awarded"] },
] as const;

const transitionActivities: Record<CandidateTransitionKind, { type: ActivityType; title: string }> = {
  "assessment-invited": { type: "assessment-started", title: "Assessment Invitation Sent" },
  "assessment-completed": { type: "assessment-completed", title: "Assessment Completed" },
  "assessment-first-completed": { type: "assessment-completed", title: "Assessment Completed" },
  "discovery-started": { type: "discovery-started", title: "Discovery Started" },
  "discovery-completed": { type: "discovery-completed", title: "Discovery Completed" },
  "validation-completed": { type: "brand-strategy-ready", title: "Brand Strategy Ready" },
  "referral-approved": { type: "referral-ready", title: "Referral Ready" },
  "candidate-awarded": { type: "award", title: "Candidate Awarded" },
};

export class CandidateLifecycleService {
  private readonly referralReadiness = new ReferralReadinessEvaluator();

  public constructor(
    private readonly candidates: CandidateRepository,
    private readonly activities: CandidateActivityRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async transition(request: CandidateTransitionRequest): Promise<CandidateTransitionResult> {
    const candidate = await this.candidates.getById(request.candidateId);
    if (!candidate) return { status: "candidate-not-found", candidateId: request.candidateId };

    const rule = CANDIDATE_TRANSITION_GRAPH.find((item) => item.from === candidate.pipelineStage && item.to === request.targetStage && item.kinds.includes(request.context.kind));
    if (!rule) return this.invalid(candidate, request.targetStage, "The requested lifecycle movement is not allowed from the candidate's current stage.");
    if (request.targetStage === "referral" && !this.isReferralReady(candidate)) {
      return this.invalid(candidate, request.targetStage, "Referral readiness requirements have not been satisfied.");
    }

    const occurredAt = this.now().toISOString();
    const presentation = transitionActivities[request.context.kind];
    const activity: Activity = {
      id: crypto.randomUUID(), candidateId: candidate.id, consultantId: candidate.consultantId,
      type: presentation.type, title: presentation.title,
      description: `${request.context.reason} Stage changed from ${this.stageLabel(candidate.pipelineStage)} to ${this.stageLabel(request.targetStage)}.`,
      createdAt: occurredAt, previousStage: candidate.pipelineStage, newStage: request.targetStage,
      metadata: request.context.metadata,
    };
    await this.candidates.save({
      ...candidate, pipelineStage: request.targetStage, pipelineStageId: defaultStageIdForLegacy(request.targetStage),
      status: request.targetStage === "awarded" ? "won" : candidate.status,
      updatedAt: occurredAt, lastActivityAt: occurredAt,
    });
    await this.activities.add(activity);
    if (request.context.kind === "discovery-completed") {
      await this.activities.add({
        ...activity,
        id: crypto.randomUUID(),
        type: request.targetStage === "validation" ? "validation-started" : "brand-strategy-ready",
        title: request.targetStage === "validation" ? "Validation Started" : "Brand Strategy Ready",
        description: request.targetStage === "validation"
          ? "Discovery identified unresolved items that require validation before Brand Strategy."
          : "Discovery evidence is sufficient to begin Brand Strategy.",
      });
    }
    return { status: "success", candidateId: candidate.id, previousStage: candidate.pipelineStage, newStage: request.targetStage, activity };
  }

  getRecommendedAction(candidate: CandidateRecord): CandidateLifecycleAction | null {
    switch (candidate.pipelineStage) {
      case "assessment-completed":
        return { label: "Start Discovery", targetStage: "discovery", kind: "discovery-started", reason: "The completed assessment is ready for consultant-led Discovery.", returnPath: `/crm/${candidate.id}/discovery?phase=live` };
      case "discovery": {
        const targetStage = this.discoveryTarget(candidate);
        return { label: targetStage === "validation" ? "Complete Discovery · Begin Validation" : "Complete Discovery · Brand Strategy", targetStage, kind: "discovery-completed", reason: targetStage === "validation" ? "Discovery completed with validation items still unresolved." : "Discovery completed with sufficient evidence for Brand Strategy." };
      }
      case "validation":
        return { label: "Complete Validation", targetStage: "brand-matching", kind: "validation-completed", reason: "Validation requirements are resolved and the candidate is ready for Brand Strategy." };
      case "brand-matching":
        return null;
      case "referral":
        return { label: "Mark Awarded", targetStage: "awarded", kind: "candidate-awarded", reason: "The candidate accepted the franchise award." };
      default:
        return null;
    }
  }

  private discoveryTarget(candidate: CandidateRecord): PipelineStage {
    const unresolved = candidate.intelligence?.discoveryPriorities.some((item) => /confirm|validate|risk|unresolved/i.test(item)) ?? true;
    return unresolved ? "validation" : "brand-matching";
  }

  private isReferralReady(candidate: CandidateRecord): boolean {
    if (!candidate.intelligence) return false;
    return this.referralReadiness.evaluate({
      readiness: candidate.intelligence.overallReadiness,
      confidence: candidate.intelligence.timing.confidence,
      executiveSummary: candidate.intelligence.executiveSummary,
      buyingSignals: [], risks: candidate.intelligence.discoveryPriorities,
    }).status === "ready";
  }

  private invalid(candidate: CandidateRecord, requestedStage: PipelineStage, reason: string): CandidateTransitionResult {
    return { status: "invalid-transition", candidateId: candidate.id, previousStage: candidate.pipelineStage, requestedStage, reason };
  }

  private stageLabel(stage: PipelineStage): string {
    return stage.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
  }
}
