import { Button, Card } from "@/feature/ui";

type Props = {
  executiveSummary: string;
  recommendedApproach: string;
  objectives: string[];
  openingQuestions: string[];
  nextActions: string[];
};

export function ConsultantBriefPanel({
  executiveSummary,
  recommendedApproach,
  objectives,
  openingQuestions,
  nextActions,
}: Props) {
  return (
    <Card
      title="AI Consultant Brief"
      subtitle="Executive preparation generated before the discovery meeting."
    >
      <div className="space-y-10">

        <section className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            Executive Summary
          </p>

          <p className="mt-4 leading-8 text-slate-700">
            {executiveSummary}
          </p>

        </section>

        <section>

          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Recommended Discovery Strategy
          </h3>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-6">

            <p className="leading-8 text-slate-700">
              {recommendedApproach}
            </p>

          </div>

        </section>

        <div className="grid gap-8 lg:grid-cols-3">

          <BriefList
            title="Discovery Objectives"
            color="emerald"
            items={objectives}
          />

          <BriefList
            title="Opening Questions"
            color="blue"
            items={openingQuestions}
          />

          <BriefList
            title="Next Actions"
            color="amber"
            items={nextActions}
          />

        </div>

        <div className="flex flex-wrap gap-4">

          <Button>
            Generate PDF Brief
          </Button>

          <Button variant="secondary">
            Email Consultant
          </Button>

          <Button variant="ghost">
            Copy Summary
          </Button>

        </div>

      </div>
    </Card>
  );
}

type BriefListProps = {
  title: string;
  items: string[];
  color: "emerald" | "blue" | "amber";
};

function BriefList({
  title,
  items,
  color,
}: BriefListProps) {
  const styles = {
    emerald: {
      header: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
    },
    blue: {
      header: "text-blue-700",
      badge: "bg-blue-100 text-blue-700",
    },
    amber: {
      header: "text-amber-700",
      badge: "bg-amber-100 text-amber-700",
    },
  } as const;

  const style = styles[color];

  return (
    <section>

      <h3
        className={`text-sm font-semibold uppercase tracking-[0.18em] ${style.header}`}
      >
        {title}
      </h3>

      <div className="mt-5 space-y-3">

        {items.map((item, index) => (
          <div
            key={item}
            className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"
          >

            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${style.badge}`}
            >
              {index + 1}
            </div>

            <p className="leading-7 text-slate-700">
              {item}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}