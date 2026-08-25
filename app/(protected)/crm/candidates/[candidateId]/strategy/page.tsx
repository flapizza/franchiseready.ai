import { notFound } from "next/navigation";
import { CandidateBrandStrategyPage } from "@/feature/brand-strategy/components/CandidateBrandStrategyPage";
import { CandidateBrandStrategyRuntime } from "@/feature/brand-strategy/runtime/CandidateBrandStrategyRuntime";
import { getPersistenceMode } from "@/lib/env";
import { createCandidateRepository } from "@/feature/crm/repositories/candidate-repository-factory";
import { createDiscoveryRepository } from "@/feature/discovery/production/repository-factory";
import Link from "next/link";

export default async function BrandStrategyRoute({ params }: { params: Promise<{ candidateId: string }> }) {
  const { candidateId } = await params;
  if(getPersistenceMode()==="supabase"){
    const[candidates,discovery]=await Promise.all([createCandidateRepository(),createDiscoveryRepository()]);if(!candidates||!discovery)notFound();const candidate=await candidates.repository.getById(candidateId);if(!candidate)notFound();const record=await discovery.repository.getOrCreate(candidateId).catch(()=>null);if(!record)notFound();const current=record.session.currentIntelligence;if(current?.readiness!=="ready-for-brand-strategy")return <main className="mx-auto max-w-4xl p-8"><Link href={`/crm/${candidateId}/discovery`} className="text-sm font-bold text-slate-500">← Discovery Workspace</Link><section className="mt-8 rounded-2xl border border-amber-200 bg-white p-8"><h1 className="text-2xl font-black">Brand Strategy is not ready</h1><p className="mt-3 text-slate-600">{current?.consultantBrief.nextAction??"Complete consultant-led Discovery before beginning Brand Strategy."}</p></section></main>;
    return <main className="mx-auto max-w-5xl p-8"><Link href={`/crm/${candidateId}/discovery`} className="text-sm font-bold text-slate-500">← Discovery Workspace</Link><p className="mt-8 text-xs font-black uppercase tracking-[.2em] text-blue-600">Brand Strategy handoff</p><h1 className="mt-2 text-3xl font-black">Refined evidence for {candidate.firstName} {candidate.lastName}</h1><p className="mt-3 text-slate-600">Discovery is ready. These current Opportunity Characteristics preserve their assessment values and provenance. Production brand matching remains consultant-controlled and is not generated solely from assessment completion.</p><div className="mt-6 grid gap-4 md:grid-cols-2">{current.opportunityCharacteristics.map(item=><article key={item.characteristic} className="rounded-xl border bg-white p-5"><p className="text-xs font-black uppercase text-blue-600">{item.source}{item.previousDisposition?` · previously ${item.previousDisposition}`:""}</p><h2 className="mt-1 font-black">{item.characteristic}</h2><p className="mt-2 text-sm font-bold">{item.disposition}</p><p className="mt-2 text-sm text-slate-600">{item.reason}</p></article>)}</div></main>;
  }
  const state = await new CandidateBrandStrategyRuntime().load(candidateId);
  if (!state) notFound();
  return <CandidateBrandStrategyPage state={state} />;
}
