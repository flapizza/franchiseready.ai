import Link from "next/link";

import type { CandidateRecord } from "../models/CandidateRecord";

type Props = {
  candidate: CandidateRecord;
  reason: string;
};

export function PriorityCard({
  candidate,
  reason,
}: Props) {
  return (
    <Link
      href={`/crm/${candidate.id}`}
      className="block rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Needs Attention
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {candidate.firstName} {candidate.lastName}
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            {candidate.pipelineStage}
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold text-amber-700">
            {candidate.healthScore}
          </p>

          <p className="text-xs text-gray-500">
            Health
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-white p-3 text-sm leading-6 text-gray-700">
        {reason}
      </div>
    </Link>
  );
}