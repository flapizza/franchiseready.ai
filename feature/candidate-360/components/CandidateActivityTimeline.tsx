import { Award, Building2, CheckCircle2, ClipboardList, Compass, Mail, RefreshCw, Sparkles, UserPlus } from "lucide-react";
import type { Candidate360State, CandidateActivityIcon, CandidateActivityTone } from "../models/Candidate360State";

const icons: Record<CandidateActivityIcon, typeof Sparkles> = {
  candidate: UserPlus, assessment: ClipboardList, discovery: Compass, brand: Building2,
  referral: Award, stage: RefreshCw, activity: CheckCircle2, email: Mail,
};
const tones: Record<CandidateActivityTone, string> = {
  slate: "border-slate-200 bg-slate-50 text-slate-500", blue: "border-blue-200 bg-blue-50 text-blue-600",
  teal: "border-teal-200 bg-teal-50 text-teal-600", emerald: "border-emerald-200 bg-emerald-50 text-emerald-600",
  amber: "border-amber-200 bg-amber-50 text-amber-600",
};

export function CandidateActivityTimeline({ candidate }: { candidate: Candidate360State }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-end justify-between gap-4 border-b border-slate-200 px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Relationship history</p><h2 className="mt-1 text-2xl font-black text-slate-900">Activity timeline</h2></div><span className="text-xs font-semibold text-slate-400">{candidate.activities.length} event{candidate.activities.length === 1 ? "" : "s"}</span></header>
      {candidate.activities.length ? <ol className="px-6 py-2">{candidate.activities.map((activity, index) => {
        const Icon = icons[activity.icon];
        return <li key={activity.id} className="relative flex gap-4 py-5">{index < candidate.activities.length - 1 && <span className="absolute left-[18px] top-12 h-[calc(100%-24px)] w-px bg-slate-200" />}<span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${tones[activity.tone]}`}><Icon size={16} /></span><div className="min-w-0 flex-1"><div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"><h3 className="font-bold text-slate-900">{activity.title}</h3><time dateTime={activity.timestamp} className="shrink-0 text-xs font-semibold text-slate-400">{activity.dateLabel}</time></div>{activity.description && <p className="mt-1 text-sm leading-6 text-slate-600">{activity.description}</p>}</div></li>;
      })}</ol> : <div className="p-10 text-center text-sm text-slate-500">No relationship activity has been recorded yet.</div>}
    </section>
  );
}
