import type { AIConfidence } from "@/feature/intelligence/models/AIConfidence";

type Props = {
  confidence: AIConfidence;
};

export function AIConfidenceCard({
  confidence,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-bold">
        AI Confidence
      </h2>

      <div className="mt-6 flex items-end justify-between">

        <div>

          <div className="text-6xl font-black text-blue-600">
            {confidence.overall}%
          </div>

          <div className="mt-2 text-sm text-emerald-600">

            {confidence.trend === "up"
              ? `▲ +${confidence.overall - confidence.previous}%`
              : confidence.trend === "down"
              ? `▼ ${confidence.previous - confidence.overall}%`
              : "No Change"}

          </div>

        </div>

        <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm">
          Predicted {confidence.predictedConfidence}%
        </div>

      </div>

      <div className="mt-8">

        <h3 className="font-semibold">
          Evidence
        </h3>

        <ul className="mt-3 space-y-2">

          {confidence.evidence.map((item) => (
            <li key={item}>
              ✓ {item}
            </li>
          ))}

        </ul>

      </div>

      <div className="mt-8">

        <h3 className="font-semibold">
          Remaining Uncertainty
        </h3>

        <ul className="mt-3 space-y-2">

          {confidence.uncertainty.map((item) => (
            <li key={item}>
              • {item}
            </li>
          ))}

        </ul>

      </div>

    </section>
  );
}