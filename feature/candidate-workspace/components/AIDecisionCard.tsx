import type { CandidateDecision } from "@/feature/decision-engine/models/CandidateDecision";

type Props = {
  decision: CandidateDecision;
};

export function AIDecisionCard({
  decision,
}: Props) {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <div className="text-sm font-semibold uppercase tracking-[0.20em] text-emerald-600">
            AI Recommendation
          </div>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {decision.recommendation}
          </h2>

          <p className="mt-3 text-slate-600">
            Confidence {decision.confidence}%
          </p>

        </div>

        <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
          {decision.referralReadiness.status}
        </div>

      </div>

      <div className="mt-8">

        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Next Best Action
        </h3>

        <div className="mt-3 rounded-2xl bg-slate-50 p-5">

          <div className="font-semibold text-slate-900">
            {decision.nextBestAction.title}
          </div>

          <div className="mt-2 text-sm leading-6 text-slate-600">
            {decision.nextBestAction.description}
          </div>

        </div>

      </div>

      <div className="mt-8">

        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Why FranGroove AI Recommends This
        </h3>

        <div className="mt-4 space-y-3">

          {decision.evidence.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-slate-200 p-4"
            >
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />

              <div>

                <div className="font-semibold text-slate-900">
                  {item.title}
                </div>

                <div className="mt-1 text-sm leading-6 text-slate-600">
                  {item.explanation}
                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

      {decision.unresolvedQuestions.length > 0 && (
        <div className="mt-8">

          <h3 className="text-sm font-bold uppercase tracking-wide text-amber-600">
            Outstanding Discovery Items
          </h3>

          <ul className="mt-3 space-y-2">

            {decision.unresolvedQuestions.map((question) => (
              <li
                key={question}
                className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                {question}
              </li>
            ))}

          </ul>

        </div>
      )}

    </section>
  );
}