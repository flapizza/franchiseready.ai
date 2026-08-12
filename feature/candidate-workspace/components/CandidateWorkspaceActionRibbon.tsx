type Props = {
  recommendation: string;
  confidence: number;
  awardProbability: number;
  reasons: string[];
  primaryAction: string;
  secondaryAction?: string;
  tertiaryAction?: string;
};

export function CandidateWorkspaceActionRibbon({
  recommendation,
  confidence,
  awardProbability,
  reasons,
  primaryAction,
  secondaryAction,
  tertiaryAction,
}: Props) {
  return (
    <section className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-8 shadow-sm">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        <div className="max-w-3xl">

          <p className="text-xs font-semibold uppercase tracking-[0.20em] text-blue-700">
            AI Next Best Action
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {recommendation}
          </h2>

          <div className="mt-6 grid gap-3">

            {reasons.map((reason) => (
              <div
                key={reason}
                className="flex items-center gap-3"
              >
                <span className="text-emerald-600 font-bold">
                  ✓
                </span>

                <span className="text-slate-700">
                  {reason}
                </span>

              </div>
            ))}

          </div>

        </div>

        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <Metric
            label="AI Confidence"
            value={`${confidence}%`}
          />

          <Metric
            label="Award Probability"
            value={`${awardProbability}%`}
          />

          <div className="flex flex-col gap-3 pt-2">

            <button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
              {primaryAction}
            </button>

            {secondaryAction && (
              <button className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100">
                {secondaryAction}
              </button>
            )}

            {tertiaryAction && (
              <button className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100">
                {tertiaryAction}
              </button>
            )}

          </div>

        </div>

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
    <div>

      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-blue-600">
        {value}
      </p>

    </div>
  );
}