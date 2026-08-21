import "server-only";

import type { Activity } from "../models/Activity";
import type { AssessmentInvitation } from "../models/AssessmentInvitation";
import type { CandidateRecord } from "../models/CandidateRecord";
import type { CandidateBrandReferral } from "@/feature/referral-package/models/CandidateBrandReferral";
import type { StrategyBuilderRecord } from "@/feature/brand-strategy/models/StrategyBuilderRecord";
import type { EmailMessage } from "@/feature/communications/models/EmailMessage";
import type { EmailEngagementEvent } from "@/feature/communications/models/EmailEngagementEvent";
import type { ConsultantPipelineConfiguration } from "@/feature/pipeline/models/ConsultantPipeline";
import type { ConsultantTask } from "@/feature/tasks/models/ConsultantTask";
import type { ConsultantCalendarEvent, ConsultantReminder } from "@/feature/calendar/models/ConsultantCalendarEvent";
import type { EngagementStepDecision } from "@/feature/engagement-playbook/models/CandidateEngagementPlaybook";

/**
 * One deliberately isolated, process-local overlay for the conference demo.
 * It never mutates seed fixtures. Restarting the process or calling reset()
 * returns the app to the canonical baseline. Replace this store with durable
 * repository adapters when Supabase persistence is introduced.
 */
class DemoCandidateOverlayStore {
  private readonly candidates = new Map<string, CandidateRecord>();
  private readonly invitations = new Map<string, AssessmentInvitation>();
  private readonly activities = new Map<string, Activity[]>();
  private readonly referrals = new Map<string, CandidateBrandReferral>();
  private readonly strategies = new Map<string, StrategyBuilderRecord>();
  private readonly referralDeliveryFailures = new Set<string>();
  private readonly emailMessages = new Map<string, EmailMessage>();
  private readonly emailEvents = new Map<string, EmailEngagementEvent>();
  private readonly emailIdempotency = new Map<string, string>();
  private readonly emailDeliveryFailures = new Set<string>();
  private readonly emailCandidateDeliveryFailures = new Set<string>();
  private readonly dismissedEmailFollowUps = new Set<string>();
  private readonly pipelines = new Map<string, ConsultantPipelineConfiguration>();
  private readonly tasks = new Map<string, ConsultantTask>();
  private readonly dismissedTaskRecommendations = new Set<string>();
  private readonly calendarEvents = new Map<string, ConsultantCalendarEvent>();
  private readonly reminders = new Map<string, ConsultantReminder>();
  private readonly engagementPlaybookDecisions = new Map<string, EngagementStepDecision>();

  getCandidates(): CandidateRecord[] { return structuredClone([...this.candidates.values()]); }
  getCandidate(id: string): CandidateRecord | null { const value = this.candidates.get(id); return value ? structuredClone(value) : null; }
  saveCandidate(candidate: CandidateRecord): void { this.candidates.set(candidate.id, structuredClone(candidate)); }
  getPipeline(consultantId: string): ConsultantPipelineConfiguration | null { const value = this.pipelines.get(consultantId); return value ? structuredClone(value) : null; }
  savePipeline(configuration: ConsultantPipelineConfiguration): void { this.pipelines.set(configuration.consultantId, structuredClone(configuration)); }
  getTasks(consultantId: string): ConsultantTask[] { return structuredClone([...this.tasks.values()].filter((task) => task.consultantId === consultantId)); }
  getTask(taskId: string): ConsultantTask | null { const value = this.tasks.get(taskId); return value ? structuredClone(value) : null; }
  saveTask(task: ConsultantTask): void { this.tasks.set(task.taskId, structuredClone(task)); }
  isTaskRecommendationDismissed(recommendationId: string): boolean { return this.dismissedTaskRecommendations.has(recommendationId); }
  dismissTaskRecommendation(recommendationId: string): void { this.dismissedTaskRecommendations.add(recommendationId); }
  getCalendarEvents(consultantId: string): ConsultantCalendarEvent[] { return structuredClone([...this.calendarEvents.values()].filter((event) => event.consultantId === consultantId)); }
  getCalendarEvent(id: string): ConsultantCalendarEvent | null { const value = this.calendarEvents.get(id); return value ? structuredClone(value) : null; }
  saveCalendarEvent(event: ConsultantCalendarEvent): void { this.calendarEvents.set(event.id, structuredClone(event)); }
  getReminders(consultantId: string): ConsultantReminder[] { return structuredClone([...this.reminders.values()].filter((item) => item.consultantId === consultantId)); }
  saveReminder(reminder: ConsultantReminder): void { this.reminders.set(reminder.id, structuredClone(reminder)); }
  getEngagementPlaybookDecisions(candidateId: string): EngagementStepDecision[] { return structuredClone([...this.engagementPlaybookDecisions.values()].filter((item) => item.candidateId === candidateId)); }
  saveEngagementPlaybookDecision(decision: EngagementStepDecision): void { this.engagementPlaybookDecisions.set(`${decision.candidateId}:${decision.stepId}`, structuredClone(decision)); }

