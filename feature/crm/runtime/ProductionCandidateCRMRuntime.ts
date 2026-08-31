import type { CandidateRepository } from "../repositories/CandidateRepository";
import type { CandidateCRMState } from "../models/CandidateCRMState";

const label = (value: string) => value.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");

export class ProductionCandidateCRMRuntime {
  public constructor(private readonly candidates: CandidateRepository) {}

  public async load(): Promise<CandidateCRMState> {
    const records = await this.candidates.getAll();
    const stageIds = [...new Set(records.map((candidate) => candidate.pipelineStageId ?? candidate.pipelineStage))];
    return {
      stages: stageIds.map((stageId, sequence) => ({ stageId, stage: stageId, label: label(stageId), sequence,
        canonicalLifecycleStage: records.find((candidate) => (candidate.pipelineStageId ?? candidate.pipelineStage) === stageId)?.pipelineStage === "lead" ? "lead" : "other",
        classification: records.some((candidate) => (candidate.pipelineStageId ?? candidate.pipelineStage) === stageId && candidate.status === "won") ? "won" : "active" })),
      candidates: records.map((candidate) => {
        const stageId = candidate.pipelineStageId ?? candidate.pipelineStage;
        return { id: candidate.id, fullName: `${candidate.firstName} ${candidate.lastName}`, initials: `${candidate.firstName[0] ?? ""}${candidate.lastName[0] ?? ""}`,
          email: candidate.email, location: [candidate.city, candidate.state].filter(Boolean).join(", "), status: candidate.status,
          pipelineStageId: stageId, pipelineStage: stageId, lifecycleStage: candidate.pipelineStage,
          canonicalLifecycleStage: candidate.pipelineStage === "lead" ? "lead" as const : "other" as const,
          stageLabel: label(stageId), readiness: candidate.intelligence?.overallReadiness ?? null,
          readinessLabel: candidate.intelligence ? `${candidate.intelligence.overallReadiness}%` : "Not Yet Evaluated",
          bestBrand: null, lastActivityLabel: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(candidate.lastActivityAt)),
          nextAction: "Continue candidate qualification", attention: "on-track" as const, attentionLabel: "On Track", momentum: "steady" as const,
          referralReady: false, href: `/crm/candidates/${candidate.id}`, actionLabel: "Open Candidate", actionHref: `/crm/candidates/${candidate.id}`,
          momentumLabel: "Steady", actionKind: "navigate" as const, openTaskCount: 0 };
      }),
    };
  }
}
