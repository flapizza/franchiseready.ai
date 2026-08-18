import { Candidate360Runtime } from "../runtime/Candidate360Runtime";
import { notFound } from "next/navigation";

import { CandidateHeader } from "./CandidateHeader";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { ReadinessScorecard } from "./ReadinessScorecard";
import { CandidateRelationshipOverview } from "./CandidateRelationshipOverview";
import { CandidateActivityTimeline } from "./CandidateActivityTimeline";
import { CandidateEmailPanel } from "@/feature/communications/components/CandidateEmailPanel";

type Props = {
  candidateId: string;
};

export async function Candidate360Page({
  candidateId,
}: Props) {
  const runtime = new Candidate360Runtime();

  const candidate = await runtime.load(candidateId);

  if (!candidate) {
    notFound();
  }

  return (
    <div className="space-y-8">

      <CandidateHeader
        candidate={candidate}
      />

      <CandidateRelationshipOverview candidate={candidate} />

      {candidate.hasIntelligence && <ExecutiveSummary
        candidate={candidate}
      />}

      {candidate.hasIntelligence && <ReadinessScorecard
        candidate={candidate}
      />}

      <CandidateEmailPanel candidateId={candidate.id} candidateName={candidate.fullName} candidateEmail={candidate.email} sender={candidate.consultantSender} messages={candidate.emails} />

      <CandidateActivityTimeline candidate={candidate} />

    </div>
  );
}
