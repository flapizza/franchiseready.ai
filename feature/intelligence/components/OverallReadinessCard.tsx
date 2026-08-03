type Props = {
  score: number;
  level: string;
};

export function OverallReadinessCard({
  score,
  level,
}: Props) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
        Overall Readiness
      </p>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-5xl font-bold tracking-tight text-gray-900">
            {score}
          </p>

          <p className="mt-2 text-lg font-semibold text-green-600">
            {level}
          </p>
        </div>

        <div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-blue-600">
          <span className="text-lg font-bold">
            {score}%
          </span>
        </div>
      </div>
    </section>
  );
}