import { Button, Card } from "@/feature/ui";

type Props = {
  objective: string;
  strategy: string;
  questions: string[];
  concern: string;
  response: string;
  nextAction: string;
  confidence: number;
};

export function AIMeetingCoach({
  objective,
  strategy,
  questions,
  concern,
  response,
  nextAction,
  confidence,
}: Props) {
  return (
    <Card
      title="AI Meeting Coach"
      subtitle="Real-time guidance generated from the candidate's FranchiseReady Intelligence Profile."
    >
      <div className="space-y-8">

        <section className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">

          <div className="flex items-start justify-between gap-6">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Meeting Objective
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                {objective}
              </h2>

            </div>

            <div className="rounded-2xl bg-white px-5 py-4 text-center shadow-sm">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                AI Confidence
              </p>

              <p className="mt-2 text-4xl font-bold text-blue-600">
                {confidence}%
              </p>

            </div>

          </div>

        </section>

        <section>

          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Recommended Conversation Strategy
          </h3>

          <p className="mt-4 leading-8 text-slate-700">
            {strategy}
          </p>

        </section>

        <section>

          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            AI Suggested Questions
          </h3>

          <div className="mt-5 space-y-4">

            {questions.map((question, index) => (
              <div
                key={question}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {index + 1}
                </div>

                <p className="leading-7 text-slate-700">
                  {question}
                </p>

              </div>
            ))}

          </div>

        </section>

        <div className="grid gap-6 lg:grid-cols-2">

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Likely Objection
            </p>

            <p className="mt-4 leading-7 text-slate-700">
              {concern}
            </p>

          </section>

          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              AI Recommended Response
            </p>

            <p className="mt-4 leading-7 text-slate-700">
              {response}
            </p>

          </section>

        </div>

        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-8 text-white">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                Recommended Next Action
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                {nextAction}
              </h2>

              <p className="mt-3 max-w-2xl text-slate-300">
                Complete this action while the candidate’s engagement level is
                high. The Intelligence Engine predicts the greatest probability
                of forward momentum immediately following discovery.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <Button>
                Start Discovery
              </Button>

              <Button variant="secondary">
                Generate Brief
              </Button>

            </div>

          </div>

        </section>

      </div>
    </Card>
  );
}
