import { SeedIntelligenceEngine } from "@/feature/intelligence/services/SeedIntelligenceEngine";
import { OverallReadinessCard } from "@/feature/intelligence/components/OverallReadinessCard";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AssessmentResultsPage({
  params,
}: Props) {
  const { id } = await params;

  const engine = new SeedIntelligenceEngine();

  const profile = await engine.buildProfile(id);

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          FranchiseReady Intelligence Profile™
        </p>

        <h1 className="mt-2 text-4xl font-bold text-gray-900">
          Consultant Dashboard
        </h1>

        <p className="mt-3 max-w-3xl text-gray-600">
          Structured intelligence generated from the completed
          assessment. This profile is intended to prepare a
          franchise consultant before the discovery call.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <OverallReadinessCard
          score={profile.overallReadiness}
          level={profile.readinessLevel}
        />

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Timing
          </p>

          <p className="mt-4 text-3xl font-bold text-gray-900">
            {profile.timing.decisionWindow}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Urgency Score: {profile.timing.urgency}
          </p>

          <p className="text-sm text-gray-600">
            Confidence: {profile.timing.confidence}%
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Investment Capacity
          </p>

          <p className="mt-4 text-3xl font-bold text-gray-900">
            {profile.financial.investmentRange}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Financing Likelihood:{" "}
            {profile.financial.financingLikelihood}%
          </p>
        </section>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Behavioral Intelligence
          </h2>

          <div className="mt-6 space-y-3">
            <Row
              label="Leadership Style"
              value={profile.behavioral.leadershipStyle}
            />

            <Row
              label="Decision Style"
              value={profile.behavioral.decisionStyle}
            />

            <Row
              label="Relationship Style"
              value={profile.behavioral.relationshipStyle}
            />

            <Row
              label="Coachability"
              value={`${profile.behavioral.coachability}%`}
            />

            <Row
              label="Systems Orientation"
              value={`${profile.behavioral.systemsOrientation}%`}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Business Competencies
          </h2>

          <div className="mt-6 space-y-4">
            <Competency
              label="Leadership"
              value={profile.competencies.leadership}
            />

            <Competency
              label="Sales"
              value={profile.competencies.sales}
            />

            <Competency
              label="Operations"
              value={profile.competencies.operations}
            />

            <Competency
              label="Finance"
              value={profile.competencies.finance}
            />

            <Competency
              label="Hiring"
              value={profile.competencies.hiring}
            />
          </div>
        </section>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Recommended Brands
          </h2>

          <div className="mt-6 space-y-4">
            {profile.recommendations.map((brand) => (
              <div
                key={brand.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {brand.name}
                  </h3>

                  <span className="text-xl font-bold text-blue-600">
                    {brand.overallFit}%
                  </span>
                </div>

                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
                  {brand.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Discovery Priorities
          </h2>

          <ul className="mt-6 space-y-3">
            {profile.discoveryPriorities.map((item) => (
              <li
                key={item}
                className="rounded-lg bg-gray-50 p-3"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Executive Summary
        </h2>

        <p className="mt-4 leading-7 text-gray-700">
          {profile.executiveSummary}
        </p>
      </section>
    </main>
  );
}

type RowProps = {
  label: string;
  value: string;
};

function Row({
  label,
  value,
}: RowProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
      <span className="text-gray-500">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>
    </div>
  );
}

type CompetencyProps = {
  label: string;
  value: number;
};

function Competency({
  label,
  value,
}: CompetencyProps) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>

        <span className="font-semibold">
          {value}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}