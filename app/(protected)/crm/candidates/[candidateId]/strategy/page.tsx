import { notFound } from "next/navigation";
import { CandidateBrandStrategyPage } from "@/feature/brand-strategy/components/CandidateBrandStrategyPage";
import { CandidateBrandStrategyRuntime } from "@/feature/brand-strategy/runtime/CandidateBrandStrategyRuntime";

export default async function BrandStrategyRoute({ params }: { params: Promise<{ candidateId: string }> }) {
  const { candidateId } = await params;
  const state = await new CandidateBrandStrategyRuntime().load(candidateId);
  if (!state) notFound();
  return <CandidateBrandStrategyPage state={state} />;
}
