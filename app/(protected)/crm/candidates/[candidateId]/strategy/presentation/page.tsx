import { CandidateBrandPresentationPage } from "@/feature/brand-strategy/components/CandidateBrandPresentationPage";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";

export default async function Page({ params, searchParams }: { params: Promise<{ candidateId: string }>; searchParams: Promise<{ brandId?: string; summary?: string }> }) {
  const [{ candidateId }, query] = await Promise.all([params, searchParams]);
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return <WorkspaceFeatureUnavailable title="Brand Presentation"/>;
  const state = await resolution.composition.runtimes.createBrandStrategy().loadPresentation(candidateId, query.brandId);
  return <CandidateBrandPresentationPage state={state} summary={query.summary === "1"} />;
}
