import { Card } from "@/feature/ui";

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
    <Card
      title="Candidate DNA Profile"
      subtitle="Core competencies identified by the FranGroove Intelligence Engine."
    >
      <div className="space-y-10">

        <DNAAttribute
          title="Executive Leadership"
          score={leadership}
          description="Ability to lead people, make decisions, and build organizations."
        />

        <DNAAttribute
          title="Sales & Business Development"
          score={sales}
          description="Natural ability to generate revenue and build relationships."
        />

        <DNAAttribute
          title="Operational Excellence"
          score={operations}
          description="Comfort managing systems, processes, and execution."
        />

        <DNAAttribute
          title="Coachability"
          score={coachability}
          description="Willingness to follow proven systems and receive guidance."
        />

        <DNAAttribute
          title="Financial Capacity"
          score={financial}
          description="Overall financial readiness for franchise ownership."
        />

      </div>
    </Card>
  );
}

type DNAAttributeProps = {
  title: string;
  score: number;
  description: string;
};

function DNAAttribute({
  title,
  score,
  description,
}: DNAAttributeProps) {
  return (
    <section className="space-y-4">

      <div className="flex items-start justify-between gap-6">

        <div className="flex-1">

          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>

        </div>

        <div className="shrink-0 text-right">

          <div className="text-4xl font-bold tracking-tight text-blue-600">
            {score}
          </div>

        </div>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-700"
          style={{
            width: `${score}%`,
          }}
        />

      </div>

    </section>
  );
}
