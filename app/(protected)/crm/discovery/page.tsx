import { CandidateWorkspaceQueuePage } from "@/feature/crm/components/CandidateWorkspaceQueuePage";
import { CandidateWorkspaceQueueRuntime } from "@/feature/crm/runtime/CandidateWorkspaceQueueRuntime";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";

export default async function DiscoveryQueuePage({ searchParams }: PageProps<"/crm/discovery">) {
  const view = (await searchParams).view;
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return <WorkspaceFeatureUnavailable title="Discovery queue" detail="Production Discovery remains available from each candidate workspace; the demo work queue is not production-backed."/>;const composition=resolution.composition;
  return <CandidateWorkspaceQueuePage state={await new CandidateWorkspaceQueueRuntime(composition.runtimes.createCandidateCRM()).load("discovery", view === "completed" || view === "all" ? view : "active")} />;
}
