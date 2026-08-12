type Props = {
  name: string;
  title: string;
  readiness: number;
  confidence: number;
  awardProbability: number;
  momentum: "Low" | "Moderate" | "High";
};

export function CandidateWorkspaceHeader({
  name,
  title,
  readiness,
  confidence,
  awardProbability,
  momentum,
}: Props) {
  return (
    <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-8 text-white shadow-xl">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-sm uppercase tracking-[0.20em] text-blue-200">
            Candidate Command Center
          </p>

          <h1 className="mt-2 text-5xl font-bold">
            {name}
          </h1>

          <p className="mt-3 text-lg text-slate-300">
            {title}
          </p>

        </div>

        <div className="grid grid-cols-2 gap-5">

          <Metric
            label="Readiness"
            value={`${readiness}`}
          />

          <Metric
            label="AI Confidence"
            value={`${confidence}%`}
          />

          <Metric
            label="Award Probability"
            value={`${awardProbability}%`}
          />

          <Metric
            label="Momentum"
            value={momentum}
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
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">

      <p className="text-xs uppercase tracking-[0.15em] text-blue-200">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black">
        {value}
      </p>

    </div>
  );
}