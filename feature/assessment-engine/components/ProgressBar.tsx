type Props = {
  current: number;
  total: number;
};

const phases = [
  "Personal",
  "Career",
  "Motivation",
  "Leadership",
  "Lifestyle",
  "Financial",
  "Brand DNA",
  "Complete",
];

export function ProgressBar({
  current,
  total,
}: Props) {
  const percent =
    total === 0
      ? 0
      : Math.round((current / total) * 100);

  const activeStep = Math.min(
    phases.length - 1,
    Math.floor((current / Math.max(total, 1)) * phases.length),
  );

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
            Franchise Discovery Progress
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            {percent}% Complete
          </h3>

        </div>

        <div className="rounded-xl bg-slate-100 px-4 py-2 font-bold">
          {current} / {total}
        </div>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

      <div className="grid grid-cols-4 gap-4 lg:grid-cols-8">

        {phases.map((phase, index) => {

          const completed =
            index < activeStep;

          const active =
            index === activeStep;

          return (
            <div
              key={phase}
              className="text-center"
            >

              <div
                className={[
                  "mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                  completed
                    ? "border-blue-600 bg-blue-600 text-white"
                    : active
                    ? "border-blue-600 bg-white text-blue-600"
                    : "border-slate-300 bg-white text-slate-400",
                ].join(" ")}
              >
                {index + 1}
              </div>

              <p
                className={[
                  "mt-2 text-xs font-medium",
                  active
                    ? "text-blue-700"
                    : completed
                    ? "text-slate-900"
                    : "text-slate-400",
                ].join(" ")}
              >
                {phase}
              </p>

            </div>
          );

        })}

      </div>

    </div>
  );
}