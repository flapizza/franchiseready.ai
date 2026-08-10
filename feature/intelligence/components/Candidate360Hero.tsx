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
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 text-white shadow-2xl">

      <div className="grid gap-10 p-10 xl:grid-cols-[2fr_360px]">

        <div>

          <div className="inline-flex items-center rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300">

            ● READY FOR BRAND MATCHING

          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.30em] text-blue-300">
            Candidate 360 Intelligence
          </p>

          <h1 className="mt-3 text-5xl font-black">
            {candidateName}
          </h1>

          <p className="mt-8 max-w-4xl text-lg leading-8 text-blue-100">
            {executiveSummary}
          </p>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
              AI Recommendation
            </p>

            <h3 className="mt-3 text-2xl font-bold">
              Proceed to Brand Matching
            </h3>

            <p className="mt-4 leading-7 text-blue-100">
              Candidate demonstrates exceptional executive ownership
              potential. Primary Discovery objective is validating
              family alignment before introducing the recommended
              franchise opportunities.
            </p>

          </div>

        </div>

        <div className="rounded-3xl bg-white/10 p-8 backdrop-blur">

          <p className="text-sm uppercase tracking-[0.30em] text-blue-300">
            AI Confidence
          </p>

          <div className="mt-4 text-7xl font-black text-emerald-300">
            {confidence}%
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20">

            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-300"
              style={{
                width: `${confidence}%`,
              }}
            />

          </div>

          <div className="mt-8 space-y-4">

            <Insight
              label="Readiness"
              value={`${readiness}%`}
            />

            <Insight
              label="Award Probability"
              value={`${awardProbability}%`}
            />

            <Insight
              label="Discovery Stage"
              value={discoveryStage}
            />

            <Insight
              label="Top Brand"
              value={topBrand}
            />

          </div>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">

        <Metric
          label="Net Worth"
          value={netWorth}
        />

        <Metric
          label="Liquid Capital"
          value={liquidCapital}
        />

        <Metric
          label="Buying Confidence"
          value={`${confidence}%`}
        />

        <Metric
          label="Recommended Brand"
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
    <div className="bg-black/20 p-6">

      <div className="text-xs uppercase tracking-[0.20em] text-blue-300">
        {label}
      </div>

      <div className="mt-3 text-3xl font-black">
        {value}
      </div>

    </div>
  );
}

type InsightProps = {
  label: string;
  value: string;
};

function Insight({
  label,
  value,
}: InsightProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">

      <span className="text-sm text-blue-100">
        {label}
      </span>

      <span className="font-bold">
        {value}
      </span>

    </div>
  );
}