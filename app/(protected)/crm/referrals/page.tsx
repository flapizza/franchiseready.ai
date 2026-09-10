import { CandidateWorkspaceQueuePage } from "@/feature/crm/components/CandidateWorkspaceQueuePage";
import { CandidateWorkspaceQueueRuntime } from "@/feature/crm/runtime/CandidateWorkspaceQueueRuntime";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";
import { PersistedCandidateQueue } from "@/feature/crm/components/PersistedCandidateQueue";

export default async function ReferralQueuePage({ searchParams }: PageProps<"/crm/referrals">) {
  const view = (await searchParams).view;
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved")return <WorkspaceFeatureUnavailable title="Referral queue"/>;const composition=resolution.composition;
  if (!("runtimes" in composition)) return <PersistedCandidateQueue rows={await composition.dependencies.candidateWorkspace.load()} kind="referral" />;
  return <CandidateWorkspaceQueuePage state={await new CandidateWorkspaceQueueRuntime(composition.runtimes.createCandidateCRM()).load("referral", view === "completed" || view === "all" ? view : "active")} />;
}
