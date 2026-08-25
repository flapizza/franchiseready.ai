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
import { resolveAuthenticatedWorkspaceContext } from "@/feature/identity/data/workspace-context";
import { ConnectedEmailAccountRepository } from "@/feature/connected-email/repositories/ConnectedEmailAccountRepository";
import { ProductionEmailRepository } from "@/feature/communications/repositories/ProductionEmailRepository";
import type { EmailMessageView } from "@/feature/communications/runtime/EmailCommunicationRuntime";
import { createAuthenticatedAssessmentRepository } from "@/feature/assessment-engine/production/repository-factory";
import { ProductionCandidateIntelligence } from "./ProductionCandidateIntelligence";
import { createDiscoveryRepository } from "@/feature/discovery/production/repository-factory";
import { ProductionDiscoverySummary } from "./ProductionDiscoverySummary";

type Props = {
  candidateId: string;
};

export async function Candidate360Page({
  candidateId,
}: Props) {
  const composition = await createCandidateRepository();
  if (!composition) notFound();
  const productionAssessment=composition.mode==="supabase"?(await createAuthenticatedAssessmentRepository())?.repository.getForCandidate(candidateId)??null:null;
  const resolvedAssessment=await productionAssessment;
  let productionDiscovery=null;
  if(composition.mode==="supabase"&&resolvedAssessment?.analysis){try{productionDiscovery=(await(await createDiscoveryRepository())!.repository.getOrCreate(candidateId)).session}catch{productionDiscovery=null}}
  const runtime = new Candidate360Runtime(composition.repository, undefined, undefined, composition.mode === "supabase",resolvedAssessment);

  const candidate = await runtime.load(candidateId);

  if (!candidate) {
    notFound();
  }
  const taskState = candidate.rootOnly ? null : await new TaskRuntime(new DemoTaskRepository(), new SeedCandidateRepository()).forCandidate(demoConsultant.id, candidate.id);
  const playbook = candidate.rootOnly ? null : await new CandidateEngagementPlaybookService().build(candidate.id);
  let productionEmail: { accountId?: string; sender: { name: string; email: string | null }; messages: EmailMessageView[] } | null = null;
  if (composition.mode === "supabase") {
    const context = await resolveAuthenticatedWorkspaceContext();
    if (context) {
      const accounts = await new ConnectedEmailAccountRepository().listOwn(context);
      const account = accounts.find((item) => item.provider === "google" && item.status === "connected");
      const rows = await new ProductionEmailRepository(context).listByCandidate(candidate.id);
      productionEmail = { accountId: account?.publicId, sender: { name: account?.displayName ?? "FranGroove", email: account?.emailAddress ?? null },
        messages: rows.map((row) => ({ messageId: row.public_id, subject: row.subject,
          from: `${row.sender_name ?? row.sender_email} <${row.sender_email}>`,
          to: row.email_recipients.filter((recipient) => recipient.kind === "to").map((recipient) => `${recipient.display_name ?? recipient.email_address} <${recipient.email_address}>`).join(", "),
          sentAt: row.sent_at ?? undefined, sentLabel: row.sent_at ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(row.sent_at)) : undefined,
          deliveryStatus: row.status === "provider-accepted" ? "sent" : row.status === "failed-confirmed" ? "failed" : row.status,
          failureReason: row.status === "failed-confirmed" ? "Gmail confirmed that this attempt failed." : undefined,
          body: row.text_body, externallyDelivered: row.status === "provider-accepted", openCount: 0, replyCount: 0, links: [],
          engagementLabel: "Not tracked", engagementReasons: [] })) };
    }
  }

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
      {resolvedAssessment?.analysis && <ProductionCandidateIntelligence analysis={resolvedAssessment.analysis}/>}
      {resolvedAssessment?.analysis && <ProductionDiscoverySummary candidateId={candidate.id} session={productionDiscovery}/>}

      {productionEmail ? <CandidateEmailPanel candidateId={candidate.id} candidateName={candidate.fullName} candidateEmail={candidate.email}
        sender={productionEmail.sender} messages={productionEmail.messages} accountId={productionEmail.accountId} externalDelivery />
        : !candidate.rootOnly && <CandidateEmailPanel candidateId={candidate.id} candidateName={candidate.fullName} candidateEmail={candidate.email} sender={candidate.consultantSender} messages={candidate.emails} />}

      {!candidate.rootOnly && <CandidateMeetingPanel candidate={candidate} />}

      {taskState && <CandidateTaskPanel candidateId={candidate.id} candidateName={candidate.fullName} tasks={taskState.tasks} recommendations={taskState.recommendations} defaultDueAt={taskState.defaultDueAt} />}

      <CandidateActivityTimeline candidate={candidate} />

    </div>
  );
}
