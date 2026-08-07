import type { AIReasoning } from "@/feature/intelligence/models/AIReasoning";

type Props = {
  reasoning: AIReasoning;
};

export function AIReasoningCard({
  reasoning,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-bold">
        Why the AI Recommends This
      </h2>

      <p className="mt-4 text-slate-700">
        {reasoning.conclusion}
      </p>

      <div className="mt-6 text-5xl font-black text-blue-600">
        {reasoning.confidence}%
      </div>

      <Section
        title="Evidence"
        items={reasoning.evidence}
      />

      <Section
        title="Remaining Unknowns"
        items={reasoning.unknowns}
      />

      <Section
        title="What Would Increase Confidence?"
        items={reasoning.increasesConfidence}
      />

      <Section
        title="What Would Reduce Confidence?"
        items={reasoning.decreasesConfidence}
      />

    </section>
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
    <div className="mt-8">

      <h3 className="font-semibold">
        {title}
      </h3>

      <ul className="mt-3 space-y-2">

        {items.map((item) => (
          <li key={item}>
            • {item}
          </li>
        ))}

      </ul>

    </div>
  );
}