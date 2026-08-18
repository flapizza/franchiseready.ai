import { CandidateBrandPresentationPage } from "@/feature/brand-strategy/components/CandidateBrandPresentationPage";
import { CandidateBrandStrategyRuntime } from "@/feature/brand-strategy/runtime/CandidateBrandStrategyRuntime";

export default async function Page({ params, searchParams }: { params: Promise<{ candidateId: string }>; searchParams: Promise<{ brandId?: string; summary?: string }> }) {
  const [{ candidateId }, query] = await Promise.all([params, searchParams]);
  const state = await new CandidateBrandStrategyRuntime().loadPresentation(candidateId, query.brandId);
  return <CandidateBrandPresentationPage state={state} summary={query.summary === "1"} />;
}
