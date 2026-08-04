type Props = {
  score: number;
  confidence?: number;
  size?: number;
};

export function ReadinessGauge({
  score,
  confidence = 96,
  size = 220,
}: Props) {
  const stroke = 20;

  const radius = (size - stroke) / 2;

  const circumference = 2 * Math.PI * radius;

  const dashOffset =
    circumference - (score / 100) * circumference;

  const label =
    score >= 85
      ? "Excellent Opportunity"
      : score >= 70
        ? "Strong Opportunity"
        : score >= 50
          ? "Developing Opportunity"
          : "Needs Review";

  return (
    <section className="w-[340px] rounded-[32px] border border-slate-200 bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">

      <div className="text-center">

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Candidate Score
        </p>

      </div>

      <div
        className="relative mx-auto mt-8"
        style={{
          width: size,
          height: size,
        }}
      >
        <svg
          width={size}
          height={size}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={stroke}
          />

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2563eb"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">

          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-50">

            <span className="text-7xl font-black tracking-[-0.05em] text-slate-900">
              {score}
            </span>

          </div>

        </div>

      </div>

      <div className="mt-8 text-center">

        <h2 className="text-2xl font-bold text-slate-900">
          {label}
        </h2>

      </div>

      <div className="mt-8 space-y-4">

        <div className="rounded-2xl bg-slate-100 px-6 py-4">

          <div className="flex items-center justify-between">

            <span className="text-sm font-medium text-slate-600">
              AI Confidence
            </span>

            <span className="text-2xl font-bold text-blue-600">
              {confidence}%
            </span>

          </div>

        </div>

      </div>

    </section>
  );
}