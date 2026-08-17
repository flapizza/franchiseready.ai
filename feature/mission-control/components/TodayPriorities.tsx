import { ArrowRight, Clock3 } from "lucide-react";

export type PriorityLevel =
  | "critical"
  | "high"
  | "normal";

export interface TodayPriority {
  id: string;

  candidate: string;

  recommendation: string;

  reason: string;

  action: string;

  priority: PriorityLevel;
}

type Props = {
  items: TodayPriority[];
};

const priorityStyles = {
  critical:
    "border-rose-200 bg-rose-50",

  high:
    "border-amber-200 bg-amber-50",

  normal:
    "border-slate-200 bg-white",
};

const badgeStyles = {
  critical:
    "bg-rose-600 text-white",

  high:
    "bg-amber-500 text-white",

  normal:
    "bg-slate-200 text-slate-700",
};

export function TodayPriorities({
  items,
}: Props) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-8">

        <div className="flex items-center justify-between">

          <div>

            <div className="text-sm font-semibold uppercase tracking-[0.20em] text-teal-600">
              Today’s AI Priorities
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Focus Here First
            </h2>

          </div>

          <div className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-700">
            {items.length} Active
          </div>

        </div>

      </div>

      <div className="divide-y divide-slate-100">

        {items.map((item) => (
          <div
            key={item.id}
            className={`p-8 transition hover:bg-slate-50 ${priorityStyles[item.priority]}`}
          >

            <div className="flex items-start justify-between gap-8">

              <div className="flex-1">

                <div className="flex items-center gap-4">

                  <div
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${badgeStyles[item.priority]}`}
                  >
                    {item.priority}
                  </div>

                  <div className="text-2xl font-bold">
                    {item.candidate}
                  </div>

                </div>

                <div className="mt-5 text-xl font-semibold text-slate-900">
                  {item.recommendation}
                </div>

                <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                  {item.reason}
                </p>

              </div>

              <div className="w-64">

                <button
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 font-semibold text-white transition hover:bg-teal-700"
                >

                  {item.action}

                  <ArrowRight className="h-5 w-5" />

                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">

                  <Clock3 className="h-4 w-4" />

                  Estimated 15 minutes

                </div>

              </div>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}
