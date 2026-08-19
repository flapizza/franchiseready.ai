export type TaskStatus = "open" | "completed" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";
export type TaskSource = "consultant" | "ai-recommendation" | "email-engagement" | "discovery" | "brand-presentation" | "referral" | "lifecycle" | "system";

export interface ConsultantTask {
  taskId: string;
  consultantId: string;
  createdByConsultantId: string;
  assignedToConsultantId: string;
  candidateId?: string;
  brandId?: string;
  referralId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string;
  completedAt?: string;
  source: TaskSource;
  sourceReferenceId?: string;
  recommendedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpRecommendation {
  recommendationId: string;
  consultantId: string;
  candidateId: string;
  title: string;
  reason: string;
  priority: TaskPriority;
  suggestedDueAt: string;
  source: Exclude<TaskSource, "consultant" | "system">;
  sourceReferenceId: string;
  actionType: "create-task";
  acceptedTaskId?: string;
}
