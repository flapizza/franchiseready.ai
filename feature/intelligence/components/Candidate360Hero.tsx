type Props = {
  candidateName: string;

  readiness: number;

  confidence: number;

  awardProbability: number;

  netWorth: string;

  liquidCapital: string;

  discoveryStage: string;

  topBrand: string;

  executiveSummary: string;
};

export function Candidate360Hero({
  candidateName,
  readiness,
  confidence,
  awardProbability,
  netWorth,
  liquidCapital,
  discoveryStage,
  topBrand,
  executiveSummary,
}: Props) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 text-white shadow-xl">

      <div className="p-10">

        <p className="text-xs font-semibold uppercase tracking-[0.30em] text-blue-300">
          Candidate 360
        </p>

        <h1 className="mt-3 text-5xl font-black">
          {candidateName}
        </h1>

        <p className="mt-6 max-w-4xl text-lg leading-8 text-blue-100">
          {executiveSummary}
        </p>

      </div>

      <div className="grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-7">

        <Metric
          label="Readiness"
          value={`${readiness}`}
        />

        <Metric
          label="AI Confidence"
          value={`${confidence}%`}
        />

        <Metric
          label="Award"
          value={`${awardProbability}%`}
        />

        <Metric
          label="Net Worth"
          value={netWorth}
        />

        <Metric
          label="Liquid"
          value={liquidCapital}
        />

        <Metric
          label="Discovery"
          value={discoveryStage}
        />

        <Metric
          label="Top Brand"
          value={topBrand}
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
    <div className="bg-black/15 p-6">

      <div className="text-xs uppercase tracking-wide text-blue-300">
        {label}
      </div>

      <div className="mt-3 text-3xl font-black">
        {value}
      </div>

    </div>
  );
}