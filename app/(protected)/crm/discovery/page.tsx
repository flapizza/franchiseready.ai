import Link from "next/link";
import { CandidateWorkspaceQueuePage } from "@/feature/crm/components/CandidateWorkspaceQueuePage";
import { CandidateWorkspaceQueueRuntime } from "@/feature/crm/runtime/CandidateWorkspaceQueueRuntime";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";

export default async function DiscoveryQueuePage({ searchParams }: PageProps<"/crm/discovery">) {
  const view = (await searchParams).view;
  const resolution=await resolveWorkspaceComposition();if(resolution.status==="resolved" && !("runtimes" in resolution.composition)){const rows=await resolution.composition.dependencies.candidateWorkspace.load();return <main className="space-y-5 p-5"><h1 className="text-3xl font-black">Discovery Copilot</h1><p className="text-slate-600">Explore the questions that matter, record what you learn, and prepare the next conversation.</p>{rows.filter(r=>r.assessment?.analysis).map(r=><Link key={r.candidate.id} href={`/crm/${r.candidate.id}/discovery`} className="block rounded-2xl border bg-white p-5"><h2 className="text-xl font-bold">{r.candidate.firstName} {r.candidate.lastName}</h2><p className="mt-2 text-sm">{r.discovery?.nextSteps || r.assessment?.analysis?.consultantBrief.startDiscoveryHere.text}</p><p className="mt-2 text-xs text-teal-700">{r.discovery?.status??"Ready to explore"}</p></Link>)}</main>;}if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return <WorkspaceFeatureUnavailable title="Discovery queue" detail="Production Discovery remains available from each candidate workspace; the demo work queue is not production-backed."/>;const composition=resolution.composition;
  return <CandidateWorkspaceQueuePage state={await new CandidateWorkspaceQueueRuntime(composition.runtimes.createCandidateCRM()).load("discovery", view === "completed" || view === "all" ? view : "active")} />;
}
