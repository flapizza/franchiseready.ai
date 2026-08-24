import type { Candidate360State } from "../models/Candidate360State";
import { CandidateStageControl } from "@/feature/pipeline/components/CandidateStageControl";

type Props = {
  candidate: Candidate360State;
};

export function CandidateHeader({
  candidate,
}: Props) {
  return (
    <section data-candidate-hero className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 shadow-xl">

      <div className={candidate.rootOnly ? "p-10" : "p-6 lg:p-8"}>

        <div className={`flex flex-wrap justify-between ${candidate.rootOnly ? "items-start gap-10" : "items-end gap-6"}`}>

          <div>

            {!candidate.rootOnly && <CandidateStageControl candidateId={candidate.id} currentStageId={candidate.currentStageId} stages={candidate.pipelineStages} />}

            <div className="inline-flex items-center gap-3 rounded-full bg-emerald-500/10 px-4 py-2">

              <div className="h-3 w-3 rounded-full bg-emerald-400" />

              <span className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-300">
                {candidate.currentStage}
              </span>

            </div>
            <h1 className={`${candidate.rootOnly ? "mt-7 text-5xl" : "mt-5 text-4xl"} font-black tracking-tight text-white`}>
              {candidate.fullName}
            </h1>

            <p className={`${candidate.rootOnly ? "mt-5 text-lg leading-8" : "mt-3 text-base leading-7"} max-w-3xl text-slate-300`}>
              {candidate.executiveSummary}
            </p>

          </div>

          {candidate.hasIntelligence && <div className="grid gap-3 sm:grid-cols-2">

            <ScoreCard
              label="Buying Confidence"
              value={candidate.buyingConfidence}
              color="emerald"
              compact={!candidate.rootOnly}
            />

            <ScoreCard
              label="Candidate Readiness"
              value={candidate.recommendationConfidence}
              color="blue"
              compact={!candidate.rootOnly}
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
  compact,
}: {
  label: string;
  value: number | null;
  color: "emerald" | "blue";
  compact: boolean;
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
      className={`${compact ? "min-w-[180px] px-5 py-4" : "min-w-[220px] p-6"} rounded-2xl border ${theme.ring} ${theme.background} backdrop-blur`}
    >
      <div className={`text-sm font-semibold uppercase tracking-widest ${theme.text}`}>
        {label}
      </div>

      <div className={`${compact ? "mt-2 text-4xl" : "mt-4 text-6xl"} font-black ${theme.value}`}>
        {value ?? "—"}{value === null ? "" : "%"}
      </div>
    </div>
  );
}
