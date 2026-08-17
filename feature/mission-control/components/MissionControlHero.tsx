import { ArrowRight, Phone, Sparkles } from "lucide-react";

type Props = {
  consultant: string;

  activeCandidates: number;

  discoveryCandidates: number;

  referralReady: number;

  urgentCandidates: number;

  recommendationTitle: string;

  recommendationExplanation: string;
};

export function MissionControlHero({
  consultant,
  activeCandidates,
  discoveryCandidates,
  referralReady,
  urgentCandidates,
  recommendationTitle,
  recommendationExplanation,
}: Props) {
  return (
    <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white shadow-2xl">

      <div className="grid gap-12 p-10 xl:grid-cols-[2fr_1fr]">

        <div>

          <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-500/10 px-4 py-2">

            <Sparkles className="h-4 w-4 text-teal-300" />

            <span className="text-sm font-semibold text-teal-200">
              The AI Operating System for Franchise Consultants
            </span>

          </div>

          <h1 className="mt-8 text-5xl font-black tracking-tight">
            Good Afternoon,
            <br />
            {consultant}
          </h1>

          <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-300">
            FranGroove AI has analyzed your candidate pipeline
            and identified the highest-impact actions for today.
          </p>

          <div className="mt-10 rounded-3xl bg-white/5 p-8 backdrop-blur">

            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-300">
              AI Recommendation
            </div>

            <h2 className="mt-3 text-3xl font-bold">
              {recommendationTitle}
            </h2>

            <p className="mt-4 max-w-xl leading-8 text-slate-300">
              {recommendationExplanation}
            </p>

            <button
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-teal-500 px-6 py-4 font-semibold text-slate-950 transition hover:bg-teal-400"
            >
              <Phone className="h-5 w-5" />

              Start Follow-up

              <ArrowRight className="h-5 w-5" />

            </button>

          </div>

        </div>

        <div className="space-y-5">

          <Metric
            label="Active Candidates"
            value={activeCandidates}
          />

          <Metric
            label="In Discovery"
            value={discoveryCandidates}
          />

          <Metric
            label="Referral Ready"
            value={referralReady}
          />

          <Metric
            label="Needs Attention"
            value={urgentCandidates}
            danger
          />

        </div>

      </div>

    </section>
  );
}

type MetricProps = {
  label: string;

  value: number;

  danger?: boolean;
};

function Metric({
  label,
  value,
  danger,
}: MetricProps) {
  return (
    <div className="rounded-3xl bg-white/5 p-6 backdrop-blur">

      <div className="text-sm uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>

      <div
        className={`mt-3 text-5xl font-black ${
          danger
            ? "text-amber-300"
            : "text-white"
        }`}
      >
        {value}
      </div>

    </div>
  );
}
