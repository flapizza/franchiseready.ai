import type { BrandRepository } from "@/feature/brand-library/repositories/BrandRepository";
import type { CandidateRecord } from "@/feature/crm/models/CandidateRecord";
import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import type { DemoCandidate } from "@/feature/demo/models/DemoScenario";
import type { DemoScenarioRepository } from "@/feature/demo/repositories/DemoScenarioRepository";
import type { AssessmentInvitationService } from "../services/AssessmentInvitationService";
import type { CandidateLifecycleService } from "../services/CandidateLifecycleService";
import type { CandidateBrandReferral } from "@/feature/referral-package/models/CandidateBrandReferral";

import type { CandidateAttention, CandidateCRMItem, CandidateCRMState } from "../models/CandidateCRMState";
import type { PipelineConfigurationService } from "@/feature/pipeline/services/PipelineConfigurationService";
import type { TaskRepository } from "@/feature/tasks/repositories/TaskRepository";

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
  public constructor(private readonly dependencies: {
    candidates: CandidateRepository;
    scenarios: DemoScenarioRepository;
    brands: BrandRepository;
    invitations: Pick<AssessmentInvitationService, "getForCandidate">;
    pipelineService: PipelineConfigurationService;
    tasks: TaskRepository;
    lifecycle: Pick<CandidateLifecycleService, "getRecommendedAction">;
    consultantId: string;
    referrals: (candidateId: string) => CandidateBrandReferral[];
    referralHistory: (candidateId: string) => CandidateBrandReferral[];
  }) {}

  public async load(): Promise<CandidateCRMState> {
    const [records, scenario, brands, pipeline, tasks] = await Promise.all([
      this.dependencies.candidates.getAll(),
      this.dependencies.scenarios.getScenario(),
      this.dependencies.brands.getAll(),
      this.dependencies.pipelineService.get(this.dependencies.consultantId),
      this.dependencies.tasks.getAll(this.dependencies.consultantId),
    ]);
    const demoById = new Map(scenario.candidates.map((candidate) => [candidate.id, candidate]));
    const brandsById = new Map(brands.map((brand) => [brand.id, brand.name]));
    const openTasks = new Map<string, number>();
    tasks.filter((task) => task.status === "open" && task.candidateId).forEach((task) => openTasks.set(task.candidateId!, (openTasks.get(task.candidateId!) ?? 0) + 1));
    const candidates = records.map((record) => ({ ...this.toItem(record, demoById.get(record.id), brandsById, pipeline), openTaskCount: openTasks.get(record.id) ?? 0 }));

    return {
      candidates,
      stages: pipeline.stages.filter((stage) => stage.enabled).sort((a, b) => a.order - b.order)
        .map((stage, sequence) => ({ stageId: stage.stageId, stage: stage.stageId, label: stage.displayName, sequence, canonicalLifecycleStage: stage.canonicalLifecycleStage, classification: stage.classification, colorToken: stage.colorToken })),
    };
  }

  private toItem(record: CandidateRecord, demo: DemoCandidate | undefined, brands: Map<string, string>, pipeline: Awaited<ReturnType<PipelineConfigurationService["get"]>>): CandidateCRMItem {
    const visibleStage = this.dependencies.pipelineService.resolveStage(pipeline, record);
    const assessmentPending = !record.intelligence;
    const attention = attentionFor(demo);
    const invitation = this.dependencies.invitations.getForCandidate(record.id);
    const lifecycleAction = this.dependencies.lifecycle.getRecommendedAction(record);
    const overlayReferrals = this.dependencies.referrals(record.id);
    const referrals = overlayReferrals.length ? overlayReferrals : this.dependencies.referralHistory(record.id);
    const awaitingApproval = referrals.filter((item) => item.status === "ready-for-review").length;
    const reviewReferral = referrals.find((item) => item.status === "ready-for-review");
    const approvedReferrals = referrals.filter((item) => item.status === "approved");
    const workflowAction = record.pipelineStage === "awarded"
      ? { actionLabel: referrals.length ? "View Referral History" : "Open Candidate", actionHref: referrals.length ? `/crm/candidates/${record.id}/referral` : `/crm/candidates/${record.id}`, actionKind: "navigate" as const }
      : referrals.length
      ? { actionLabel: approvedReferrals.length ? `Review ${approvedReferrals[0].brandName} Delivery` : awaitingApproval ? `Review ${awaitingApproval} Referral Package${awaitingApproval === 1 ? "" : "s"}` : "View Referrals", actionHref: reviewReferral ? `/crm/candidates/${record.id}/referral?referralId=${encodeURIComponent(reviewReferral.referralId)}` : `/crm/candidates/${record.id}/referral`, actionKind: "navigate" as const }
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
      pipelineStageId: visibleStage.stageId,
      pipelineStage: visibleStage.stageId,
      lifecycleStage: record.pipelineStage,
      canonicalLifecycleStage: visibleStage.canonicalLifecycleStage,
      stageLabel: visibleStage.displayName,
      readiness: record.intelligence?.overallReadiness ?? null,
      readinessLabel: assessmentPending ? (record.pipelineStage === "lead" ? "Not Yet Evaluated" : "Assessment Pending") : `${record.intelligence!.overallReadiness}%`,
      bestBrand: demo ? brands.get(demo.recommendedBrands[0]?.brandId) ?? null : null,
      lastActivityLabel: formatDate(record.lastActivityAt),
      nextAction: record.pipelineStage === "awarded" ? "Prepare Onboarding" : referrals.length ? `${referrals.length} referral${referrals.length === 1 ? "" : "s"} · ${referrals.filter((item) => item.status === "sent" || item.status === "introduced").length} sent` : demo?.nextBestAction ?? (record.pipelineStage === "lead" ? "Send Assessment Invitation" : record.pipelineStage === "assessment-started" ? "Complete Assessment" : "Review Candidate Intelligence"),
      attention,
      attentionLabel: record.pipelineStage === "awarded" ? "Placement Complete" : attention === "needs-attention" ? "Needs Attention" : attention === "referral-ready" ? "Referral Ready" : "On Track",
      momentum: demo?.buyingMomentum ?? "steady",
      referralReady: record.pipelineStage !== "awarded" && (record.pipelineStage === "referral" || (demo?.referralReadiness ?? 0) >= 90),
      href: `/crm/candidates/${record.id}`,
      ...workflowAction,
      momentumLabel: demo?.buyingMomentum === "accelerating" ? "Accelerating" : demo?.buyingMomentum === "slowing" ? "Slowing" : "Steady",
      openTaskCount: 0,
    };
  }
}
