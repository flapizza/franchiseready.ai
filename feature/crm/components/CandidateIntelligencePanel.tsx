import type { CandidateIntelligenceState } from "@/feature/intelligence/models/CandidateIntelligenceState";

type Props = {
  intelligence: CandidateIntelligenceState;
};

export function CandidateIntelligencePanel({
  intelligence,
}: Props) {
  return (
    <section className="rounded-3xl bg-white/10 p-7 backdrop-blur">

      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
        Candidate Intelligence
      </p>

      <div className="mt-6 space-y-4">

        <Metric
          label="Overall Readiness"
          value={`${intelligence.readiness}`}
        />

        <Metric
          label="AI Confidence"
          value={`${intelligence.confidence}%`}
        />

        <Metric
          label="Buying Signals"
          value={`${intelligence.buyingSignals.length}`}
        />

        <Metric
          label="Potential Risks"
          value={`${intelligence.risks.length}`}
        />

        <Metric
          label="Executive Summary"
          value="AI Generated"
        />

      </div>

      <div className="mt-8 rounded-xl bg-white/5 p-4">

        <h3 className="text-sm font-semibold text-white">
          Executive Summary
        </h3>

        <p className="mt-2 text-sm leading-6 text-blue-100">
          {intelligence.executiveSummary}
        </p>

      </div>

    </section>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({
  label,
  value,
}: MetricProps) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">

      <span className="text-sm text-blue-200">
        {label}
      </span>

      <span className="text-xl font-semibold whitespace-nowrap tabular-nums text-white">
        {value}
      </span>

    </div>
  );
}