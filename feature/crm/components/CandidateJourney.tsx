import { Card } from "@/feature/ui";

export type JourneyStepStatus =
  | "complete"
  | "current"
  | "upcoming";

export interface JourneyStep {
  id: string;
  title: string;
  description: string;
  status: JourneyStepStatus;
}

type Props = {
  steps: JourneyStep[];
};

export function CandidateJourney({
  steps,
}: Props) {
  return (
    <Card
      title="Candidate Journey"
      subtitle="Where this candidate is today and what comes next."
    >
      <div className="space-y-5">
        {steps.map((step) => (
          <JourneyItem
            key={step.id}
            step={step}
          />
        ))}
      </div>
    </Card>
  );
}

function JourneyItem({
  step,
}: {
  step: JourneyStep;
}) {
  const styles = {
    complete: {
      badge: "bg-emerald-100 text-emerald-700",
      border: "border-emerald-200",
    },
    current: {
      badge: "bg-blue-100 text-blue-700",
      border: "border-blue-200",
    },
    upcoming: {
      badge: "bg-slate-100 text-slate-600",
      border: "border-slate-200",
    },
  } as const;

  const style = styles[step.status];

  return (
    <div
      className={`rounded-2xl border p-5 ${style.border}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">
          {step.title}
        </h3>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${style.badge}`}
        >
          {step.status}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {step.description}
      </p>
    </div>
  );
}