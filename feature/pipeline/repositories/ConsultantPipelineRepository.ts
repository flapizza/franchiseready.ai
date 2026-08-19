import type { ConsultantPipelineConfiguration } from "../models/ConsultantPipeline";

export interface ConsultantPipelineRepository {
  getForConsultant(consultantId: string): Promise<ConsultantPipelineConfiguration>;
  save(configuration: ConsultantPipelineConfiguration): Promise<void>;
}
