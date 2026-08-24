import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import type { CandidateRecord } from "@/feature/crm/models/CandidateRecord";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { AssessmentInvitationService } from "@/feature/crm/services/AssessmentInvitationService";
import type { Activity, ActivityType } from "@/feature/crm/models/Activity";
import type { CandidateActivityRepository } from "@/feature/crm/repositories/CandidateActivityRepository";
import { DemoCandidateActivityRepository } from "@/feature/crm/repositories/DemoCandidateActivityRepository";
import type { DemoScenarioRepository } from "@/feature/demo/repositories/DemoScenarioRepository";
import { SeedDemoScenarioRepository } from "@/feature/demo/repositories/SeedDemoScenarioRepository";
import { createDemoCandidateLifecycleService } from "@/feature/crm/services/DemoCandidateLifecycleService";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import { getConferenceReferralHistory } from "@/feature/demo/data/conferenceReferralHistory";
import { CandidateBrandStrategyRuntime } from "@/feature/brand-strategy/runtime/CandidateBrandStrategyRuntime";
import { EmailCommunicationRuntime } from "@/feature/communications/runtime/EmailCommunicationRuntime";
import { DemoEmailRepository } from "@/feature/communications/repositories/DemoEmailRepository";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { DemoConsultantPipelineRepository } from "@/feature/pipeline/repositories/DemoConsultantPipelineRepository";
import { PipelineConfigurationService } from "@/feature/pipeline/services/PipelineConfigurationService";
import { DemoCalendarRepository } from "@/feature/calendar/repositories/DemoCalendarRepository";
import { formatEventDate, formatEventTime } from "@/feature/calendar/time/ConsultantTime";

import type { Candidate360State, CandidateActivityState } from "../models/Candidate360State";

const activityPresentation: Record<ActivityType, Pick<CandidateActivityState, "icon" | "tone">> = {
  "candidate-created": { icon: "candidate", tone: "blue" },
  "assessment-started": { icon: "assessment", tone: "teal" },
  "assessment-completed": { icon: "assessment", tone: "emerald" },
  "discovery-started": { icon: "discovery", tone: "blue" },
  "discovery-completed": { icon: "discovery", tone: "teal" },
  "validation-started": { icon: "stage", tone: "amber" },
  "brand-presented": { icon: "brand", tone: "blue" },
  "brand-strategy-ready": { icon: "brand", tone: "emerald" },
  "referral-ready": { icon: "referral", tone: "emerald" },
  "referral-generated": { icon: "referral", tone: "blue" },
  "candidate-introduced": { icon: "referral", tone: "teal" },
  "validation-completed": { icon: "stage", tone: "emerald" },
  "fdd-delivered": { icon: "activity", tone: "blue" },
  "funding-updated": { icon: "activity", tone: "amber" },
  "meet-the-team": { icon: "activity", tone: "teal" },
  award: { icon: "referral", tone: "emerald" },
  "note-added": { icon: "activity", tone: "slate" },
  "task-created": { icon: "activity", tone: "blue" },
  "task-completed": { icon: "activity", tone: "emerald" },
  "task-cancelled": { icon: "activity", tone: "amber" },
  "meeting-scheduled": { icon: "meeting", tone: "blue" },
  "meeting-completed": { icon: "meeting", tone: "emerald" },
  "meeting-cancelled": { icon: "meeting", tone: "amber" },
  "meeting-no-show": { icon: "meeting", tone: "amber" },
  "email-sent": { icon: "assessment", tone: "teal" },
  "status-changed": { icon: "stage", tone: "blue" },
};

function formatActivityDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export class Candidate360Runtime {
  public constructor(
    private readonly candidates: CandidateRepository =
      new SeedCandidateRepository(),
    private readonly scenarios: DemoScenarioRepository =
      new SeedDemoScenarioRepository(),
    private readonly activityRepository: CandidateActivityRepository =
      new DemoCandidateActivityRepository(),
    private readonly rootOnly = false,
  ) {}

  public async load(candidateId: string): Promise<Candidate360State | null> {
    const candidate = await this.candidates.getById(candidateId);

    if (!candidate) return null;
    if (this.rootOnly) return this.loadRootOnly(candidate);
    const nextMeeting = (await new DemoCalendarRepository().getEvents(candidate.consultantId)).filter((event) => event.candidateId === candidate.id && event.status === "scheduled" && Date.parse(event.endAt) >= Date.now()).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))[0];
    const pipelineService = new PipelineConfigurationService(new DemoConsultantPipelineRepository(), this.candidates);
    const pipeline = await pipelineService.get(candidate.consultantId);
    const visibleStage = pipelineService.resolveStage(pipeline, candidate);

    const invitation = new AssessmentInvitationService(this.candidates).getForCandidate(candidate.id);
    const scenarioCandidate = await this.scenarios.getCandidateById(candidate.id);
    const intelligence = candidate.intelligence;
    const lifecycleAction = createDemoCandidateLifecycleService(this.candidates).getRecommendedAction(candidate);
    const overlayReferrals = demoCandidateOverlayStore.getCandidateReferrals(candidate.id);
    const referrals = overlayReferrals.length ? overlayReferrals : getConferenceReferralHistory(candidate.id);
    const brandStrategy = candidate.intelligence ? await new CandidateBrandStrategyRuntime().load(candidate.id) : null;
    const awaitingApproval = referrals.filter((item) => item.status === "ready-for-review").length;
    const approvedReferrals = referrals.filter((item) => item.status === "approved").length;
    const assessmentStatus = candidate.pipelineStage === "assessment-started"
      ? "pending" as const
      : intelligence ? "completed" as const : "not-completed" as const;
    const lifecycleDetail = this.lifecycleDetail(candidate.pipelineStage);
    const assessment = assessmentStatus === "completed"
      ? { label: candidate.pipelineStage === "awarded" ? "Placement Awarded" : "Assessment Complete", detail: lifecycleDetail, invitationSent: Boolean(invitation), actionLabel: candidate.pipelineStage === "awarded" ? "View Referral History" : "Open Candidate Workspace", actionHref: candidate.pipelineStage === "awarded" ? `/crm/candidates/${candidate.id}/referral` : `/crm/${candidate.id}/discovery` }
      : assessmentStatus === "pending"
        ? { label: "Assessment Pending", detail: invitation ? `Invitation sent to ${invitation.candidateEmail}. The candidate has not completed the assessment yet.` : "The assessment is pending, but an active invitation link is not available. Send a new invitation to continue.", invitationSent: Boolean(invitation), actionLabel: invitation ? "Open Assessment" : "Send Assessment", actionHref: invitation?.assessmentUrl }
        : { label: "Assessment Not Started", detail: "No completed assessment or Candidate Intelligence is available.", invitationSent: false, actionLabel: "Send Assessment" };

    const emails = new EmailCommunicationRuntime().load(candidate.id);
    const emailEvents = new DemoEmailRepository().getEvents(candidate.id);
    const emailActivities: CandidateActivityState[] = emails.flatMap((message) => {
      const own = emailEvents.filter((event) => event.messageId === message.messageId);
      const opens = own.filter((event) => event.type === "open");
      const clicks = own.filter((event) => event.type === "link-click");
      const replies = own.filter((event) => event.type === "reply");
      const values: CandidateActivityState[] = [];
      if (message.sentAt) values.push({ id: `${message.messageId}:sent`, title: "Email Sent", description: message.subject, timestamp: message.sentAt, dateLabel: formatActivityDate(message.sentAt), icon: "email", tone: "blue" });
      if (message.deliveryStatus === "delivered" && message.sentAt) values.push({ id: `${message.messageId}:delivered`, title: "Email Delivered", description: message.subject, timestamp: message.sentAt, dateLabel: formatActivityDate(message.sentAt), icon: "email", tone: "emerald" });
      if (opens.length) values.push({ id: `${message.messageId}:opens`, title: `Email opened ${opens.length} time${opens.length === 1 ? "" : "s"}`, description: message.subject, timestamp: opens.at(-1)!.occurredAt, dateLabel: formatActivityDate(opens.at(-1)!.occurredAt), icon: "email", tone: "teal" });
      if (clicks.length) values.push({ id: `${message.messageId}:clicks`, title: clicks.length === 1 ? "Link Clicked" : `${clicks.length} Link Clicks`, description: message.mostRecentEngagement, timestamp: clicks.at(-1)!.occurredAt, dateLabel: formatActivityDate(clicks.at(-1)!.occurredAt), icon: "email", tone: "emerald" });
      if (replies.length) values.push({ id: `${message.messageId}:reply`, title: "Candidate Replied", description: message.subject, timestamp: replies.at(-1)!.occurredAt, dateLabel: formatActivityDate(replies.at(-1)!.occurredAt), icon: "email", tone: "emerald" });
      return values;
    });
    const overlayActivities = await this.activityRepository.getByCandidateId(candidate.id);
    const baselineActivities: CandidateActivityState[] = (scenarioCandidate?.recentActivity ?? []).map((activity) => ({
      id: activity.id, title: activity.title, description: activity.detail,
      timestamp: activity.occurredAt, dateLabel: formatActivityDate(activity.occurredAt), icon: "activity", tone: "slate",
    }));
    const activities = [...baselineActivities, ...overlayActivities.map((activity) => this.toActivity(activity)), ...emailActivities]
      .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp));

    return {
      id: candidate.id,
      fullName: `${candidate.firstName} ${candidate.lastName}`,
      email: candidate.email,
      consultantSender: { name: demoConsultant.displayName, email: demoConsultant.email ?? null },
      emails,
      currentStage: visibleStage.displayName,
      currentStageId: visibleStage.stageId,
      canonicalLifecycleStage: visibleStage.canonicalLifecycleStage,
      pipelineStages: pipeline.stages.filter((stage) => stage.enabled).sort((a, b) => a.order - b.order).map((stage) => ({ stageId: stage.stageId, label: stage.displayName })),
      hasIntelligence: intelligence !== null,
      assessmentStatus,
      assessmentUrl: invitation?.assessmentUrl,
      readinessScore: intelligence?.overallReadiness ?? null,
      buyingConfidence: intelligence?.timing.confidence ?? null,
      recommendationConfidence: intelligence?.overallReadiness ?? null,
      executiveSummary: intelligence?.executiveSummary ?? "Assessment not completed. Candidate Intelligence will become available after assessment completion.",
      financialReadiness: intelligence?.financial.financingLikelihood ?? null,
      leadershipReadiness: intelligence?.competencies.leadership ?? null,
      lifestyleAlignment: intelligence?.behavioral.adaptability ?? null,
      coachability: intelligence?.behavioral.coachability ?? null,
      nextBestAction: emails[0]?.nextAction ?? (candidate.pipelineStage === "awarded" ? "Prepare Onboarding" : lifecycleAction?.label ?? scenarioCandidate?.nextBestAction ?? (assessmentStatus === "pending" && invitation ? "Complete the assessment" : "Send the assessment invitation")),
      knownInformation: [
        { label: "Email", value: candidate.email, icon: "email" },
        { label: "Phone", value: candidate.phone || "Not provided", icon: "phone" },
        { label: "Location", value: [candidate.city, candidate.state].filter(Boolean).join(", ") || "Not provided", icon: "location" },
        { label: "Preferred Territory", value: candidate.preferredTerritory || "Not provided", icon: "territory" },
        { label: "Lead Source", value: candidate.leadSource || "Not provided", icon: "source" },
      ],
      assessment,
      activities,
      lifecycleAction: lifecycleAction ? { label: lifecycleAction.label } : null,
      brandStrategyHref: candidate.intelligence ? `/crm/candidates/${candidate.id}/strategy` : undefined,
      brandStrategy: brandStrategy?.available ? { recommendations: brandStrategy.recommendations.length, presented: brandStrategy.workflow.presented,
        strongInterest: brandStrategy.workflow.strongInterest, referralSelections: brandStrategy.workflow.referralSelections, statusLabel: brandStrategy.workflow.label,
        actionLabel: brandStrategy.workflow.referralSelections ? "Open Referral Studio" : brandStrategy.workflow.presented < brandStrategy.workflow.selected ? (brandStrategy.workflow.presented ? "Continue Brand Presentation" : "Start Brand Presentation") : "Review Final Shortlist",
        actionHref: brandStrategy.workflow.referralSelections ? `/crm/candidates/${candidate.id}/referral` : brandStrategy.workflow.selected ? `/crm/candidates/${candidate.id}/strategy/presentation${brandStrategy.workflow.presented === brandStrategy.workflow.selected ? "?summary=1" : ""}` : `/crm/candidates/${candidate.id}/strategy` } : undefined,
      referralAction: referrals.length
        ? { label: candidate.pipelineStage === "awarded" ? "View Referral History" : approvedReferrals ? "Review Delivery Status" : awaitingApproval ? `Open ${awaitingApproval} Handoff Package${awaitingApproval === 1 ? "" : "s"}` : "Open Handoff Package", href: `/crm/candidates/${candidate.id}/referral` }
        : candidate.pipelineStage === "referral"
          ? { label: "Prepare Referral", href: `/crm/candidates/${candidate.id}/referral` }
          : undefined,
      referrals: referrals.length ? { total: referrals.length, introduced: referrals.filter((item) => item.status === "sent" || item.status === "introduced").length,
        items: referrals.map((item) => ({ brandName: item.brandName, statusLabel: item.referralPackage.handoffStatus === "ready" ? "Handoff Package Ready" : item.status === "ready-for-review" ? "Handoff Package Prepared" : item.status.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ") })) } : undefined,
      nextMeeting: nextMeeting ? { id: nextMeeting.id, title: nextMeeting.title, dateLabel: formatEventDate(nextMeeting.startAt, nextMeeting.timezone), timeLabel: formatEventTime(nextMeeting.startAt, nextMeeting.timezone), locationLabel: nextMeeting.location ?? (nextMeeting.meetingUrl ? "Online meeting" : "Location not set") } : undefined,
    };
  }

  private loadRootOnly(candidate: CandidateRecord): Candidate360State {
    const stage = candidate.pipelineStageId ?? candidate.pipelineStage;
    return {
      rootOnly: true, id: candidate.id, fullName: `${candidate.firstName} ${candidate.lastName}`, email: candidate.email,
      consultantSender: { name: "FranGroove", email: null }, emails: [], currentStage: stage.replaceAll("-", " "),
      currentStageId: stage, canonicalLifecycleStage: candidate.pipelineStage === "lead" ? "lead" : "other",
      pipelineStages: [{ stageId: stage, label: stage.replaceAll("-", " ") }], hasIntelligence: false,
      assessmentStatus: "not-completed", readinessScore: null, buyingConfidence: null, recommendationConfidence: null,
      executiveSummary: "Candidate root information is available. Assessment, intelligence, communications, tasks, meetings, and activity persistence will be added in later packs.",
      financialReadiness: null, leadershipReadiness: null, lifestyleAlignment: null, coachability: null,
      nextBestAction: "Continue candidate qualification", knownInformation: [
        { label: "Email", value: candidate.email, icon: "email" },
        { label: "Phone", value: candidate.phone || "Not provided", icon: "phone" },
      ], assessment: { label: "Not persisted", detail: "Assessment data is not yet part of production persistence.", invitationSent: false, actionLabel: "Unavailable" },
      activities: [], lifecycleAction: null,
    };
  }

  private lifecycleDetail(stage: CandidateRecord["pipelineStage"]): string {
    const details: Partial<Record<CandidateRecord["pipelineStage"], string>> = {
      lead: "Assessment not completed.", "assessment-started": "Assessment is in progress.", "assessment-completed": "Candidate Intelligence is available and ready to guide Discovery.",
      discovery: "Discovery is in progress.", validation: "Discovery is complete. Validation remains before Brand Strategy.", "brand-matching": "Discovery intelligence is validated and ready to support Brand Strategy.",
      referral: "Candidate is progressing through franchisor introductions.", awarded: "Placement awarded. Referral history is complete.",
    };
    return details[stage] ?? "Candidate relationship history is available.";
  }

  private toActivity(activity: Activity): CandidateActivityState {
    return { id: activity.id, title: activity.title, description: activity.description, timestamp: activity.createdAt,
      dateLabel: formatActivityDate(activity.createdAt), ...activityPresentation[activity.type] };
  }
}
