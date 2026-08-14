import { Card } from "@/feature/ui";

import type { CandidateIntelligenceState } from "@/feature/intelligence/models/CandidateIntelligenceState";

import { CandidateIntelligencePanel } from "./CandidateIntelligencePanel";

type Props = {
  candidateName: string;
  startedAt: string;
  duration: string;
  intelligence: CandidateIntelligenceState;
};

export function DiscoveryHeader({
  candidateName,
  startedAt,
  duration,
  intelligence,
}: Props) {
  return (
    <Card className="overflow-hidden rounded-3xl">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900">
        <div className="grid gap-10 p-10 xl:grid-cols-[1.7fr_0.9fr]">
          <section className="flex gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-4xl font-black text-white">
              {candidateName.charAt(0)}
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.30em] text-blue-200">
                Discovery Workspace
              </p>

              <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
                {candidateName}
              </h1>

              <div className="mt-5 flex flex-wrap gap-3">
                <Badge label="Discovery Stage" />
                <Badge label="Executive Candidate" />
                <Badge label="Ready for Brand Matching" />
              </div>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
                FranchiseReady AI continuously evaluates leadership,
                financial readiness, coachability, buying intent and
                franchise compatibility throughout Discovery.
              </p>

              <div className="mt-8 flex flex-wrap gap-8 text-sm text-blue-100">
                <span>
                  <strong>Started:</strong> {startedAt}
                </span>

                <span>
                  <strong>Duration:</strong> {duration}
                </span>
              </div>
            </div>
          </section>

          <CandidateIntelligencePanel
            intelligence={intelligence}
          />
        </div>

        <div className="border-t border-white/10 bg-black/10 px-10 py-6">
          <div className="flex flex-wrap items-center gap-8">
            <Stage complete title="Assessment" />
            <Stage active title="Discovery" />
            <Stage title="Validation" />
            <Stage title="Brand Match" />
            <Stage title="Award" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Badge({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
      {label}
    </span>
  );
}

function Stage({
  title,
  active = false,
  complete = false,
}: {
  title: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "flex h-9 w-9 items-center justify-center rounded-full font-bold",
          complete
            ? "bg-emerald-500 text-white"
            : active
            ? "bg-blue-600 text-white"
            : "bg-white/20 text-white",
        ].join(" ")}
      >
        {complete ? "✓" : active ? "●" : "○"}
      </div>

      <span className="font-medium text-white">
        {title}
      </span>
    </div>
  );
}