import { Candidate360Runtime } from "../runtime/Candidate360Runtime";

import { CandidateHeader } from "./CandidateHeader";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { ReadinessScorecard } from "./ReadinessScorecard";

type Props = {
  candidateId: string;
};

export function Candidate360Page({
  candidateId,
}: Props) {
  const runtime = new Candidate360Runtime();

  const candidate = runtime.load(candidateId);

  return (
    <div className="space-y-8">

      <CandidateHeader
        candidate={candidate}
      />

      <ExecutiveSummary
        candidate={candidate}
      />

      <ReadinessScorecard
        candidate={candidate}
      />

    </div>
  );
}