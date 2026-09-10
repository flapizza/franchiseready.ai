import type { CandidateRepository } from "../repositories/CandidateRepository";
import type { CandidateCRMState } from "../models/CandidateCRMState";
import type { SupabaseCandidateWorkspaceRepository } from "../repositories/SupabaseCandidateWorkspaceRepository";
import { candidateSignals, stageOrder } from "@/feature/mission-control/runtime/PersistedMissionControl";

const label = (value: string) => value.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");

export class ProductionCandidateCRMRuntime {
  public constructor(private readonly candidates: CandidateRepository, private readonly workspace?: Pick<SupabaseCandidateWorkspaceRepository, "load">) {}

  public async load(): Promise<CandidateCRMState> {
    const rows = await this.workspace?.load();
    const records = rows ? rows.map(row => row.candidate) : await this.candidates.getAll();
    const stageIds = [...new Set(records.map((candidate) => candidate.pipelineStageId ?? candidate.pipelineStage))].sort((a, b) => (stageOrder.includes(a) ? stageOrder.indexOf(a) : 99) - (stageOrder.includes(b) ? stageOrder.indexOf(b) : 99) || a.localeCompare(b));
    return {
      readinessHeading: rows ? "Assessment status" : "Readiness",
      stages: stageIds.map((stageId, sequence) => ({ stageId, stage: stageId, label: label(stageId), sequence,
        canonicalLifecycleStage: records.find((candidate) => (candidate.pipelineStageId ?? candidate.pipelineStage) === stageId)?.pipelineStage === "lead" ? "lead" : "other",
        classification: records.some((candidate) => (candidate.pipelineStageId ?? candidate.pipelineStage) === stageId && candidate.status === "won") ? "won" : "active" })),
      candidates: records.map((candidate) => {
        const stageId = candidate.pipelineStageId ?? candidate.pipelineStage;
        const row = rows?.find(row => row.candidate.id === candidate.id);
        const signals = row ? candidateSignals(row) : null;
        const needsAttention = signals ? signals.reasons.length > 0 : candidate.status === "on-hold";
        return { id: candidate.id, fullName: `${candidate.firstName} ${candidate.lastName}`, initials: `${candidate.firstName[0] ?? ""}${candidate.lastName[0] ?? ""}`,
          email: candidate.email, location: [candidate.city, candidate.state].filter(Boolean).join(", "), status: candidate.status,
          pipelineStageId: stageId, pipelineStage: stageId, lifecycleStage: candidate.pipelineStage,
          canonicalLifecycleStage: candidate.pipelineStage === "lead" ? "lead" as const : "other" as const,
          stageLabel: label(stageId), readiness: row ? null : candidate.intelligence?.overallReadiness ?? null,
          readinessKind: row ? "assessment" as const : undefined,
          readinessLabel: signals?.assessmentLabel ?? (candidate.intelligence ? `${candidate.intelligence.overallReadiness}%` : "Not Yet Evaluated"),
          bestBrand: null, lastActivityLabel: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(candidate.lastActivityAt)),
          nextAction: signals?.nextAction ?? "Continue candidate qualification", attention: needsAttention ? "needs-attention" as const : "on-track" as const, attentionLabel: needsAttention ? "Review next step" : "On Track", momentum: "steady" as const,
          referralReady: false, href: `/crm/candidates/${candidate.id}`, actionLabel: row?.assessment?.status === "analyzed" ? "View Assessment Results" : "Share Assessment", actionHref: `/crm/candidates/${candidate.id}#${row?.assessment?.status === "analyzed" ? "assessment-intelligence" : "assessment-invitation"}`,
          momentumLabel: "Steady", actionKind: "navigate" as const, openTaskCount: 0 };
      }),
    };
  }
}
