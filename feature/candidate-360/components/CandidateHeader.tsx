import type { Candidate360State } from "../models/Candidate360State";
import { CandidateStageControl } from "@/feature/pipeline/components/CandidateStageControl";

type Props = {
  candidate: Candidate360State;
};

export function CandidateHeader({
  candidate,
}: Props) {
  return (
    <section data-candidate-hero className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 shadow-2xl">

      <div className="p-10">

        <div className="flex flex-wrap items-start justify-between gap-10">

          <div>

            <CandidateStageControl candidateId={candidate.id} currentStageId={candidate.currentStageId} stages={candidate.pipelineStages} />

            <div className="inline-flex items-center gap-3 rounded-full bg-emerald-500/10 px-4 py-2">

              <div className="h-3 w-3 rounded-full bg-emerald-400" />

              <span className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-300">
                {candidate.currentStage}
              </span>

            </div>
            <h1 className="mt-7 text-5xl font-black tracking-tight text-white">
              {candidate.fullName}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              {candidate.executiveSummary}
            </p>

          </div>

          {candidate.hasIntelligence && <div className="grid gap-5 sm:grid-cols-2">

            <ScoreCard
              label="Buying Confidence"
              value={candidate.buyingConfidence}
              color="emerald"
            />

            <ScoreCard
              label="Candidate Readiness"
              value={candidate.recommendationConfidence}
              color="blue"
            />

          </div>}

        </div>

      </div>

    </section>
  );
}

function ScoreCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: "emerald" | "blue";
}) {
  const colors = {
    emerald: {
      ring: "border-emerald-400/20",
      background: "bg-emerald-500/10",
      text: "text-emerald-300",
      value: "text-emerald-400",
    },
    blue: {
      ring: "border-blue-400/20",
      background: "bg-blue-500/10",
      text: "text-blue-300",
      value: "text-blue-400",
    },
  };

  const theme = colors[color];

  return (
    <div
      className={`min-w-[220px] rounded-2xl border ${theme.ring} ${theme.background} p-6 backdrop-blur`}
    >
      <div className={`text-sm font-semibold uppercase tracking-widest ${theme.text}`}>
        {label}
      </div>

      <div className={`mt-4 text-6xl font-black ${theme.value}`}>
        {value ?? "—"}{value === null ? "" : "%"}
      </div>
    </div>
  );
}
