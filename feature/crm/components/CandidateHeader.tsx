import type { CandidateRecord } from "../models/CandidateRecord";

type Props = {
  candidate: CandidateRecord;
};

export function CandidateHeader({
  candidate,
}: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Candidate Workspace
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            {candidate.firstName} {candidate.lastName}
          </h1>

          <p className="mt-2 text-gray-600">
            {candidate.pipelineStage}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">
            Health Score
          </p>

          <p className="text-5xl font-bold text-blue-600">
            {candidate.healthScore}
          </p>
        </div>
      </div>
    </section>
  );
}