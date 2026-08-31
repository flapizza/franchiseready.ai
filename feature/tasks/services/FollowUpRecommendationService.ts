import type { CandidateRecord } from "@/feature/crm/models/CandidateRecord";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import { EmailCommunicationRuntime } from "@/feature/communications/runtime/EmailCommunicationRuntime";
import type { FollowUpRecommendation, TaskPriority, TaskSource } from "../models/ConsultantTask";
import type { TaskRepository } from "../repositories/TaskRepository";

export class FollowUpRecommendationService {
  constructor(private readonly tasks: TaskRepository, private readonly now: () => Date = () => new Date()) {}

  async build(consultantId: string, candidates: CandidateRecord[]): Promise<FollowUpRecommendation[]> {
    const recommendations: FollowUpRecommendation[] = [];
    for (const candidate of candidates.filter((item) => item.consultantId === consultantId && item.status === "active")) {
      const fullName = `${candidate.firstName} ${candidate.lastName}`;
      const engaged = new EmailCommunicationRuntime().load(candidate.id).find((message) => message.engagementLabel === "High engagement");
      if (engaged) recommendations.push(this.item(consultantId, candidate.id, `Follow up with ${fullName} after email engagement`, `${engaged.mostRecentEngagement ?? "The candidate showed strong engagement"}. Follow up while interest is active.`, "high", "email-engagement", `email:${engaged.messageId}`, 0));
      if (candidate.pipelineStage === "discovery" && candidate.intelligence?.discoveryPriorities.length) recommendations.push(this.item(consultantId, candidate.id, `Resolve Discovery follow-up with ${fullName}`, candidate.intelligence.discoveryPriorities[0], "high", "discovery", `discovery:${candidate.id}`, 1));
      const strategy = demoCandidateOverlayStore.getStrategy(candidate.id);
      if (strategy?.decisions.some((decision) => decision.presentedAt && (decision.candidateReaction === "neutral" || decision.candidateReaction === "not-interested"))) recommendations.push(this.item(consultantId, candidate.id, `Review ${fullName}'s presentation concern`, "A presented brand received a concern response that merits consultant follow-up.", "normal", "brand-presentation", `presentation:${candidate.id}`, 1));
      const sent = demoCandidateOverlayStore.getCandidateReferrals(candidate.id).find((referral) => referral.status === "sent" || referral.status === "introduced");
      if (sent) recommendations.push(this.item(consultantId, candidate.id, `Confirm referral acknowledgement for ${fullName}`, `Follow up after the ${sent.brandName} introduction.`, "normal", "referral", `referral:${sent.referralId}`, 3));
    }
    const tasks = await this.tasks.getAll(consultantId);
    const visible: FollowUpRecommendation[] = [];
    for (const recommendation of recommendations) {
      if (await this.tasks.isRecommendationDismissed(recommendation.recommendationId)) continue;
      const accepted = tasks.find((task) => task.sourceReferenceId === recommendation.recommendationId);
      visible.push({ ...recommendation, acceptedTaskId: accepted?.taskId });
    }
    return visible;
  }

  private item(consultantId: string, candidateId: string, title: string, reason: string, priority: TaskPriority, source: Exclude<TaskSource, "consultant" | "system">, sourceReferenceId: string, days: number): FollowUpRecommendation {
    const dueAt = this.now(); dueAt.setHours(12, 0, 0, 0); dueAt.setDate(dueAt.getDate() + days);
    return { recommendationId: `recommendation:${sourceReferenceId}`, consultantId, candidateId, title, reason, priority, suggestedDueAt: dueAt.toISOString(), source, sourceReferenceId, actionType: "create-task" };
  }
}
