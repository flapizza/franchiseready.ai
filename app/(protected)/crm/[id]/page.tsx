import { notFound } from "next/navigation";

import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { CandidateHeader } from "@/feature/crm/components/CandidateHeader";
import { MetricCard } from "@/feature/crm/components/MetricCard";
import { SectionCard } from "@/feature/crm/components/SectionCard";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CandidateWorkspacePage({
  params,
}: Props) {
  const { id } = await params;

  const repository = new SeedCandidateRepository();

  const candidate = await repository.getById(id);

  if (!candidate) {
    notFound();
  }

  return (
    <main className="space-y-8 p-8">

      <CandidateHeader candidate={candidate} />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          title="Overall Readiness"
          value={candidate.intelligence.overallReadiness.toString()}
        />

        <MetricCard
          title="Health Score"
          value={candidate.healthScore.toString()}
        />

        <MetricCard
          title="Decision Timeline"
          value={candidate.intelligence.timing.decisionWindow}
        />

        <MetricCard
          title="Investment Range"
          value={candidate.intelligence.financial.investmentRange}
        />

      </section>

      <section className="grid gap-6 xl:grid-cols-2">

        <SectionCard title="Executive Summary">

          <p className="leading-7 text-gray-700">
            {candidate.intelligence.executiveSummary}
          </p>

        </SectionCard>

        <SectionCard title="Behavioral Intelligence">

          <div className="space-y-3">

            <BehaviorRow
              label="Leadership Style"
              value={candidate.intelligence.behavioral.leadershipStyle}
            />

            <BehaviorRow
              label="Decision Style"
              value={candidate.intelligence.behavioral.decisionStyle}
            />

            <BehaviorRow
              label="Relationship Style"
              value={candidate.intelligence.behavioral.relationshipStyle}
            />

            <BehaviorRow
              label="Coachability"
              value={`${candidate.intelligence.behavioral.coachability}%`}
            />

          </div>

        </SectionCard>

      </section>

      <section className="grid gap-6 xl:grid-cols-2">

        <SectionCard title="Recommended Brands">

          <div className="space-y-4">

            {candidate.intelligence.recommendations.map((brand) => (

              <div
                key={brand.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">

                  <h3 className="font-semibold text-lg">
                    {brand.name}
                  </h3>

                  <span className="text-2xl font-bold text-blue-600">
                    {brand.overallFit}%
                  </span>

                </div>

                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-600">

                  {brand.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}

                </ul>

              </div>

            ))}

          </div>

        </SectionCard>

        <SectionCard title="Discovery Priorities">

          <ul className="space-y-3">

            {candidate.intelligence.discoveryPriorities.map((priority) => (

              <li
                key={priority}
                className="rounded-lg bg-gray-50 p-3"
              >
                {priority}
              </li>

            ))}

          </ul>

        </SectionCard>

      </section>

    </main>
  );
}

type BehaviorRowProps = {
  label: string;
  value: string;
};

function BehaviorRow({
  label,
  value,
}: BehaviorRowProps) {
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