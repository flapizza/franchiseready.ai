import { ProgressMetric } from "./ProgressMetric";

type Props = {
  leadership: number;
  sales: number;
  operations: number;
  coachability: number;
  financial: number;
};

export function IntelligenceProfileCard({
  leadership,
  sales,
  operations,
  coachability,
  financial,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <header className="border-b border-slate-100 px-6 py-5">

        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Candidate Intelligence
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Intelligence Profile
        </h2>

      </header>

      <div className="space-y-6 p-6">

        <ProgressMetric
          label="Leadership"
          value={leadership}
        />

        <ProgressMetric
          label="Sales"
          value={sales}
        />

        <ProgressMetric
          label="Operations"
          value={operations}
        />

        <ProgressMetric
          label="Coachability"
          value={coachability}
        />

        <ProgressMetric
          label="Financial Readiness"
          value={financial}
        />

      </div>

    </section>
  );
}