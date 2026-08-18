import { Card } from "@/feature/ui";

import type { DiscoveryCopilot } from "@/feature/discovery/models/DiscoveryCopilot";

type Props = {
  copilot: DiscoveryCopilot;
};

export function DiscoveryCopilot({
  copilot,
}: Props) {
  return (
    <Card
      title="Discovery Copilot"
      subtitle="Live AI guidance during discovery."
    >
      <div className="space-y-8">

        <section className="grid gap-4 md:grid-cols-2">

          <Metric
            label="Readiness"
            value={`${copilot.readiness}`}
          />

          <Metric
            label="AI Confidence"
            value={`${copilot.confidence}%`}
          />

        </section>

        <Section
          title="Live Insights"
          items={copilot.liveInsights}
        />

        <Section
          title="Buying Signals"
          items={copilot.buyingSignals}
        />

        <Section
          title="Potential Risks"
          items={copilot.risks}
        />

        <section>

          <h3 className="font-semibold text-slate-900">
            Recommended Action
          </h3>

          <div className="mt-3 rounded-xl bg-emerald-50 p-5 text-emerald-900">
            {copilot.nextAction}
          </div>

        </section>

      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section>

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <ul className="mt-3 space-y-2">

        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg bg-slate-50 px-4 py-3 text-slate-700"
          >
            • {item}
          </li>
        ))}

      </ul>

    </section>
  );
}
