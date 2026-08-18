import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import type { CandidateWorkspaceQueueState } from "../models/CandidateWorkspaceQueueState";

export function CandidateWorkspaceQueuePage({ state }: { state: CandidateWorkspaceQueueState }) {
  return <main className="mx-auto max-w-6xl space-y-7 p-6 lg:p-10">
    <header>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-600">{state.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{state.title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{state.description}</p>
    </header>
    <nav aria-label="Queue view" className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">{(["active", "completed", "all"] as const).map((view) => <Link key={view} href={`?view=${view}`} className={`rounded-lg px-4 py-2 text-sm font-bold capitalize ${state.activeView === view ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>{view}</Link>)}</nav>
    {state.candidates.length ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {state.candidates.map((candidate) => <article key={candidate.id} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg">
        <Link href={candidate.candidateHref} aria-label={`Open ${candidate.name} Candidate 360`} className="absolute inset-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white">{candidate.initials}</span><div className="min-w-0"><h2 className="truncate font-black text-slate-950">{candidate.name}</h2><p className="truncate text-xs text-slate-500">{candidate.location}</p></div></div>
        <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{candidate.stageLabel}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{candidate.readinessLabel}</span></div>
        <p className="mt-4 min-h-10 text-sm font-semibold leading-5 text-slate-700">{candidate.summary}</p>
        <div className="relative mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-xs font-bold text-slate-500">{candidate.attentionLabel}</span><Link href={candidate.href} className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-800">{candidate.actionLabel}<ArrowRight size={15} /></Link></div>
      </article>)}
    </section> : <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Users className="mx-auto text-slate-300" size={32} /><h2 className="mt-4 font-black text-slate-800">Queue clear</h2><p className="mt-2 text-sm text-slate-500">{state.emptyMessage}</p><Link href="/crm/candidates" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600">View all candidates<ArrowRight size={15} /></Link></section>}
  </main>;
}
