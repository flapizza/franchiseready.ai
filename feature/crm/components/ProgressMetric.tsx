type Props = {
  label: string;
  value: number;
  max?: number;
};

export function ProgressMetric({
  label,
  value,
  max = 100,
}: Props) {
  const percentage = Math.min(
    Math.max((value / max) * 100, 0),
    100,
  );

  let barColor = "bg-red-500";

  if (percentage >= 85) {
    barColor = "bg-emerald-500";
  } else if (percentage >= 70) {
    barColor = "bg-blue-500";
  } else if (percentage >= 50) {
    barColor = "bg-amber-500";
  }

  return (
    <div className="space-y-2">

      <div className="flex items-center justify-between">

        <span className="text-sm font-medium text-slate-600">
          {label}
        </span>

        <span className="text-sm font-bold text-slate-900">
          {value}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">

        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}