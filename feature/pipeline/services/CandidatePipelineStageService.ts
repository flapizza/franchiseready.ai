import type { Activity } from "@/feature/crm/models/Activity";
import type { CandidateActivityRepository } from "@/feature/crm/repositories/CandidateActivityRepository";
import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import type { ConsultantPipelineRepository } from "../repositories/ConsultantPipelineRepository";
import { defaultStageIdForLegacy } from "../data/defaultPipeline";

export class CandidatePipelineStageService {
  constructor(private readonly pipelines: ConsultantPipelineRepository, private readonly candidates: CandidateRepository, private readonly activities: CandidateActivityRepository, private readonly now = () => new Date()) {}
  async move(candidateId: string, stageId: string): Promise<{ status: "success" | "not-found" | "invalid-stage"; activity?: Activity }> {
    const candidate = await this.candidates.getById(candidateId);
    if (!candidate) return { status: "not-found" };
    const configuration = await this.pipelines.getForConsultant(candidate.consultantId);
    const target = configuration.stages.find((stage) => stage.stageId === stageId && stage.enabled);
    if (!target) return { status: "invalid-stage" };
    const previousId = candidate.pipelineStageId ?? defaultStageIdForLegacy(candidate.pipelineStage);
    if (previousId === target.stageId) return { status: "success" };
    const previous = configuration.stages.find((stage) => stage.stageId === previousId);
    const occurredAt = this.now().toISOString();
    const activity: Activity = { id: crypto.randomUUID(), candidateId, consultantId: candidate.consultantId, type: "status-changed", title: "Pipeline Stage Changed",
      description: `Candidate moved from ${previous?.displayName ?? "Previous Stage"} to ${target.displayName}.`, createdAt: occurredAt,
      previousStage: candidate.pipelineStage, newStage: target.legacyLifecycleStage ?? candidate.pipelineStage,
      previousPipelineStageId: previousId, newPipelineStageId: target.stageId,
      previousPipelineStageName: previous?.displayName, newPipelineStageName: target.displayName,
      previousCanonicalLifecycleStage: previous?.canonicalLifecycleStage, newCanonicalLifecycleStage: target.canonicalLifecycleStage };
    await this.candidates.save({ ...candidate, pipelineStageId: target.stageId, pipelineStage: target.legacyLifecycleStage ?? candidate.pipelineStage,
      status: target.classification === "won" ? "won" : target.classification === "lost" ? "lost" : candidate.status, updatedAt: occurredAt, lastActivityAt: occurredAt });
    await this.activities.add(activity);
    return { status: "success", activity };
  }
}
