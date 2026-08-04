type Props = {
  score: number;
  size?: number;
};

export function ReadinessGauge({
  score,
  size = 180,
}: Props) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress =
    circumference - (score / 100) * circumference;

  const color =
    score >= 85
      ? "#16a34a"
      : score >= 70
      ? "#2563eb"
      : score >= 50
      ? "#f59e0b"
      : "#dc2626";

  const label =
    score >= 85
      ? "Excellent"
      : score >= 70
      ? "Strong"
      : score >= 50
      ? "Developing"
      : "Needs Review";

  return (
    <div className="flex flex-col items-center">

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
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
        />
      </svg>

      <div className="-mt-36 text-center">

        <p className="text-5xl font-bold">
          {score}
        </p>

        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Overall Readiness
        </p>

        <p
          className="mt-2 font-semibold"
          style={{
            color,
          }}
        >
          {label}
        </p>

      </div>

    </div>
  );
}