type Props = {
  recommendation: string;
  confidence: number;
  awardProbability: number;
  momentum: "Low" | "Moderate" | "High";

  buyingSignals: string[];
  risks: string[];

  suggestedQuestion: string;

  nextStep: string;
};

export function AICopilotPanel({
  recommendation,
  confidence,
  awardProbability,
  momentum,
  buyingSignals,
  risks,
  suggestedQuestion,
  nextStep,
}: Props) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 px-6 py-5">

        <p className="text-xs font-semibold uppercase tracking-[0.20em] text-blue-600">
          AI Copilot
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Next Best Action
        </h2>

      </div>

      <div className="space-y-8 p-6">

        <Section
          title="Recommendation"
        >
          <p className="font-semibold text-slate-900">
            {recommendation}
          </p>
        </Section>

        <div className="grid grid-cols-2 gap-4">

          <Metric
            label="Confidence"
            value={`${confidence}%`}
          />

          <Metric
            label="Award"
            value={`${awardProbability}%`}
          />

        </div>

        <Section title="Momentum">

          <span
            className={
              momentum === "High"
                ? "font-bold text-emerald-600"
                : momentum === "Moderate"
                ? "font-bold text-amber-600"
                : "font-bold text-red-600"
            }
          >
            {momentum}
          </span>

        </Section>

        <Section title="Buying Signals">

          <ul className="space-y-2">

            {buyingSignals.map((signal) => (
              <li
                key={signal}
                className="flex gap-2"
              >
                <span className="text-emerald-600">
                  ✓
                </span>

                <span>{signal}</span>

              </li>
            ))}

          </ul>

        </Section>

        <Section title="Risks">

          <ul className="space-y-2">

            {risks.map((risk) => (
              <li
                key={risk}
                className="flex gap-2"
              >
                <span className="text-amber-600">
                  •
                </span>

                <span>{risk}</span>

              </li>
            ))}

          </ul>

        </Section>

        <Section title="Suggested Question">

          <blockquote className="rounded-xl bg-slate-50 p-4 italic text-slate-700">
            "{suggestedQuestion}"
          </blockquote>

        </Section>

        <Section title="Next Step">

          <button className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
            {nextStep}
          </button>

        </Section>

      </div>

    </aside>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({
  title,
  children,
}: SectionProps) {
  return (
    <section>

      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>

      {children}

    </section>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({
  label,
  value,
}: MetricProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-blue-600">
        {value}
      </p>

    </div>
  );
}