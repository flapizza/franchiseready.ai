import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import { createRecommendedPipeline } from "../data/defaultPipeline";
import type { ConsultantPipelineConfiguration } from "../models/ConsultantPipeline";
import type { ConsultantPipelineRepository } from "./ConsultantPipelineRepository";

export class DemoConsultantPipelineRepository implements ConsultantPipelineRepository {
  async getForConsultant(consultantId: string): Promise<ConsultantPipelineConfiguration> {
    return demoCandidateOverlayStore.getPipeline(consultantId) ?? createRecommendedPipeline(consultantId);
  }
  async save(configuration: ConsultantPipelineConfiguration): Promise<void> { demoCandidateOverlayStore.savePipeline(configuration); }
}
