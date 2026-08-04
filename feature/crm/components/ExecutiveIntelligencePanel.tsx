import { Card } from "@/feature/ui";

type Props = {
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendation: string;
  confidence: number;
};

export function ExecutiveIntelligencePanel({
  summary,
  strengths,
  concerns,
  recommendation,
  confidence,
}: Props) {
  return (
    <Card
      title="Executive Intelligence"
      subtitle="AI-generated executive assessment of franchise ownership potential."
    >
      <div className="space-y-10">

        <section>

          <p className="text-xs font-semibold uppercase tracking-[0.20em] text-slate-500">
            Overall Assessment
          </p>

          <p className="mt-5 leading-8 text-slate-700">
            {summary}
          </p>

        </section>

        <div className="grid gap-10 lg:grid-cols-2">

          <IntelligenceList
            title="Key Strengths"
            items={strengths}
          />

          <IntelligenceList
            title="Discovery Priorities"
            items={concerns}
          />

        </div>

        <section className="rounded-3xl border border-blue-200 bg-blue-50 p-8">

          <div className="flex items-start justify-between gap-8">

            <div className="flex-1">

              <p className="text-xs font-semibold uppercase tracking-[0.20em] text-blue-700">
                AI Recommendation
              </p>

              <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                {recommendation}
              </h3>

            </div>

            <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-sm">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Confidence
              </p>

              <div className="mt-2 text-4xl font-bold text-blue-600">
                {confidence}%
              </div>

            </div>

          </div>

        </section>

      </div>
    </Card>
  );
}

type IntelligenceListProps = {
  title: string;
  items: string[];
};

function IntelligenceList({
  title,
  items,
}: IntelligenceListProps) {
  return (
    <section>

      <h3 className="text-sm font-semibold uppercase tracking-[0.20em] text-blue-700">
        {title}
      </h3>

      <div className="mt-6 space-y-4">

        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-600" />

            <p className="leading-7 text-slate-700">
              {item}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}