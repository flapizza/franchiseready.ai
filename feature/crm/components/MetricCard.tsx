type Props = {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend = "neutral",
}: Props) {
  const trendColor =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
        ? "text-red-600"
        : "text-slate-400";

  const trendIcon =
    trend === "up"
      ? "▲"
      : trend === "down"
        ? "▼"
        : "•";

  return (
    <section className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-slate-500">
              {subtitle}
            </p>
          )}

        </div>

        <div
          className={`text-lg font-bold ${trendColor}`}
        >
          {trendIcon}
        </div>

      </div>

    </section>
  );
}