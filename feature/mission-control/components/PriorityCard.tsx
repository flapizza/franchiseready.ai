type Props = {
  title: string;
  description: string;
  action: string;
  priority: "critical" | "high" | "normal";
};

export function PriorityCard({
  title,
  description,
  action,
  priority,
}: Props) {
  const borderColor =
    priority === "critical"
      ? "border-red-500"
      : priority === "high"
      ? "border-amber-500"
      : "border-blue-500";

  return (
    <article
      className={`rounded-3xl border-l-4 ${borderColor} bg-white p-7 shadow-sm`}
    >
      <h3 className="text-xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-slate-600">
        {description}
      </p>

      <div className="mt-6 rounded-2xl bg-slate-100 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Recommended Action
        </div>

        <div className="mt-2 font-semibold text-slate-900">
          {action}
        </div>
      </div>
    </article>
  );
}