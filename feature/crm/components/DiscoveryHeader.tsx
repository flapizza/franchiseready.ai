import { Button } from "@/feature/ui";

type Props = {
  candidateName: string;
  startedAt: string;
  duration: string;
  score: number;
  confidence: number;
};

export function DiscoveryHeader({
  candidateName,
  startedAt,
  duration,
  score,
  confidence,
}: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-xl">

      <div className="flex flex-col gap-10 p-8 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
            Live Discovery Session
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-white">
            {candidateName}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            AI is actively assisting this discovery conversation.
            Recommendations and coaching will update as the
            discussion progresses.
          </p>

        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          <Metric
            label="Opportunity"
            value={`${score}`}
          />

          <Metric
            label="AI Confidence"
            value={`${confidence}%`}
          />

          <Metric
            label="Started"
            value={startedAt}
          />

          <Metric
            label="Duration"
            value={duration}
          />

        </div>

      </div>

      <div className="flex flex-wrap gap-4 border-t border-white/10 bg-black/10 px-8 py-5">

        <Button>
          End Meeting
        </Button>

        <Button variant="secondary">
          Generate Summary
        </Button>

        <Button variant="secondary">
          Recommend Brands
        </Button>

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
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}