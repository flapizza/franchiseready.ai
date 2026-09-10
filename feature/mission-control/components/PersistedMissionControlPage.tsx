import Link from "next/link";
import { ArrowUpRight, CircleCheck, Compass } from "lucide-react";
import { buildPersistedMissionControl } from "../runtime/PersistedMissionControl";

export function PersistedMissionControlPage({ state, schedule }: { state: ReturnType<typeof buildPersistedMissionControl>; schedule?: React.ReactNode }) {
  return <div className="min-w-0 space-y-8" data-persisted-mission-control>
    <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-300">Your practice today</p>
      <h1 className="mt-3 text-3xl font-black sm:text-4xl">Mission Control</h1>
      <p className="mt-3 max-w-2xl text-slate-300">Turn candidate evidence into the next useful conversation.</p>
      <p className="mt-4 text-sm text-slate-300">{state.total} open candidate relationships · {state.onHold} on hold · {state.advanced} in validation or referral stages</p>
    </section>
    <section aria-label="Practice summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[["Active candidates", state.active], ["Assessments in progress", state.inProgress], ["Completed assessments", state.completed], ["In brand matching", state.matching]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-slate-950">{value}</p></div>)}
    </section>
    {schedule}
    <section aria-labelledby="attention-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Who needs a conversation?</p><h2 id="attention-heading" className="mt-1 text-xl font-black">Your next actions</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-sm">{state.attention.length} candidates to review</span></div>
      <p className="mt-2 text-sm text-slate-500">Based on incomplete assessments, recorded progress, Discovery findings and next-step context.</p>
      <div className="mt-5 divide-y divide-slate-100">{state.attention.slice(0, 5).map(row => <Link key={row.candidate.id} href={row.href} className="group flex min-h-11 items-start justify-between gap-4 rounded-xl py-5 focus-visible:outline-2 focus-visible:outline-blue-600">
        <div className="min-w-0"><p className="font-bold text-slate-950 group-hover:text-blue-700">{row.name}</p><p className="mt-1 text-sm font-medium text-amber-800">{row.reasons[0]}</p><p className="mt-2 break-words text-sm leading-6 text-slate-600">{row.nextAction}</p></div><ArrowUpRight aria-hidden className="mt-1 size-5 shrink-0 text-teal-700" />
      </Link>)}</div>
      {!state.attention.length && <p className="mt-5 flex gap-2 text-sm text-slate-600"><CircleCheck className="size-5" aria-hidden />No attention rules are currently triggered. Review your pipeline for the next conversation.</p>}
      {state.attention.length > 5 && <details className="mt-3 rounded-xl bg-slate-50 p-4"><summary className="cursor-pointer py-2 text-sm font-bold">View {state.attention.length - 5} more candidates</summary>{state.attention.slice(5).map(row => <Link key={row.candidate.id} href={row.href} className="block rounded-lg py-3 text-sm"><strong>{row.name}</strong><span className="mt-1 block text-slate-600">{row.reasons[0]}</span></Link>)}</details>}
    </section>
    <section aria-labelledby="pipeline-heading"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="pipeline-heading" className="text-xl font-black">Your pipeline</h2><Link href="/crm/candidates" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-blue-700">Open candidate workspace <ArrowUpRight className="size-4" aria-hidden /></Link></div><p className="mt-1 text-sm text-slate-500">Stage reflects consultant workflow, not financial qualification or a transmitted referral.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{state.stages.map(stage => <div key={stage.id} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="flex justify-between gap-3 font-bold">{stage.label}<span className="text-teal-700">{stage.candidates.length}</span></h3>{stage.candidates.map(row => <Link key={row.candidate.id} href={row.href} className="mt-3 block rounded-xl bg-slate-50 p-3 hover:bg-blue-50"><p className="text-sm font-bold">{row.name}</p><p className="mt-1 text-xs text-slate-500">{row.assessmentLabel}{row.candidate.status === "on-hold" ? " · On hold" : ""}</p></Link>)}</div>)}</div>
      {!state.stages.length && <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center"><Compass className="mx-auto size-7 text-teal-700" aria-hidden /><p className="mt-3 font-bold">Start with your first candidate</p><Link href="/crm/candidates/new" className="mt-3 inline-flex min-h-11 items-center text-blue-700">Create a candidate</Link></div>}
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-xl font-black">Recent recorded activity</h2><div className="mt-4 divide-y divide-slate-100">{state.activity.map((event, i) => <Link key={`${event.candidateId}-${event.label}-${i}`} href={event.href} className="flex min-h-11 flex-wrap items-center justify-between gap-2 py-3 text-sm"><span><strong>{event.name}</strong><span className="ml-2 text-slate-600">{event.label}</span></span><time dateTime={event.at} className="text-xs text-slate-500">{new Date(event.at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time></Link>)}</div>{!state.activity.length && <p className="mt-3 text-sm text-slate-500">No recorded activity yet.</p>}</section>
  </div>;
}
