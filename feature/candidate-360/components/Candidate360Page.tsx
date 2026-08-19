import { Candidate360Runtime } from "../runtime/Candidate360Runtime";
import { notFound } from "next/navigation";

import { CandidateHeader } from "./CandidateHeader";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { ReadinessScorecard } from "./ReadinessScorecard";
import { CandidateRelationshipOverview } from "./CandidateRelationshipOverview";
import { CandidateActivityTimeline } from "./CandidateActivityTimeline";
import { CandidateEmailPanel } from "@/feature/communications/components/CandidateEmailPanel";
import { CandidateTaskPanel } from "@/feature/tasks/components/CandidateTaskPanel";
import { TaskRuntime } from "@/feature/tasks/runtime/TaskRuntime";
import { DemoTaskRepository } from "@/feature/tasks/repositories/DemoTaskRepository";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";

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
  const taskState = await new TaskRuntime(new DemoTaskRepository(), new SeedCandidateRepository()).forCandidate(demoConsultant.id, candidate.id);

  return (
    <div data-candidate-360-workspace className="space-y-8">

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

      <CandidateTaskPanel candidateId={candidate.id} candidateName={candidate.fullName} tasks={taskState.tasks} recommendations={taskState.recommendations} defaultDueAt={taskState.defaultDueAt} />

      <CandidateActivityTimeline candidate={candidate} />

    </div>
  );
}
