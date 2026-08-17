import { Button, Card } from "@/feature/ui";

type Props = {
  question: string;
  reason: string;
  confidence: number;
};

export function SuggestedQuestionCard({
  question,
  reason,
  confidence,
}: Props) {
  return (
    <Card
      title="Suggested Next Question"
      subtitle="AI recommends asking this question next based on the conversation."
    >
      <div className="space-y-8">

        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-8">

          <p className="text-xs font-semibold uppercase tracking-[0.20em] text-blue-700">
            Ask Next
          </p>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            “{question}”
          </h2>

        </div>

        <div>

          <h3 className="text-xs font-semibold uppercase tracking-[0.20em] text-slate-500">
            Why AI Chose This Question
          </h3>

          <p className="mt-4 leading-8 text-slate-700">
            {reason}
          </p>

        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-6">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Confidence
            </p>

            <div className="mt-2 text-4xl font-bold text-blue-600">
              {confidence}%
            </div>

          </div>

          <Button>
            Ask This Question
          </Button>

        </div>

      </div>
    </Card>
  );
}
