import type { CandidateAction } from "../models/CandidateAction";

import { Button, Card } from "@/feature/ui";

type Props = {
  actions: CandidateAction[];
};

export function CandidateActionList({
  actions,
}: Props) {
  return (
    <Card
      title="Recommended Actions"
      subtitle="Prioritized by the FranGroove Intelligence Engine."
    >
      <div className="space-y-5">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
          />
        ))}
      </div>
    </Card>
  );
}

type ActionCardProps = {
  action: CandidateAction;
};

function ActionCard({
  action,
}: ActionCardProps) {
  const priority = {
    critical:
      "bg-red-100 text-red-700 border-red-200",

    high:
      "bg-blue-100 text-blue-700 border-blue-200",

    medium:
      "bg-amber-100 text-amber-700 border-amber-200",

    low:
      "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <section className="rounded-2xl border border-slate-200 p-6">

      <div className="flex items-start justify-between gap-6">

        <div className="flex-1">

          <div className="flex flex-wrap items-center gap-3">

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${priority[action.priority]}`}
            >
              {action.priority}
            </span>

            <span className="text-sm text-slate-500">
              Confidence {action.confidence}%
            </span>

            <span className="text-sm text-slate-500">
              {action.estimatedMinutes} min
            </span>

          </div>

          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            {action.title}
          </h3>

          <p className="mt-2 text-slate-600">
            {action.description}
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Why AI recommends this
            </p>

            <p className="mt-2 leading-7 text-slate-700">
              {action.reason}
            </p>

          </div>

          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Expected Outcome
            </p>

            <p className="mt-2">
              {action.recommendedOutcome}
            </p>

          </div>

          <div className="mt-5 flex flex-wrap gap-2">

            {action.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}

          </div>

        </div>

        <div className="flex flex-col gap-3">

          <Button>
            Execute
          </Button>

          <Button variant="ghost">
            Details
          </Button>

        </div>

      </div>

    </section>
  );
}
