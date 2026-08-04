import { Card } from "@/feature/ui";

type Props = {
  opportunityScore: number;
  readiness: number;
  confidence: number;
  decisionWindow: string;
  investmentRange: string;
};

export function OpportunityScoreCard({
  opportunityScore,
  readiness,
  confidence,
  decisionWindow,
  investmentRange,
}: Props) {
  const scoreColor =
    opportunityScore >= 90
      ? "text-emerald-400"
      : opportunityScore >= 75
      ? "text-blue-300"
      : opportunityScore >= 60
      ? "text-amber-300"
      : "text-red-300";

  const status =
    opportunityScore >= 90
      ? "Excellent Opportunity"
      : opportunityScore >= 75
      ? "Strong Opportunity"
      : opportunityScore >= 60
      ? "Developing Opportunity"
      : "Needs Review";

  return (
    <Card className="border-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white shadow-xl">

      <div className="space-y-8">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
              Opportunity Score
            </p>

            <div
              className={`mt-3 text-7xl font-bold leading-none ${scoreColor}`}
            >
              {opportunityScore}
            </div>

            <p className="mt-4 text-lg font-semibold text-white">
              {status}
            </p>

          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-4 text-center backdrop-blur">

            <p className="text-xs uppercase tracking-wide text-blue-200">
              AI Confidence
            </p>

            <div className="mt-2 text-3xl font-bold">
              {confidence}%
            </div>

          </div>

        </div>

        <div className="grid grid-cols-2 gap-4">

          <Metric
            label="Readiness"
            value={`${readiness}/100`}
          />

          <Metric
            label="Decision"
            value={decisionWindow}
          />

          <Metric
            label="Investment"
            value={investmentRange}
          />

          <Metric
            label="Priority"
            value="High"
          />

        </div>

      </div>

    </Card>
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
    <div className="rounded-xl bg-white/10 p-4 backdrop-blur">

      <p className="text-xs uppercase tracking-wide text-blue-200">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-white">
        {value}
      </p>

    </div>
  );
}