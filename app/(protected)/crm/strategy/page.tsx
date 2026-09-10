import { CandidateWorkspaceQueuePage } from "@/feature/crm/components/CandidateWorkspaceQueuePage";
import { CandidateWorkspaceQueueRuntime } from "@/feature/crm/runtime/CandidateWorkspaceQueueRuntime";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";
import { PersistedCandidateQueue } from "@/feature/crm/components/PersistedCandidateQueue";

export default async function BrandStrategyQueuePage({ searchParams }: PageProps<"/crm/strategy">) {
  const view = (await searchParams).view;
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved")return <WorkspaceFeatureUnavailable title="Brand Strategy queue"/>;const composition=resolution.composition;
  if (!("runtimes" in composition)) return <PersistedCandidateQueue rows={await composition.dependencies.candidateWorkspace.load()} kind="strategy" />;
  return <CandidateWorkspaceQueuePage state={await new CandidateWorkspaceQueueRuntime(composition.runtimes.createCandidateCRM()).load("strategy", view === "completed" || view === "all" ? view : "active")} />;
}
