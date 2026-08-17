import Link from "next/link";

import type { RecommendedActionState } from "../models/MissionControlState";

const toneStyles = {
  emerald: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-300",
  },
  amber: {
    dot: "bg-amber-400",
    badge: "bg-amber-500/15 text-amber-300",
  },
  blue: {
    dot: "bg-blue-400",
    badge: "bg-blue-500/15 text-blue-300",
  },
};

type Props = {
  actions: RecommendedActionState[];
};

export function AICommandCenter({ actions }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-lg">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 px-7 py-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">
            FranGroove Intelligence
          </p>
          <h2 className="mt-2 text-2xl font-black">
            AI Recommended Actions
          </h2>
        </div>
        <p className="max-w-xl text-sm text-slate-400">
          Highest-value moves selected from candidate momentum, lifecycle, and readiness.
        </p>
      </div>

      <div className="grid gap-px bg-slate-800 lg:grid-cols-3">
        {actions.map((action) => {
          const styles = toneStyles[action.tone];

          return (
            <article key={action.id} className="bg-slate-950 p-6">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles.badge}`}>
                  {action.signal}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">
                {action.candidateName}
              </h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
                {action.recommendation}
              </p>
              {action.action.href ? (
                <Link
                  href={action.action.href}
                  className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500"
                >
                  {action.action.label}
                </Link>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
