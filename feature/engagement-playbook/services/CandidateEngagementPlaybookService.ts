import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { EmailCommunicationRuntime } from "@/feature/communications/runtime/EmailCommunicationRuntime";
import { DemoCalendarRepository } from "@/feature/calendar/repositories/DemoCalendarRepository";
import { DemoTaskRepository } from "@/feature/tasks/repositories/DemoTaskRepository";
import { CandidateBrandStrategyRuntime } from "@/feature/brand-strategy/runtime/CandidateBrandStrategyRuntime";
import { CandidateReferralService } from "@/feature/referral-package/services/CandidateReferralService";
import type { CandidateEngagementPlaybook, CandidateEngagementStep, EngagementActionType, EngagementEvidence } from "../models/CandidateEngagementPlaybook";
import { DemoEngagementPlaybookRepository } from "../repositories/DemoEngagementPlaybookRepository";

const DEMO_NOW = "2026-08-21T14:00:00.000Z";
const due = (days: number) => new Date(Date.parse(DEMO_NOW) + days * 86_400_000).toISOString();

type Draft = Omit<CandidateEngagementStep, "stepId" | "order" | "status">;

export class CandidateEngagementPlaybookService {
  constructor(
    private readonly candidates = new SeedCandidateRepository(),
    private readonly decisions = new DemoEngagementPlaybookRepository(),
  ) {}

  async build(candidateId: string): Promise<CandidateEngagementPlaybook | null> {
    const candidate = await this.candidates.getById(candidateId);
    if (!candidate) return null;
    const [emails, meetings, tasks, strategy] = await Promise.all([
      Promise.resolve(new EmailCommunicationRuntime().load(candidateId)),
      new DemoCalendarRepository().getEvents(candidate.consultantId),
      new DemoTaskRepository().getAll(candidate.consultantId),
      candidate.intelligence ? new CandidateBrandStrategyRuntime().load(candidateId) : Promise.resolve(null),
    ]);
    const ownMeetings = meetings.filter((item) => item.candidateId === candidateId);
    const ownTasks = tasks.filter((item) => item.candidateId === candidateId);
    const referrals = new CandidateReferralService().getByCandidate(candidateId);
    const latest = emails[0];
    const clicks = latest?.links.reduce((sum, link) => sum + link.clickCount, 0) ?? 0;
    const fingerprint = [candidate.pipelineStage, latest?.messageId, latest?.deliveryStatus, latest?.openCount, clicks, latest?.replyCount, ownMeetings.map((item) => `${item.id}:${item.status}`).join(","), ownTasks.filter((item) => item.source !== "engagement-playbook").map((item) => `${item.taskId}:${item.status}`).join(","), referrals.map((item) => `${item.referralId}:${item.status}`).join(","), strategy?.workflow.label].join("|");
    const evidenceUpdatedAt = [candidate.updatedAt, latest?.sentAt, ...ownMeetings.map((item) => item.updatedAt), ...ownTasks.map((item) => item.updatedAt), ...referrals.map((item) => item.updatedAt)].filter(Boolean).sort().at(-1) ?? DEMO_NOW;
    const drafts = this.compose({ candidateId, stage: candidate.pipelineStage, summary: candidate.intelligence?.executiveSummary ?? "",
      risks: (candidate.intelligence?.discoveryPriorities ?? []).filter((item) => /confirm|risk|unresolved|reconfirm/i.test(item)),
      latest, clicks, meetings: ownMeetings, strategy, referrals });
    const decisions = this.decisions.getDecisions(candidateId);
    const steps = drafts.map((draft, index) => {
      const stepId = `playbook:${candidateId}:${draft.actionType}:${index + 1}`;
      const decision = decisions.find((item) => item.stepId === stepId && item.evidenceFingerprint === fingerprint);
      const linkedTask = decision?.relatedTaskId ? ownTasks.find((item) => item.taskId === decision.relatedTaskId) : undefined;
      const linkedMeeting = decision?.relatedMeetingId ? ownMeetings.find((item) => item.id === decision.relatedMeetingId) : undefined;
      const status = linkedTask?.status === "completed" || linkedMeeting?.status === "completed" ? "completed" : decision?.status ?? "recommended";
      return { ...draft, stepId, order: index + 1, status, relatedTaskId: decision?.relatedTaskId, relatedMeetingId: decision?.relatedMeetingId, relatedMessageId: decision?.relatedMessageId, decidedAt: decision?.decidedAt } satisfies CandidateEngagementStep;
    });
    const current = steps.find((item) => item.status === "recommended" || item.status === "accepted");
    const completed = steps.filter((item) => item.status === "completed" || item.status === "skipped" || item.status === "dismissed").length;
    return {
      playbookId: `engagement-playbook:${candidateId}`, candidateId, candidateName: `${candidate.firstName} ${candidate.lastName}`,
      title: "Candidate Engagement Playbook", summary: current ? `${current.title} is the next consultant decision.` : "Every recommended step has been resolved.",
      generatedAt: DEMO_NOW, evidenceUpdatedAt, evidenceFingerprint: fingerprint, status: current ? "active" : "completed", currentStepId: current?.stepId,
      steps, rationale: [...new Set(steps.flatMap((item) => item.evidence.map((evidence) => evidence.detail)))].slice(0, 5), progress: { completed, total: steps.length },
    };
  }

