import { ReferralStudioPage } from "@/feature/referral-package/components/ReferralStudioPage";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";
import { notFound } from "next/navigation";
import { PersistedReferralWorkspace } from "@/feature/referral-package/components/PersistedReferralWorkspace";
import {referralContext} from "@/feature/referral-package/services/PersistedReferral";


export default async function CandidateReferralRoute({ params, searchParams }: PageProps<"/crm/candidates/[candidateId]/referral">) {
  const { candidateId } = await params;
  const query = await searchParams;
  const referralId = query.referralId;
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved")return <WorkspaceFeatureUnavailable title="Referral Studio"/>;
  if (!("runtimes" in resolution.composition)) {
    const context=await referralContext(candidateId,typeof query.brand==="string"?query.brand:undefined);if(!context)notFound();
    return <PersistedReferralWorkspace context={context}/>;
  }
  return <ReferralStudioPage state={await resolution.composition.runtimes.createReferralStudio().load(candidateId, typeof referralId === "string" ? referralId : undefined)} />;
}
