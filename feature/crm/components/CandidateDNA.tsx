type Metric = {
  label: string;
  score: number;
};

type Props = {
  metrics: Metric[];
};

export function CandidateDNA({
  metrics,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-bold">
        Candidate DNA
      </h2>

      <p className="mt-2 text-slate-600">
        FranchiseReady AI's current understanding of the candidate.
      </p>

      <div className="mt-8 space-y-6">

        {metrics.map((metric) => (
          <div key={metric.label}>

            <div className="mb-2 flex justify-between">

              <span className="font-medium">
                {metric.label}
              </span>

              <span className="font-bold">
                {metric.score}
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${metric.score}%`,
                }}
              />

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}