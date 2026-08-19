import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { PipelineConfigurationPage } from "@/feature/pipeline/components/PipelineConfigurationPage";
import { DemoConsultantPipelineRepository } from "@/feature/pipeline/repositories/DemoConsultantPipelineRepository";
import { PipelineConfigurationService } from "@/feature/pipeline/services/PipelineConfigurationService";

export default async function PipelineSettingsPage() {
  const configuration = await new PipelineConfigurationService(new DemoConsultantPipelineRepository(), new SeedCandidateRepository()).get(demoConsultant.id);
  return <PipelineConfigurationPage initialConfiguration={configuration} />;
}
