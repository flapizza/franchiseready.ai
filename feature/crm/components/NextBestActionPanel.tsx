type Props = {
  title: string;
  description: string;
  confidence: number;
  impact: number;
  dueInDays?: number;
};

export function NextBestActionPanel({
  title,
  description,
  confidence,
  impact,
  dueInDays,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">

      <div className="border-b border-blue-100 px-6 py-5">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              AI Recommendation
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {title}
            </h2>

          </div>

          <div className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            Next Best Action
          </div>

        </div>

      </div>

      <div className="space-y-6 p-6">

        <p className="leading-7 text-slate-600">
          {description}
        </p>

        <div className="grid gap-4 md:grid-cols-3">

          <Metric
            label="Confidence"
            value={`${confidence}%`}
          />

          <Metric
            label="Expected Impact"
            value={`${impact}%`}
          />

          <Metric
            label="Recommended Window"
            value={
              dueInDays
                ? `${dueInDays} Days`
                : "Flexible"
            }
          />

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
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}