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
      subtitle="Your personalized briefing before speaking with this candidate."
    >
      <div className="space-y-8">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Today's Objective
          </h3>

          <p className="mt-2 text-xl font-semibold text-slate-900">
            {objective}
          </p>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Conversation Strategy
          </h3>

          <p className="mt-3 leading-7 text-slate-700">
            {strategy}
          </p>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Recommended Questions
          </h3>

          <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-700">
            {questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </section>

        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Likely Concern
          </h3>

          <p className="mt-2">
            {concern}
          </p>
        </section>

        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Suggested Response
          </h3>

          <p className="mt-2 leading-7">
            {response}
          </p>
        </section>

        <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-6 text-white">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Recommended Next Step
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              {nextAction}
            </h3>

            <p className="mt-2 text-slate-300">
              AI Confidence: {confidence}%
            </p>
          </div>

          <Button>
            Start Discovery
          </Button>
        </div>
      </div>
    </Card>
  );
}