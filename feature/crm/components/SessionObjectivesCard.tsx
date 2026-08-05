import { Card } from "@/feature/ui";

export type SessionObjective = {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
};

type Props = {
  objectives: SessionObjective[];
};

export function SessionObjectivesCard({
  objectives,
}: Props) {
  const completed =
    objectives.filter(
      (objective) => objective.completed,
    ).length;

  return (
    <Card
      title="Today's Objectives"
      subtitle={`${completed} of ${objectives.length} completed`}
    >
      <div className="space-y-4">

        {objectives.map((objective) => (
          <ObjectiveRow
            key={objective.id}
            objective={objective}
          />
        ))}

      </div>
    </Card>
  );
}

type ObjectiveRowProps = {
  objective: SessionObjective;
};

function ObjectiveRow({
  objective,
}: ObjectiveRowProps) {
  const priorityColor =
    objective.priority === "high"
      ? "bg-blue-600"
      : objective.priority === "medium"
        ? "bg-slate-400"
        : "bg-slate-300";

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition-all hover:border-blue-200 hover:bg-blue-50">

      <div className="flex items-center gap-4">

        <div
          className={`h-3 w-3 rounded-full ${priorityColor}`}
        />

        <div>

          <h3 className="font-semibold text-slate-900">
            {objective.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {objective.priority.charAt(0).toUpperCase()}
            {objective.priority.slice(1)} Priority
          </p>

        </div>

      </div>

      <div>

        {objective.completed ? (
          <div className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            Complete
          </div>
        ) : (
          <div className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500">
            Pending
          </div>
        )}

      </div>

    </div>
  );
}