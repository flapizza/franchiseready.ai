import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import { defaultStageIdForLegacy, createRecommendedPipeline } from "../data/defaultPipeline";
import type { ConsultantPipelineConfiguration, ConsultantPipelineStage } from "../models/ConsultantPipeline";
import type { ConsultantPipelineRepository } from "../repositories/ConsultantPipelineRepository";

export class PipelineConfigurationError extends Error {}

export class PipelineConfigurationService {
  constructor(private readonly pipelines: ConsultantPipelineRepository, private readonly candidates: CandidateRepository, private readonly now = () => new Date()) {}

  async get(consultantId: string): Promise<ConsultantPipelineConfiguration> {
    return this.normalize(await this.pipelines.getForConsultant(consultantId));
  }

  async save(configuration: ConsultantPipelineConfiguration): Promise<void> {
    this.validate(configuration);
    const current = await this.pipelines.getForConsultant(configuration.consultantId);
    const candidates = (await this.candidates.getAll()).filter((candidate) => candidate.consultantId === configuration.consultantId);
    const disabledIds = new Set(configuration.stages.filter((stage) => !stage.enabled).map((stage) => stage.stageId));
    const inUse = candidates.filter((candidate) => disabledIds.has(candidate.pipelineStageId ?? defaultStageIdForLegacy(candidate.pipelineStage)));
    if (inUse.length) throw new PipelineConfigurationError(`Move ${inUse.length} candidate${inUse.length === 1 ? "" : "s"} out of disabled stages before saving.`);
    const nextIds = new Set(configuration.stages.map((stage) => stage.stageId));
    if (current.stages.some((stage) => stage.source === "system-suggested" && !nextIds.has(stage.stageId))) throw new PipelineConfigurationError("Recommended stages can be disabled but not deleted.");
    const removedCustomIds = new Set(current.stages.filter((stage) => stage.source === "custom" && !nextIds.has(stage.stageId)).map((stage) => stage.stageId));
    const assignedToRemoved = candidates.filter((candidate) => removedCustomIds.has(candidate.pipelineStageId ?? defaultStageIdForLegacy(candidate.pipelineStage)));
    if (assignedToRemoved.length) throw new PipelineConfigurationError(`This stage currently contains ${assignedToRemoved.length} candidate${assignedToRemoved.length === 1 ? "" : "s"}. Move them to another stage before deleting it.`);
    await this.pipelines.save({ ...this.normalize(configuration), updatedAt: this.now().toISOString() });
  }

  async reset(consultantId: string): Promise<void> {
    const recommended = createRecommendedPipeline(consultantId);
    await this.pipelines.save(recommended);
    for (const candidate of (await this.candidates.getAll()).filter((item) => item.consultantId === consultantId)) {
      await this.candidates.save({ ...candidate, pipelineStageId: defaultStageIdForLegacy(candidate.pipelineStage) });
    }
  }

  resolveStage(configuration: ConsultantPipelineConfiguration, candidate: { pipelineStageId?: string; pipelineStage: ConsultantPipelineStage["legacyLifecycleStage"] }): ConsultantPipelineStage {
    const stageId = candidate.pipelineStageId ?? defaultStageIdForLegacy(candidate.pipelineStage);
    return configuration.stages.find((stage) => stage.stageId === stageId) ?? configuration.stages.find((stage) => stage.enabled)!;
  }

  private validate(configuration: ConsultantPipelineConfiguration) {
    const ids = configuration.stages.map((stage) => stage.stageId);
    if (new Set(ids).size !== ids.length) throw new PipelineConfigurationError("Every pipeline stage must have a unique identity.");
    if (!configuration.stages.some((stage) => stage.enabled && stage.classification === "active")) throw new PipelineConfigurationError("Keep at least one active stage enabled.");
    if (configuration.stages.some((stage) => !stage.displayName.trim())) throw new PipelineConfigurationError("Every stage needs a name.");
  }

  /** Produces the authoritative serializable presentation order and repairs
   * legacy snapshots whose order values collide. */
  private normalize(configuration: ConsultantPipelineConfiguration): ConsultantPipelineConfiguration {
    const stages = configuration.stages
      .map((stage, sourceIndex) => ({ stage, sourceIndex }))
      .sort((left, right) => left.stage.order - right.stage.order || left.sourceIndex - right.sourceIndex || left.stage.stageId.localeCompare(right.stage.stageId))
      .map(({ stage }, order) => ({ ...stage, order }));
    return { ...configuration, stages };
  }
}
