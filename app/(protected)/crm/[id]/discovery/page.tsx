import { notFound } from "next/navigation";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { SeedDemoScenarioRepository } from "@/feature/demo/repositories/SeedDemoScenarioRepository";
import { DiscoveryExperienceRuntime } from "@/feature/discovery/runtime/DiscoveryExperienceRuntime";
import { DiscoveryExperiencePage } from "@/feature/discovery/components/DiscoveryExperiencePage";

export default async function DiscoveryWorkspacePage({ params, searchParams }: PageProps<"/crm/[id]/discovery">) {
  const { id } = await params;
  const query = await searchParams;
  const [candidate, scenario] = await Promise.all([
    new SeedCandidateRepository().getById(id),
    new SeedDemoScenarioRepository().getCandidateById(id),
  ]);
  if (!candidate?.intelligence) notFound();
  const state = new DiscoveryExperienceRuntime().build(
    { ...candidate, intelligence: candidate.intelligence },
    scenario,
    query.phase === "live" ? "live" : undefined,
  );
  return <DiscoveryExperiencePage key={`${candidate.id}-${state.candidate.stage}-${state.phase}`} state={state} />;
}
