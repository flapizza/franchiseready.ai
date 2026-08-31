import { notFound } from "next/navigation";
import { DiscoveryExperienceRuntime } from "@/feature/discovery/runtime/DiscoveryExperienceRuntime";
import { DiscoveryExperiencePage } from "@/feature/discovery/components/DiscoveryExperiencePage";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { ProductionDiscoveryWorkspace } from "@/feature/discovery/production/components/ProductionDiscoveryWorkspace";

export default async function DiscoveryWorkspacePage({ params, searchParams }: PageProps<"/crm/[id]/discovery">) {
  const { id } = await params;
  const query = await searchParams;
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved")notFound();
  if(!("runtimes" in resolution.composition)){
    const candidate=await resolution.composition.dependencies.candidates.getById(id);if(!candidate)notFound();
    const record=await resolution.composition.dependencies.discovery.getOrCreate(id).catch(()=>null);if(!record)notFound();
    return <ProductionDiscoveryWorkspace workspace={{candidate:{id,name:`${candidate.firstName} ${candidate.lastName}`},assessment:record.assessment,session:record.session}}/>
  }
  const [candidate, scenario] = await Promise.all([
    resolution.composition.dependencies.candidates.getById(id),
    resolution.composition.dependencies.scenarios.getCandidateById(id),
  ]);
  if (!candidate?.intelligence) notFound();
  const state = new DiscoveryExperienceRuntime().build(
    { ...candidate, intelligence: candidate.intelligence },
    scenario,
    query.phase === "live" ? "live" : undefined,
  );
  return <DiscoveryExperiencePage key={`${candidate.id}-${state.candidate.stage}-${state.phase}`} state={state} />;
}
