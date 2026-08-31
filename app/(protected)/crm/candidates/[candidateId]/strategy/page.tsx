import { notFound } from "next/navigation";
import { CandidateBrandStrategyPage } from "@/feature/brand-strategy/components/CandidateBrandStrategyPage";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";

export default async function BrandStrategyRoute({ params }: { params: Promise<{ candidateId: string }> }) {
  const { candidateId } = await params;
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved") notFound();
  if (!("runtimes" in resolution.composition)) {
    const candidate = await resolution.composition.dependencies.candidates.getById(candidateId);
    if (!candidate) notFound();
    return <WorkspaceFeatureUnavailable title="Brand Strategy" detail="Production Discovery remains available, but production brand matching has not been implemented. No demo recommendations have been substituted." />;
  }
  const state = await resolution.composition.runtimes.createBrandStrategy().load(candidateId);
  if (!state) notFound();
  return <CandidateBrandStrategyPage state={state} />;
}
