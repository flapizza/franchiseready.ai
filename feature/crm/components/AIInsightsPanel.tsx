import type { AIInsight } from "@/feature/discovery/models/AIInsight";

import { Card } from "@/feature/ui";

type Props = {
  insights: AIInsight[];
};

export function AIInsightsPanel({
  insights,
}: Props) {
  return (
    <Card
      title="Live AI Insights"
      subtitle="Real-time coaching generated from the Discovery Runtime."
    >
      <div className="space-y-5">

        {insights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
          />
        ))}

      </div>
    </Card>
  );
}

type InsightCardProps = {
  insight: AIInsight;
};

function InsightCard({
  insight,
}: InsightCardProps) {
  const priorityStyles = {
    high: {
      badge: "bg-blue-600 text-white",
      border: "border-blue-200",
      background: "bg-blue-50",
    },
    medium: {
      badge: "bg-slate-700 text-white",
      border: "border-slate-200",
      background: "bg-slate-50",
    },
    low: {
      badge: "bg-slate-500 text-white",
      border: "border-slate-200",
      background: "bg-white",
    },
  } as const;

  const style =
    priorityStyles[insight.priority];

  return (
    <section
      className={`rounded-3xl border p-6 transition-all duration-300 hover:shadow-md ${style.border} ${style.background}`}
    >
      <div className="flex items-start justify-between gap-6">

        <div className="flex-1">

          <div className="flex items-center gap-3">

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${style.badge}`}
            >
              {insight.priority}
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {insight.category}
            </span>

          </div>

          <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
            {insight.title}
          </h3>

          <p className="mt-3 leading-7 text-slate-700">
            {insight.description}
          </p>

          <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-4">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Recommendation
            </p>

            <p className="mt-2 leading-7 text-slate-700">
              {insight.recommendation}
            </p>

          </div>

        </div>

        <div className="shrink-0 rounded-2xl bg-white px-5 py-4 text-center shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Confidence
          </p>

          <div className="mt-2 text-3xl font-bold text-blue-600">
            {insight.confidence}%
          </div>

        </div>

      </div>

    </section>
  );
}