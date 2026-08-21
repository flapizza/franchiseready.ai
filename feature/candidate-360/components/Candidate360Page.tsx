import { Candidate360Runtime } from "../runtime/Candidate360Runtime";
import { notFound } from "next/navigation";

import { CandidateHeader } from "./CandidateHeader";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { ReadinessScorecard } from "./ReadinessScorecard";
import { CandidateRelationshipOverview } from "./CandidateRelationshipOverview";
import { CandidateActivityTimeline } from "./CandidateActivityTimeline";
import { CandidateEmailPanel } from "@/feature/communications/components/CandidateEmailPanel";
import { CandidateTaskPanel } from "@/feature/tasks/components/CandidateTaskPanel";
import { CandidateMeetingPanel } from "@/feature/calendar/components/CandidateMeetingPanel";
import { TaskRuntime } from "@/feature/tasks/runtime/TaskRuntime";
import { DemoTaskRepository } from "@/feature/tasks/repositories/DemoTaskRepository";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { createCandidateRepository } from "@/feature/crm/repositories/candidate-repository-factory";
import { CandidateEngagementPlaybookService } from "@/feature/engagement-playbook/services/CandidateEngagementPlaybookService";
import { CandidatePlaybookSummary } from "@/feature/engagement-playbook/components/CandidatePlaybookSummary";

type Props = {
  candidateId: string;
};

export async function Candidate360Page({
  candidateId,
}: Props) {
  const composition = await createCandidateRepository();
  if (!composition) notFound();
  const runtime = new Candidate360Runtime(composition.repository, undefined, undefined, composition.mode === "supabase");

  const candidate = await runtime.load(candidateId);

  if (!candidate) {
    notFound();
  }
  const taskState = candidate.rootOnly ? null : await new TaskRuntime(new DemoTaskRepository(), new SeedCandidateRepository()).forCandidate(demoConsultant.id, candidate.id);
  const playbook = candidate.rootOnly ? null : await new CandidateEngagementPlaybookService().build(candidate.id);

  return (
    <div data-candidate-360-workspace className="space-y-8">

      <CandidateHeader
        candidate={candidate}
      />

      <CandidateRelationshipOverview candidate={candidate} />

      {playbook && <CandidatePlaybookSummary playbook={playbook} />}

      {candidate.hasIntelligence && <ExecutiveSummary
        candidate={candidate}
      />}

      {candidate.hasIntelligence && <ReadinessScorecard
        candidate={candidate}
      />}

      {!candidate.rootOnly && <CandidateEmailPanel candidateId={candidate.id} candidateName={candidate.fullName} candidateEmail={candidate.email} sender={candidate.consultantSender} messages={candidate.emails} />}

      {!candidate.rootOnly && <CandidateMeetingPanel candidate={candidate} />}

      {taskState && <CandidateTaskPanel candidateId={candidate.id} candidateName={candidate.fullName} tasks={taskState.tasks} recommendations={taskState.recommendations} defaultDueAt={taskState.defaultDueAt} />}

      <CandidateActivityTimeline candidate={candidate} />

    </div>
  );
}
