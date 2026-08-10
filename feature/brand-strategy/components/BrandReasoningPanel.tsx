import type {
  BrandReasoning,
} from "../models/BrandReasoning";

type Props = {
  reasoning: BrandReasoning;
};

export function BrandReasoningPanel({
  reasoning,
}: Props) {
  return (
    <section className="rounded-3xl border bg-white p-8 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm uppercase tracking-[0.25em] text-blue-600">
            AI Reasoning
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Why this recommendation?
          </h2>

        </div>

        <div className="text-right">

          <div className="text-5xl font-black text-emerald-600">
            {reasoning.confidence}%
          </div>

          <div className="text-sm uppercase tracking-[0.20em] text-slate-500">
            Confidence
          </div>

        </div>

      </div>

      <p className="mt-6 max-w-3xl leading-7 text-slate-600">
        {reasoning.summary}
      </p>

      <div className="mt-8 space-y-4">

        {reasoning.factors.map((factor) => (
          <div
            key={factor.id}
            className="rounded-2xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between">

              <div>

                <div className="font-bold">
                  {factor.title}
                </div>

                <div className="mt-1 text-sm uppercase tracking-wide text-slate-500">
                  {factor.category}
                </div>

              </div>

              <div className="text-right">

                <div className="text-2xl font-black text-blue-700">
                  {factor.impact > 0 ? "+" : ""}
                  {factor.impact}
                </div>

                <div className="text-xs uppercase text-slate-500">
                  Impact
                </div>

              </div>

            </div>

            <p className="mt-4 leading-7 text-slate-600">
              {factor.explanation}
            </p>

            <div className="mt-4 h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{
                  width: `${factor.confidence}%`,
                }}
              />
            </div>

            <div className="mt-2 text-sm text-slate-500">
              Evidence Confidence: {factor.confidence}%
            </div>

          </div>
        ))}

      </div>

    </section>
  );
}