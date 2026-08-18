import type { Candidate360State } from "../models/Candidate360State";

type Props = {
  candidate: Candidate360State;
};

export function ExecutiveSummary({
  candidate,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-200 px-8 py-6">

        <p className="text-sm font-semibold uppercase tracking-[0.30em] text-blue-600">
          AI Executive Briefing
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          Candidate Summary
        </h2>

      </div>

      <div className="p-8">

        <p className="text-lg leading-9 text-slate-700">
          {candidate.executiveSummary}
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">

          <InsightCard
            title="Strengths"
            items={[
              "Executive leadership experience",
              "Excellent financial readiness",
              "Highly coachable",
            ]}
            color="emerald"
          />

          <InsightCard
            title="Watch Items"
            items={[
              "Validate desired timeline",
              "Confirm geographic flexibility",
              "Discuss preferred financing structure (qualification is separate)",
            ]}
            color="amber"
          />

          <InsightCard
            title="Next Best Action"
            items={[
              candidate.nextBestAction,
            ]}
            color="blue"
          />

        </div>

      </div>

    </section>
  );
}

function InsightCard({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "emerald" | "amber" | "blue";
}) {
  const theme = {
    emerald: {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    amber: {
      border: "border-amber-200",
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    blue: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      text: "text-blue-700",
      dot: "bg-blue-500",
    },
  }[color];

  return (
    <div
      className={`rounded-2xl border ${theme.border} ${theme.bg} p-6`}
    >
      <h3 className={`text-lg font-bold ${theme.text}`}>
        {title}
      </h3>

      <div className="mt-5 space-y-4">

        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3"
          >
            <div
              className={`mt-2 h-2.5 w-2.5 rounded-full ${theme.dot}`}
            />

            <p className="leading-7 text-slate-700">
              {item}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}
