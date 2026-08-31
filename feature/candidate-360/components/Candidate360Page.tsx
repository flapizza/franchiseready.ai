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
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { CandidatePlaybookSummary } from "@/feature/engagement-playbook/components/CandidatePlaybookSummary";
import type { EmailMessageView } from "@/feature/communications/runtime/EmailCommunicationRuntime";
import { ProductionCandidateIntelligence } from "./ProductionCandidateIntelligence";
import { ProductionDiscoverySummary } from "./ProductionDiscoverySummary";
import { DeleteCandidateControl } from "@/feature/crm/components/DeleteCandidateControl";
import { DemoCandidateJourney } from "./DemoCandidateJourney";

type Props = {
  candidateId: string;
};

export async function Candidate360Page({
  candidateId,
}: Props) {
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved") notFound();
  const composition = resolution.composition;
  const isProduction = composition.session.kind === "production";
  const productionAssessment=isProduction&&!("runtimes" in composition)?composition.dependencies.assessments.getForCandidate(candidateId):null;
  const resolvedAssessment=await productionAssessment;
  let productionDiscovery=null;
  if(isProduction&&resolvedAssessment?.analysis&&!("runtimes" in composition)){try{productionDiscovery=(await composition.dependencies.discovery.getOrCreate(candidateId)).session}catch{productionDiscovery=null}}
  const runtime = "runtimes" in composition
    ? composition.runtimes.createCandidate360()
    : new Candidate360Runtime({ candidates: composition.dependencies.candidates, rootOnly: true, productionAssessment: resolvedAssessment });

  const candidate = await runtime.load(candidateId);

  if (!candidate) {
    notFound();
  }
  const taskState = candidate.rootOnly || !("runtimes" in composition) ? null : await composition.runtimes.loadCandidateTasks(candidate.id);
  const playbook = candidate.rootOnly || !("runtimes" in composition) ? null : await composition.runtimes.createEngagementPlaybook().build(candidate.id);
  let productionEmail: { accountId?: string; sender: { name: string; email: string | null }; messages: EmailMessageView[] } | null = null;
  if (isProduction) {
    if (!("runtimes" in composition)) {
      const accounts = await composition.dependencies.emailAccountSummaries();
      const account = accounts.find((item) => item.provider === "google" && item.status === "connected");
      const rows = await composition.dependencies.emailMessages.listByCandidate(candidate.id);
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

      {!candidate.rootOnly && candidate.id === "candidate-demo" && <DemoCandidateJourney candidateId={candidate.id} />}

      <CandidateRelationshipOverview candidate={candidate} />

      {playbook && <CandidatePlaybookSummary playbook={playbook} />}

      {candidate.hasIntelligence && <div id="assessment-intelligence" className="scroll-mt-24"><ExecutiveSummary candidate={candidate} /></div>}

      {candidate.hasIntelligence && <ReadinessScorecard
        candidate={candidate}
      />}
      {resolvedAssessment?.analysis && <ProductionCandidateIntelligence analysis={resolvedAssessment.analysis} candidateId={candidateId} completedAt={resolvedAssessment.completedAt}/>}
      {resolvedAssessment?.analysis && <ProductionDiscoverySummary candidateId={candidate.id} session={productionDiscovery}/>}

      {productionEmail ? <CandidateEmailPanel candidateId={candidate.id} candidateName={candidate.fullName} candidateEmail={candidate.email}
        sender={productionEmail.sender} messages={productionEmail.messages} accountId={productionEmail.accountId} externalDelivery />
        : !candidate.rootOnly && <CandidateEmailPanel candidateId={candidate.id} candidateName={candidate.fullName} candidateEmail={candidate.email} sender={candidate.consultantSender} messages={candidate.emails} />}

      {!candidate.rootOnly && <CandidateMeetingPanel candidate={candidate} />}

      {taskState && <CandidateTaskPanel candidateId={candidate.id} candidateName={candidate.fullName} tasks={taskState.tasks} recommendations={taskState.recommendations} defaultDueAt={taskState.defaultDueAt} />}

      <CandidateActivityTimeline candidate={candidate} />

      {isProduction && <section aria-label="Candidate administration" className="flex justify-end border-t border-slate-200 pt-6">
        <DeleteCandidateControl candidateId={candidate.id} />
      </section>}

    </div>
  );
}
