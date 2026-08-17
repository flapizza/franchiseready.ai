import Link from "next/link";

import type {
  MissionControlAction,
  TopOpportunityState,
} from "../models/MissionControlState";

type Props = {
  candidate: TopOpportunityState;
};

export function CandidateSpotlight({ candidate }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl">
      <div className="grid gap-8 p-7 lg:grid-cols-[1.45fr_0.8fr] lg:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-200">
            Top Opportunity
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">
            {candidate.candidateName}
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-blue-100">
            {candidate.rationale}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <ActionControl action={candidate.primaryAction} primary />
            {candidate.secondaryActions.map((action) => (
              <ActionControl key={action.label} action={action} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric title="Match Confidence" value={`${candidate.confidence}%`} accent />
          <Metric title="Readiness" value={`${candidate.readiness}%`} />
          <Metric title="Momentum" value={candidate.momentum} />
          <Metric title="Best Brand" value={candidate.bestBrand} />
          <div className="col-span-2 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-200">
              Estimated Timeline
            </p>
            <p className="mt-2 text-xl font-bold">
              {candidate.estimatedTimeline}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  title,
  value,
  accent = false,
}: {
  title: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-blue-200">
        {title}
      </p>
      <p
        className={`mt-2 text-2xl font-black capitalize ${
          accent ? "text-emerald-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ActionControl({
  action,
  primary = false,
}: {
  action: MissionControlAction;
  primary?: boolean;
}) {
  const className = primary
    ? "rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
    : "rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20";

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }

  return null;
}
