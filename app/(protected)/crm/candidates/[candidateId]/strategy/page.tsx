import {referralContext} from "@/feature/referral-package/services/PersistedReferral";
import { notFound } from "next/navigation";
import { CandidateBrandStrategyPage } from "@/feature/brand-strategy/components/CandidateBrandStrategyPage";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { BrandReferralWorkspace } from "@/feature/brand-strategy/components/BrandReferralWorkspace";
import { rankBrands } from "@/feature/brand-strategy/production/BrandReferralEngine";

export default async function BrandStrategyRoute({ params }: { params: Promise<{ candidateId: string }> }) {
  const { candidateId } = await params;
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved") notFound();
  if (!("runtimes" in resolution.composition)) {
    const row = await resolution.composition.dependencies.candidateWorkspace.get(candidateId);
    if (!row) notFound();
    const brands = row.assessment?.analysis ? await resolution.composition.dependencies.brandIntelligence.getAll() : [];
    return <BrandReferralWorkspace considerations={(await referralContext(candidateId))?.considerations} row={row} results={row.assessment?.analysis ? rankBrands(row, brands) : []} />;
  }
  const state = await resolution.composition.runtimes.createBrandStrategy().load(candidateId);
  if (!state) notFound();
  return <CandidateBrandStrategyPage state={state} />;
}
