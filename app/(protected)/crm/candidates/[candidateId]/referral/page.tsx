import { ReferralStudioPage } from "@/feature/referral-package/components/ReferralStudioPage";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";

export default async function CandidateReferralRoute({ params, searchParams }: PageProps<"/crm/candidates/[candidateId]/referral">) {
  const { candidateId } = await params;
  const referralId = (await searchParams).referralId;
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return <WorkspaceFeatureUnavailable title="Referral Studio"/>;
  return <ReferralStudioPage state={await resolution.composition.runtimes.createReferralStudio().load(candidateId, typeof referralId === "string" ? referralId : undefined)} />;
}
