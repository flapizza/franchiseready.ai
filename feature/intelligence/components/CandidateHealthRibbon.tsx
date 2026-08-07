type Metric = {
  label: string;
  value: string;
  status: "good" | "warning" | "critical";
};

type Props = {
  metrics: Metric[];
};

export function CandidateHealthRibbon({
  metrics,
}: Props) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm">

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

        {metrics.map((metric) => (
          <HealthCard
            key={metric.label}
            {...metric}
          />
        ))}

      </div>

    </section>
  );
}

type HealthCardProps = Metric;

function HealthCard({
  label,
  value,
  status,
}: HealthCardProps) {
  const color =
    status === "good"
      ? "bg-emerald-500"
      : status === "warning"
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5">

      <div
        className={`h-3 w-3 rounded-full ${color}`}
      />

      <div>

        <div className="text-xs uppercase tracking-wide text-slate-500">
          {label}
        </div>

        <div className="mt-1 text-xl font-bold text-slate-900">
          {value}
        </div>

      </div>

    </div>
  );
}