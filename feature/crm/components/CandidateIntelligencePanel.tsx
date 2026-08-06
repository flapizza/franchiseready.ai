type Props = {
  score: number;
  confidence: number;
};

export function CandidateIntelligencePanel({
  score,
  confidence,
}: Props) {
  return (
    <section className="rounded-3xl bg-white/10 p-7 backdrop-blur">

      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
        Candidate Intelligence
      </p>

      <div className="mt-6 space-y-4">

        <Metric
          label="Overall Readiness"
          value={`${score}`}
        />

        <Metric
          label="AI Confidence"
          value={`${confidence}%`}
        />

        <Metric
          label="Award Probability"
          value="91%"
        />

        <Metric
          label="Net Worth"
          value="$2.3M"
        />

        <Metric
          label="Liquid Capital"
          value="$650,000"
        />

        <Metric
          label="Investment Range"
          value="$500K – $1M"
        />

        <Metric
          label="Decision Window"
          value="3–6 Months"
        />

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

      <span className="text-xl font-semibold tabular-nums text-white whitespace-nowrap">
        {value}
      </span>

    </div>
  );
}