  getInvitation(id: string): AssessmentInvitation | null { const value = this.invitations.get(id); return value ? structuredClone(value) : null; }
  getInvitationByToken(token: string): AssessmentInvitation | null { const value = [...this.invitations.values()].find((item) => item.token === token); return value ? structuredClone(value) : null; }
  getInvitationForCandidate(candidateId: string): AssessmentInvitation | null { const value = [...this.invitations.values()].filter((item) => item.candidateId === candidateId).at(-1); return value ? structuredClone(value) : null; }
  saveInvitation(invitation: AssessmentInvitation): void { this.invitations.set(invitation.id, structuredClone(invitation)); }

  getActivities(candidateId: string): Activity[] { return structuredClone(this.activities.get(candidateId) ?? []); }
  addActivity(activity: Activity): void {
    const current = this.activities.get(activity.candidateId) ?? [];
    if (!current.some((item) => item.id === activity.id)) this.activities.set(activity.candidateId, [...current, structuredClone(activity)]);
  }

  getCandidateReferrals(candidateId: string): CandidateBrandReferral[] { return structuredClone([...this.referrals.values()].filter((item) => item.candidateId === candidateId)); }
  getCandidateReferral(referralId: string): CandidateBrandReferral | null { const value = this.referrals.get(referralId); return value ? structuredClone(value) : null; }
  saveCandidateReferral(referral: CandidateBrandReferral): void { this.referrals.set(referral.referralId, structuredClone(referral)); }
  failNextReferralDelivery(referralId: string): void { this.referralDeliveryFailures.add(referralId); }
  consumeReferralDeliveryFailure(referralId: string): boolean { return this.referralDeliveryFailures.delete(referralId); }

  getStrategy(candidateId: string): StrategyBuilderRecord | null { const value = this.strategies.get(candidateId); return value ? structuredClone(value) : null; }
  saveStrategy(strategy: StrategyBuilderRecord): void { this.strategies.set(strategy.candidateId, structuredClone(strategy)); }

  getEmailMessages(candidateId: string): EmailMessage[] { return structuredClone([...this.emailMessages.values()].filter((item) => item.candidateId === candidateId)); }
  getEmailMessage(messageId: string): EmailMessage | null { const value = this.emailMessages.get(messageId); return value ? structuredClone(value) : null; }
  getEmailMessageByIdempotencyKey(key: string): EmailMessage | null { const id = this.emailIdempotency.get(key); return id ? this.getEmailMessage(id) : null; }
  saveEmailMessage(message: EmailMessage): void { this.emailMessages.set(message.messageId, structuredClone(message)); this.emailIdempotency.set(message.sendIdempotencyKey, message.messageId); }
  getEmailEvents(candidateId: string): EmailEngagementEvent[] { return structuredClone([...this.emailEvents.values()].filter((item) => item.candidateId === candidateId)); }
  addEmailEvent(event: EmailEngagementEvent): boolean { if (this.emailEvents.has(event.eventId) || (event.providerEventId && [...this.emailEvents.values()].some((item) => item.providerEventId === event.providerEventId))) return false; this.emailEvents.set(event.eventId, structuredClone(event)); return true; }
  failNextEmailDelivery(messageId: string): void { this.emailDeliveryFailures.add(messageId); }
  consumeEmailDeliveryFailure(messageId: string): boolean { return this.emailDeliveryFailures.delete(messageId); }
  failNextCandidateEmailDelivery(candidateId: string): void { this.emailCandidateDeliveryFailures.add(candidateId); }
  consumeCandidateEmailDeliveryFailure(candidateId: string): boolean { return this.emailCandidateDeliveryFailures.delete(candidateId); }
  isEmailFollowUpDismissed(messageId: string): boolean { return this.dismissedEmailFollowUps.has(messageId); }
  dismissEmailFollowUp(messageId: string): void { this.dismissedEmailFollowUps.add(messageId); }

  reset(): void { this.candidates.clear(); this.pipelines.clear(); this.tasks.clear(); this.dismissedTaskRecommendations.clear(); this.calendarEvents.clear(); this.reminders.clear(); this.engagementPlaybookDecisions.clear(); this.invitations.clear(); this.activities.clear(); this.referrals.clear(); this.strategies.clear(); this.referralDeliveryFailures.clear(); this.emailMessages.clear(); this.emailEvents.clear(); this.emailIdempotency.clear(); this.emailDeliveryFailures.clear(); this.emailCandidateDeliveryFailures.clear(); this.dismissedEmailFollowUps.clear(); }
}

const demoGlobal = globalThis as typeof globalThis & {
  __frangrooveDemoCandidateOverlay?: DemoCandidateOverlayStore;
};

/** Next.js may evaluate Server Action and Route Handler bundles separately in
 * development. Anchoring the one overlay on globalThis keeps those bundles on
 * the same deterministic process-local state boundary. */
export const demoCandidateOverlayStore =
  demoGlobal.__frangrooveDemoCandidateOverlay &&
  typeof demoGlobal.__frangrooveDemoCandidateOverlay.getCalendarEvents === "function"
    ? demoGlobal.__frangrooveDemoCandidateOverlay
    : new DemoCandidateOverlayStore();

demoGlobal.__frangrooveDemoCandidateOverlay = demoCandidateOverlayStore;
