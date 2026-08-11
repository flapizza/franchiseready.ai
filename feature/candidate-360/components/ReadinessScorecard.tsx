import type { Candidate360State } from "../models/Candidate360State";

type Props = {
  candidate: Candidate360State;
};

export function ReadinessScorecard({
  candidate,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-semibold uppercase tracking-[0.30em] text-blue-600">
            Executive Assessment
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
            Franchise Readiness
          </h2>

        </div>

        <div className="rounded-2xl bg-blue-600 px-6 py-4 text-center">

          <div className="text-4xl font-black text-white">
            {candidate.readinessScore}
          </div>

          <div className="text-xs font-semibold uppercase tracking-widest text-blue-100">
            Overall
          </div>

        </div>

      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">

        <ScoreBar
          label="Financial Readiness"
          score={candidate.financialReadiness}
        />

        <ScoreBar
          label="Leadership"
          score={candidate.leadershipReadiness}
        />

        <ScoreBar
          label="Lifestyle Alignment"
          score={candidate.lifestyleAlignment}
        />

        <ScoreBar
          label="Coachability"
          score={candidate.coachability}
        />

      </div>

    </section>
  );
}

function ScoreBar({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const color =
    score >= 90
      ? "bg-emerald-500"
      : score >= 75
      ? "bg-blue-500"
      : score >= 60
      ? "bg-amber-500"
      : "bg-red-500";

  const status =
    score >= 90
      ? "Exceptional"
      : score >= 75
      ? "Strong"
      : score >= 60
      ? "Developing"
      : "Needs Attention";

  return (
    <div>

      <div className="flex items-center justify-between">

        <span className="font-semibold text-slate-900">
          {label}
        </span>

        <span className="text-sm font-bold text-slate-600">
          {score}%
        </span>

      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">

        <div
          className={`${color} h-full rounded-full transition-all`}
          style={{ width: `${score}%` }}
        />

      </div>

      <div className="mt-2 text-sm text-slate-500">
        {status}
      </div>

    </div>
  );
}