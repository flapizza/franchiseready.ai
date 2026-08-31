import { PipelineConfigurationPage } from "@/feature/pipeline/components/PipelineConfigurationPage";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";

export default async function PipelineSettingsPage() {
  const resolution=await resolveWorkspaceComposition();
  if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return <WorkspaceFeatureUnavailable title="Pipeline settings"/>;
  const configuration = await resolution.composition.runtimes.createPipeline().get(resolution.composition.runtimes.consultant.id);
  return <PipelineConfigurationPage initialConfiguration={configuration} />;
}
