import Link from "next/link";

import { PriorityCard } from "@/feature/crm/components/PriorityCard";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";

export default async function CrmDashboardPage() {
  const repository = new SeedCandidateRepository();

  const candidates = await repository.getAll();

  return (
    <main className="space-y-10 p-8">

      <header>

        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          FranchiseReady CRM
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Good Morning, Jim
        </h1>

        <p className="mt-3 text-gray-600">
          Here's where your attention is needed today.
        </p>

      </header>

      <section className="grid gap-6 lg:grid-cols-4">

        <SummaryCard
          title="Active Candidates"
          value="18"
        />

        <SummaryCard
          title="Discovery Calls"
          value="3"
        />

        <SummaryCard
          title="Validation Calls"
          value="2"
        />

        <SummaryCard
          title="Pipeline Health"
          value="92%"
        />

      </section>

      <section>

        <h2 className="mb-5 text-2xl font-bold">
          Today's Priorities
        </h2>

        <div className="space-y-5">

          {candidates.map((candidate) => (
            <PriorityCard
              key={candidate.id}
              candidate={candidate}
              reason="Assessment completed. Financially qualified. Discovery call has not yet been scheduled."
            />
          ))}

        </div>

      </section>

      <section>

        <h2 className="mb-5 text-2xl font-bold">
          Candidate Pipeline
        </h2>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <table className="min-w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-left">
                  Candidate
                </th>

                <th className="px-6 py-4 text-left">
                  Stage
                </th>

                <th className="px-6 py-4 text-left">
                  Health
                </th>

              </tr>

            </thead>

            <tbody>

              {candidates.map((candidate) => (

                <tr
                  key={candidate.id}
                  className="border-t border-gray-100"
                >
                  <td className="px-6 py-4">

                    <Link
                      href={`/crm/${candidate.id}`}
                      className="font-semibold text-blue-700 hover:underline"
                    >
                      {candidate.firstName} {candidate.lastName}
                    </Link>

                  </td>

                  <td className="px-6 py-4 capitalize">
                    {candidate.pipelineStage}
                  </td>

                  <td className="px-6 py-4">
                    {candidate.healthScore}
                  </td>
                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

    </main>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
};

function SummaryCard({
  title,
  value,
}: SummaryCardProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-bold">
        {value}
      </p>

    </section>
  );
}