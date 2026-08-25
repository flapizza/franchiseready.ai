import { notFound } from "next/navigation";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { SeedDemoScenarioRepository } from "@/feature/demo/repositories/SeedDemoScenarioRepository";
import { DiscoveryExperienceRuntime } from "@/feature/discovery/runtime/DiscoveryExperienceRuntime";
import { DiscoveryExperiencePage } from "@/feature/discovery/components/DiscoveryExperiencePage";
import { getPersistenceMode } from "@/lib/env";
import { createCandidateRepository } from "@/feature/crm/repositories/candidate-repository-factory";
import { createDiscoveryRepository } from "@/feature/discovery/production/repository-factory";
import { ProductionDiscoveryWorkspace } from "@/feature/discovery/production/components/ProductionDiscoveryWorkspace";

export default async function DiscoveryWorkspacePage({ params, searchParams }: PageProps<"/crm/[id]/discovery">) {
  const { id } = await params;
  const query = await searchParams;
  if(getPersistenceMode()==="supabase"){
    const[candidates,discovery]=await Promise.all([createCandidateRepository(),createDiscoveryRepository()]);
    if(!candidates||!discovery)notFound();const candidate=await candidates.repository.getById(id);if(!candidate)notFound();
    const record=await discovery.repository.getOrCreate(id).catch(()=>null);if(!record)notFound();
    return <ProductionDiscoveryWorkspace workspace={{candidate:{id,name:`${candidate.firstName} ${candidate.lastName}`},assessment:record.assessment,session:record.session}}/>
  }
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
