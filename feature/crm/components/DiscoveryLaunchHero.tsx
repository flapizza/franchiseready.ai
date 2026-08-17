import { Button, Card } from "@/feature/ui";

type Props = {
  candidateName: string;
  readiness: number;
  confidence: number;
  recommendation: string;
  estimatedDuration: string;
  preparedAt: string;
};

export function DiscoveryLaunchHero({
  candidateName,
  readiness,
  confidence,
  recommendation,
  estimatedDuration,
  preparedAt,
}: Props) {
  return (
    <Card>
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-10 text-white">

        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

          <div className="max-w-3xl">

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
              AI Discovery Ready
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              {candidateName}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
              {recommendation}
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <Metric
              label="Readiness"
              value={`${readiness}/100`}
            />

            <Metric
              label="AI Confidence"
              value={`${confidence}%`}
            />

            <Metric
              label="Estimated Meeting"
              value={estimatedDuration}
            />

            <Metric
              label="Prepared"
              value={preparedAt}
            />

          </div>

        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">

          <Button>
  Start Discovery Meeting
</Button>

          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
            AI has prepared today’s meeting
          </span>

        </div>

      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

      <p className="text-xs uppercase tracking-[0.18em] text-blue-200">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}
