import Link from "next/link";

import type {
  IntelligenceEventType,
  MissionControlPriority,
  MissionControlState,
} from "../models/MissionControlState";

import { AICommandCenter } from "./AICommandCenter";
import { CandidateSpotlight } from "./CandidateSpotlight";

const priorityStyles: Record<MissionControlPriority, string> = {
  critical: "border-rose-200 bg-rose-50 text-rose-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  normal: "border-slate-200 bg-slate-100 text-slate-700",
};

const eventStyles: Record<IntelligenceEventType, string> = {
  "assessment-completed": "bg-blue-500",
  "momentum-change": "bg-amber-500",
  "brand-readiness": "bg-indigo-500",
  "discovery-milestone": "bg-cyan-500",
  "risk-signal": "bg-rose-500",
  "referral-ready": "bg-emerald-500",
};

type Props = {
  state: MissionControlState;
};

export function MissionControlPage({ state }: Props) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl">
        <div className="grid gap-6 p-7 xl:grid-cols-[1.15fr_1fr] xl:p-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">
                AI Daily Brief
              </p>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight">
              Good afternoon, {state.consultantName}.
            </h1>
            <p className="mt-2 text-lg text-slate-300">
              {state.dailyBrief.summary}
            </p>

            <div className="mt-5 grid gap-2">
              {state.dailyBrief.priorities.map((priority) => (
                <div
                  key={priority.candidateId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={priority.priority} dark />
                    <span className="font-semibold">
                      {priority.candidateName}
                    </span>
                  </div>
                  <span className="text-sm text-slate-300">
                    {priority.recommendedAction}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 self-start">
            {state.dailyBrief.kpis.map((kpi) => (
              <div
                key={kpi.id}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur"
              >
                <p className="text-3xl font-black text-white">
                  {kpi.value}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CandidateSpotlight candidate={state.topOpportunity} />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <SectionCard
          eyebrow="Today’s Focus"
          title="Priority Candidates"
          subtitle="Ranked by momentum risk, unresolved intelligence, and lifecycle value."
        >
          <div className="grid gap-3">
            {state.priorityCandidates.map((candidate) => (
              <article
                key={candidate.candidateId}
                className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <PriorityBadge priority={candidate.priority} />
                    <h3 className="text-lg font-bold text-slate-900">
                      {candidate.candidateName}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {candidate.reason}
                  </p>
                </div>
                <div className="md:w-56">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Recommended Action
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {candidate.recommendedAction}
                  </p>
                  <Link
                    href={candidate.openCandidateHref}
                    className="mt-3 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Open Candidate
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Prepared Meetings"
          title="Today’s Agenda"
          subtitle="Candidate context and objectives are ready before each conversation."
        >
          <div className="space-y-3">
            {state.agenda.map((meeting) => (
              <article
                key={meeting.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg font-black text-slate-900">
                    {meeting.time}
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700">
                    {meeting.status}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  {meeting.candidateName}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {meeting.objective}
                </p>
                <Link
                  href={meeting.briefingHref}
                  className="mt-4 inline-flex w-full justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Prepare Briefing
                </Link>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <AICommandCenter actions={state.recommendedActions} />

      <SectionCard
        eyebrow="Conversion Opportunity"
        title="Ready for Introduction"
        subtitle="Highest-confidence candidate and brand pairings ready for consultant action."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {state.introductionReady.map((candidate) => (
            <article
              key={candidate.candidateId}
              className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5"
            >
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {candidate.candidateName}
                </h3>
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  {candidate.brandName}
                </p>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-3xl font-black text-emerald-600">
                    {candidate.confidence}%
                  </p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Confidence
                  </p>
                </div>
                {candidate.action.href && <Link href={candidate.action.href} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">{candidate.action.label}</Link>}
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Detected Intelligence"
        title="Live Intelligence Feed"
        subtitle="Recent candidate milestones derived from lifecycle and intelligence activity."
      >
        <div className="grid gap-x-8 gap-y-1 lg:grid-cols-2">
          {state.intelligenceFeed.map((event) => (
            <article
              key={event.id}
              className="flex gap-4 border-b border-slate-100 py-4 last:border-0"
            >
              <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${eventStyles[event.type]}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    {event.label}
                  </p>
                  <span className="text-xs font-semibold uppercase text-slate-400">
                    {event.dateLabel}
                  </span>
                </div>
                <h3 className="mt-1 font-bold text-slate-900">
                  {event.candidateName}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {event.explanation}
                </p>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function PriorityBadge({
  priority,
  dark = false,
}: {
  priority: MissionControlPriority;
  dark?: boolean;
}) {
  return (
    <span
      className={
        dark
          ? "rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase text-white"
          : `rounded-full border px-3 py-1 text-xs font-bold uppercase ${priorityStyles[priority]}`
      }
    >
      {priority}
    </span>
  );
}

function SectionCard({
  eyebrow,
  title,
  subtitle,
  children,
}: React.PropsWithChildren<{
  eyebrow: string;
  title: string;
  subtitle: string;
}>) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-600">
          {eyebrow}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="text-sm text-slate-500">
            {subtitle}
          </p>
        </div>
      </header>
      <div className="p-6">
        {children}
      </div>
    </section>
  );
}
