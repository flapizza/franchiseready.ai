import type { CandidateRecord } from "../models/CandidateRecord";

type Props = {
  candidate: CandidateRecord;
};

export function CandidateHeader({
  candidate,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div className="border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                Candidate Intelligence Workspace
              </span>

              <span className="rounded-full border border-white/30 px-3 py-1 text-xs">
                {candidate.pipelineStage}
              </span>

            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              {candidate.firstName} {candidate.lastName}
            </h1>

            <p className="mt-2 max-w-2xl text-blue-100">
              FranchiseReady AI has analyzed this candidate and generated
              intelligence, readiness, behavioral insights, and franchise
              recommendations to support the discovery process.
            </p>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <HeaderStat
              label="Health"
              value={candidate.healthScore.toString()}
            />

            <HeaderStat
              label="Readiness"
              value={candidate.intelligence.overallReadiness.toString()}
            />

          </div>

        </div>

      </div>

      <div className="grid gap-6 px-8 py-6 md:grid-cols-4">

        <QuickStat
          title="Pipeline"
          value={candidate.pipelineStage}
        />

        <QuickStat
          title="Health Status"
          value={
            candidate.healthScore >= 90
              ? "Excellent"
              : candidate.healthScore >= 75
                ? "Healthy"
                : "Needs Attention"
          }
        />

        <QuickStat
          title="Decision Timeline"
          value={candidate.intelligence.timing.decisionWindow}
        />

        <QuickStat
          title="Investment Range"
          value={candidate.intelligence.financial.investmentRange}
        />

      </div>

    </section>
  );
}

type HeaderStatProps = {
  label: string;
  value: string;
};

function HeaderStat({
  label,
  value,
}: HeaderStatProps) {
  return (
    <div className="rounded-xl bg-white/10 p-4 backdrop-blur">

      <p className="text-xs uppercase tracking-wider text-blue-100">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}

type QuickStatProps = {
  title: string;
  value: string;
};

function QuickStat({
  title,
  value,
}: QuickStatProps) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-lg font-semibold text-gray-900">
        {value}
      </p>

    </div>
  );
}