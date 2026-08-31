import { CandidateWorkspaceQueuePage } from "@/feature/crm/components/CandidateWorkspaceQueuePage";
import { CandidateWorkspaceQueueRuntime } from "@/feature/crm/runtime/CandidateWorkspaceQueueRuntime";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";

export default async function ReferralQueuePage({ searchParams }: PageProps<"/crm/referrals">) {
  const view = (await searchParams).view;
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return <WorkspaceFeatureUnavailable title="Referral queue"/>;const composition=resolution.composition;
  return <CandidateWorkspaceQueuePage state={await new CandidateWorkspaceQueueRuntime(composition.runtimes.createCandidateCRM()).load("referral", view === "completed" || view === "all" ? view : "active")} />;
}
