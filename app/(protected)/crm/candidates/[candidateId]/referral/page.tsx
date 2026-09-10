import { ReferralStudioPage } from "@/feature/referral-package/components/ReferralStudioPage";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";
import { notFound } from "next/navigation";
import { PersistedHandoffPreview } from "@/feature/referral-package/components/PersistedHandoffPreview";
import { evaluateBrand } from "@/feature/brand-strategy/production/BrandReferralEngine";

export default async function CandidateReferralRoute({ params, searchParams }: PageProps<"/crm/candidates/[candidateId]/referral">) {
  const { candidateId } = await params;
  const query = await searchParams;
  const referralId = query.referralId;
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved")return <WorkspaceFeatureUnavailable title="Referral Studio"/>;
  if (!("runtimes" in resolution.composition)) {
    const row = await resolution.composition.dependencies.candidateWorkspace.get(candidateId);
    if (!row) notFound();
    const brand = typeof query.brand === "string" ? await resolution.composition.dependencies.brandIntelligence.getById(query.brand) : null;
    if (query.brand && !brand) notFound();
    return <PersistedHandoffPreview row={row} brand={brand && row.assessment?.analysis ? evaluateBrand(row, brand) : null} />;
  }
  return <ReferralStudioPage state={await resolution.composition.runtimes.createReferralStudio().load(candidateId, typeof referralId === "string" ? referralId : undefined)} />;
}
