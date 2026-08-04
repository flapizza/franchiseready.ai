type Props = {
  label: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
};

export function Stat({
  label,
  value,
  description,
  trend = "neutral",
}: Props) {
  const trendColor = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-slate-400",
  };

  const trendIcon = {
    up: "▲",
    down: "▼",
    neutral: "•",
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <span className={trendColor[trend]}>
          {trendIcon[trend]}
        </span>

      </div>

      <p className="mt-4 text-5xl font-bold tracking-tight">
        {value}
      </p>

      {description && (
        <p className="mt-3 text-sm text-slate-500">
          {description}
        </p>
      )}

    </section>
  );
}