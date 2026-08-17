import { Card } from "@/feature/ui";

export type AIInsight = {
  id: string;
  category: string;
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  priority: "high" | "medium" | "low";
};

type Props = {
  insights: AIInsight[];
};

export function AIInsightsPanel({
  insights,
}: Props) {
  const highest =
    insights.find((i) => i.priority === "high") ??
    insights[0];

  return (
    <Card
      title="AI Discovery Copilot"
      subtitle="Live coaching powered by the Discovery Intelligence Engine."
    >
      <div className="space-y-8">

        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.20em] text-emerald-700">
                Live Status
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                AI is Monitoring the Conversation
              </h3>

            </div>

            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm">

              <div className="h-3 w-3 rounded-full bg-emerald-500" />

              <span className="font-semibold text-emerald-700">
                Listening
              </span>

            </div>

          </div>

        </section>

        {highest && (
          <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.20em] text-blue-700">
              Highest Priority Insight
            </p>

            <h3 className="mt-3 text-2xl font-bold text-slate-900">
              {highest.title}
            </h3>

            <p className="mt-4 leading-7 text-slate-700">
              {highest.description}
            </p>

            <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                AI Recommendation
              </p>

              <p className="mt-2 leading-7 text-slate-700">
                {highest.recommendation}
              </p>

            </div>

          </section>
        )}

        <section>

          <div className="flex items-center justify-between">

            <h3 className="text-lg font-bold text-slate-900">
              Live Intelligence Feed
            </h3>

            <span className="text-sm font-semibold text-blue-600">
              {insights.length} Active Insights
            </span>

          </div>

          <div className="mt-5 space-y-4">

            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
              />
            ))}

          </div>

        </section>
                <section className="grid gap-6">

          <InfoCard
            title="Next Best Question"
            accent="blue"
          >
            <p className="text-lg font-semibold text-slate-900">
              “What concerns you most about leaving your corporate career?”
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              The candidate has expressed strong ownership motivation but
              has not discussed emotional barriers to making the transition.
              Exploring this topic will improve confidence in the
              recommendation.
            </p>
          </InfoCard>

          <InfoCard
            title="Buying Signal"
            accent="emerald"
          >
            <div className="flex items-center justify-between">

              <div>

                <h4 className="text-3xl font-black text-emerald-700">
                  Strong
                </h4>

                <p className="mt-2 text-slate-600">
                  AI detected multiple ownership buying signals during
                  this conversation.
                </p>

              </div>

              <div className="text-right">

                <div className="text-5xl font-black text-emerald-700">
                  ★★★★☆
                </div>

                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Signal Strength
                </p>

              </div>

            </div>
          </InfoCard>

          <InfoCard
            title="Missed Opportunity"
            accent="amber"
          >
            <p className="font-semibold text-slate-900">
              Candidate mentioned leading large teams.
            </p>

            <p className="mt-3 leading-7 text-slate-600">
              Consider asking:
            </p>

            <blockquote className="mt-4 rounded-2xl border-l-4 border-amber-400 bg-white p-4 italic text-slate-700">
              “Tell me about the management style that has been most
              successful for you.”
            </blockquote>

          </InfoCard>

        </section>

        <footer className="rounded-3xl bg-slate-900 px-6 py-5 text-center">

          <div className="flex items-center justify-center gap-3">

            <div className="h-3 w-3 rounded-full bg-emerald-400" />

            <p className="font-semibold text-white">
              AI Discovery Copilot is actively monitoring the conversation
            </p>

          </div>

        </footer>

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
  const colors = {
    high: {
      border: "border-red-200",
      bg: "bg-red-50",
      badge: "bg-red-600 text-white",
    },
    medium: {
      border: "border-amber-200",
      bg: "bg-amber-50",
      badge: "bg-amber-500 text-white",
    },
    low: {
      border: "border-slate-200",
      bg: "bg-slate-50",
      badge: "bg-slate-600 text-white",
    },
  } as const;

  const style = colors[insight.priority];

  return (
    <section
      className={`rounded-2xl border p-5 ${style.border} ${style.bg}`}
    >
      <div className="flex items-start justify-between gap-4">

        <div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style.badge}`}
          >
            {insight.priority}
          </span>

          <h4 className="mt-4 text-lg font-bold text-slate-900">
            {insight.title}
          </h4>

          <p className="mt-3 leading-7 text-slate-600">
            {insight.description}
          </p>

        </div>

        <div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm">

          <div className="text-2xl font-black text-blue-700">
            {insight.confidence}%
          </div>

          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Confidence
          </p>

        </div>

      </div>

    </section>
  );
}

type InfoCardProps = {
  title: string;
  accent: "blue" | "emerald" | "amber";
  children: React.ReactNode;
};

function InfoCard({
  title,
  accent,
  children,
}: InfoCardProps) {
  const accentClass = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  }[accent];

  return (
    <section
      className={`rounded-3xl border p-6 ${accentClass}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.20em]">
        {title}
      </p>

      <div className="mt-5 text-slate-700">
        {children}
      </div>

    </section>
  );
}