  private compose(context: { candidateId: string; stage: string; summary: string; risks: string[]; latest?: ReturnType<EmailCommunicationRuntime["load"]>[number]; clicks: number; meetings: Awaited<ReturnType<DemoCalendarRepository["getEvents"]>>; strategy: Awaited<ReturnType<CandidateBrandStrategyRuntime["load"]>>; referrals: ReturnType<CandidateReferralService["getByCandidate"]> }): Draft[] {
    const steps: Draft[] = [];
    const emailEvidence = context.latest ? [{ source: "email-engagement", referenceId: context.latest.messageId, label: context.latest.engagementLabel, detail: context.latest.mostRecentEngagement ?? `${context.latest.subject} was ${context.latest.deliveryStatus}.` }] satisfies EngagementEvidence[] : [];
    const add = (actionType: EngagementActionType, title: string, description: string, rationale: string, timing: string, evidence: EngagementEvidence[], actionLabel?: string, actionHref?: string, suggestedDueAt?: string, relatedMessageId?: string) => steps.push({ actionType, title, description, rationale, recommendedTiming: timing, evidence, actionLabel, actionHref, suggestedDueAt, relatedMessageId });
    const latestAge = context.latest?.sentAt ? Date.parse(DEMO_NOW) - Date.parse(context.latest.sentAt) : Infinity;

    if (context.latest?.deliveryStatus === "failed") add("send-email", "Resolve the failed delivery", "Review the recipient and retry the preserved message.", "The candidate cannot engage until the delivery issue is resolved.", "Today", emailEvidence, "Open Communications", `/crm/communications?message=${context.latest.messageId}`, due(0), context.latest.messageId);
    else if (context.latest?.replyCount) add("call-candidate", "Respond to the candidate reply", "Review the reply context and choose a personal response.", "A direct candidate response is stronger evidence than passive engagement.", "Today", emailEvidence, "Open Communications", `/crm/communications?message=${context.latest.messageId}`, due(0), context.latest.messageId);
    else if (latestAge <= 36 * 60 * 60 * 1000) add("wait-monitor", "Wait for candidate engagement", "Allow the recent communication time to work before contacting the candidate again.", "A message was sent within the cadence guardrail; immediate outreach could create unnecessary pressure.", "Until tomorrow", emailEvidence, "Monitor Communications", `/crm/communications?message=${context.latest?.messageId}`, due(1), context.latest?.messageId);
    else if ((context.latest?.openCount ?? 0) > 1 && context.clicks) add("send-email", "Send a personal follow-up", "Reference the candidate's demonstrated interest and ask one focused next-step question.", "Repeated opens and a tracked-link click indicate timely, specific interest.", "Today", emailEvidence, "Draft Email", `/crm/communications?compose=1&candidate=${context.candidateId}`, due(0), context.latest?.messageId);
    else if (context.latest && !context.latest.openCount && !context.clicks) add("create-task", "Plan an alternate follow-up", "Create a deliberate follow-up task rather than sending another immediate email.", "The delivered communication has no engagement, so a measured alternate touch is more appropriate.", "Within 3 days", emailEvidence, "Create Follow-Up Task", undefined, due(3), context.latest.messageId);

    const concern = context.risks.length > 0;
    if (concern || context.stage === "discovery" || context.stage === "validation") add("continue-discovery", concern ? "Clarify the unresolved fit concern" : "Confirm Discovery evidence", "Use a focused conversation to resolve the remaining qualification evidence.", concern ? "Candidate intelligence identifies an unresolved family, financial, lifestyle, or alignment consideration." : "The candidate remains in an evidence-validation lifecycle stage.", "At the next conversation", [{ source: "candidate-intelligence", referenceId: context.candidateId, label: "Candidate Intelligence", detail: context.summary || `Lifecycle stage: ${context.stage}.` }], "Continue Discovery", `/crm/${context.candidateId}/discovery`);
    if (context.referrals.length || context.stage === "referral") add("prepare-referral", "Review referral readiness", "Review the shortlist and decide whether to prepare or advance an introduction.", "Referral readiness is advisory; the consultant retains authority over timing.", "This week", [{ source: "referral", referenceId: context.referrals[0]?.referralId ?? context.candidateId, label: "Referral context", detail: context.referrals.length ? `${context.referrals.length} referral record${context.referrals.length === 1 ? "" : "s"} available.` : "The candidate is in referral context." }], "Open Referral Studio", `/crm/candidates/${context.candidateId}/referral`);
    else if (context.strategy?.available && (context.stage === "brand-matching" || context.strategy.workflow.selected > context.strategy.workflow.presented)) add("present-brands", "Prepare the Brand Presentation", "Review the ordered presentation set and begin the consultant-led conversation.", context.strategy.workflow.selected ? "The strategy has selected recommendations that have not all been presented." : "Discovery is complete and evidence-backed recommendations are ready for consultant selection and presentation planning.", "Before the next candidate meeting", [{ source: "brand-strategy", referenceId: context.candidateId, label: context.strategy.workflow.label, detail: `${context.strategy.workflow.selected} brands selected; ${context.strategy.workflow.presented} presented.` }], context.strategy.workflow.selected ? "Open Brand Presentation" : "Build Presentation Set", context.strategy.workflow.selected ? `/crm/candidates/${context.candidateId}/strategy/presentation` : `/crm/candidates/${context.candidateId}/strategy`);
    else if (context.strategy?.available) add("review-brand-strategy", "Review the evidence-backed strategy", "Confirm which recommendations belong in the candidate conversation.", "Candidate Intelligence supports an explainable Brand Strategy review.", "This week", [{ source: "brand-strategy", referenceId: context.candidateId, label: context.strategy.workflow.label, detail: `${context.strategy.recommendations.length} recommendations available for consultant review.` }], "Open Brand Strategy", `/crm/candidates/${context.candidateId}/strategy`);

    if (!context.meetings.some((item) => item.status === "scheduled")) add("schedule-meeting", "Reserve the next candidate conversation", "Choose a time only after confirming the appropriate engagement objective.", "No upcoming candidate meeting is currently scheduled.", "After the current outreach decision", [{ source: "calendar", referenceId: context.candidateId, label: "Calendar", detail: "No scheduled candidate meeting is available." }], "Add Meeting", `/crm/calendar?candidateId=${context.candidateId}`);
    if (!steps.length) add("review-candidate", "Review the candidate relationship", "Review current evidence and choose the next consultant-led action.", "No stronger operational signal currently overrides a relationship review.", "This week", [{ source: "pipeline", referenceId: context.candidateId, label: "Pipeline context", detail: `Current canonical lifecycle: ${context.stage}.` }], "Open Candidate 360", `/crm/candidates/${context.candidateId}`);
    return steps.slice(0, 5);
  }
}
