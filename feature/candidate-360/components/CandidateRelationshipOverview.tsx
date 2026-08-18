import { ArrowRight, CheckCircle2, ClipboardList, Mail, MapPin, Phone, UserRound } from "lucide-react";
import type { Candidate360State } from "../models/Candidate360State";
import { AssessmentInvitationAction } from "@/feature/crm/components/AssessmentInvitationAction";
import { CandidateLifecycleAction } from "@/feature/crm/components/CandidateLifecycleAction";
import Link from "next/link";

const knownIcons = { email: Mail, phone: Phone, location: MapPin, territory: MapPin, source: UserRound };

export function CandidateRelationshipOverview({ candidate }: { candidate: Candidate360State }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><UserRound size={20} /></span><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Candidate profile</p><h2 className="mt-1 text-xl font-black text-slate-900">What we know</h2></div></div>
        <dl className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          {candidate.knownInformation.map((item) => {
            const Icon = knownIcons[item.icon];
            return <div key={item.label} className="flex items-start gap-3 border-b border-slate-100 pb-4"><Icon size={16} className="mt-0.5 shrink-0 text-slate-400" /><div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</dt><dd className={`mt-1 text-sm font-semibold ${item.value === "Not provided" ? "text-slate-400" : "text-slate-800"}`}>{item.value}</dd></div></div>;
          })}
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4"><span className={`rounded-xl p-2.5 ${candidate.assessmentStatus === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-teal-50 text-teal-600"}`}>{candidate.assessmentStatus === "completed" ? <CheckCircle2 size={21} /> : <ClipboardList size={21} />}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${candidate.assessmentStatus === "completed" ? "bg-emerald-50 text-emerald-700" : candidate.assessmentStatus === "pending" ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"}`}>{candidate.assessment.label}</span></div>
        <h2 className="mt-5 text-xl font-black text-slate-900">Assessment status</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{candidate.assessment.detail}</p>
        <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Next recommended action</p><p className="mt-1 text-sm font-bold text-slate-800">{candidate.nextBestAction}</p></div>
        {candidate.lifecycleAction && <div className="mt-4"><CandidateLifecycleAction candidateId={candidate.id} label={candidate.lifecycleAction.label} /></div>}
        {candidate.brandStrategyHref && <Link href={candidate.brandStrategyHref} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700">Review Brand Strategy <ArrowRight size={16} /></Link>}
        {candidate.referralAction && <Link href={candidate.referralAction.href} className="ml-3 mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800">{candidate.referralAction.label}<ArrowRight size={16} /></Link>}
      </div>

      {!candidate.hasIntelligence && <div className="xl:col-span-2"><AssessmentInvitationAction candidateId={candidate.id} existingUrl={candidate.assessmentUrl} /></div>}
      {candidate.brandStrategy && <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Brand Strategy</p><h2 className="mt-1 text-xl font-black">{candidate.brandStrategy.statusLabel}</h2><p className="mt-2 text-sm text-slate-600">{candidate.brandStrategy.recommendations} AI recommendations · {candidate.brandStrategy.presented} presented · {candidate.brandStrategy.strongInterest} strong-interest · {candidate.brandStrategy.referralSelections} selected for referral</p></div>{candidate.brandStrategyHref && <Link href={candidate.brandStrategyHref} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white">Open Brand Strategy</Link>}</div></div>}
      {candidate.referrals && <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Referrals</p><h2 className="mt-1 text-xl font-black text-slate-900">{candidate.referrals.total} Referral{candidate.referrals.total === 1 ? "" : "s"} · {candidate.referrals.introduced} Sent</h2></div>{candidate.referralAction && <Link href={candidate.referralAction.href} className="text-sm font-black text-blue-600">Open Referral Studio</Link>}</div><div className="mt-4 grid gap-2 sm:grid-cols-3">{candidate.referrals.items.map((item) => <div key={item.brandName} className="rounded-xl bg-slate-50 p-3"><p className="text-sm font-black text-slate-800">{item.brandName}</p><p className="mt-1 text-xs font-bold text-slate-500">{item.statusLabel}</p></div>)}</div></div>}
    </section>
  );
}
