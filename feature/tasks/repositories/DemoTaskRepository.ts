import type { ConsultantTask } from "../models/ConsultantTask";
import type { TaskRepository } from "./TaskRepository";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";

function localDue(days: number, hour = 12): string {
  const value = new Date();
  value.setHours(hour, 0, 0, 0);
  value.setDate(value.getDate() + days);
  return value.toISOString();
}

function seedTasks(consultantId: string): ConsultantTask[] {
  const createdAt = localDue(-10, 9);
  return [
    { taskId: "task-seed-overdue-mike", consultantId, createdByConsultantId: consultantId, assignedToConsultantId: consultantId, candidateId: "mike-lavalle", title: "Follow up on Discovery concerns", description: "Clarify the remaining family alignment concern before validation.", status: "open", priority: "urgent", dueAt: localDue(-1, 10), source: "discovery", sourceReferenceId: "discovery:mike-lavalle", recommendedReason: "Discovery identified an unresolved family-alignment concern.", createdAt, updatedAt: createdAt },
    { taskId: "task-seed-today-michael", consultantId, createdByConsultantId: consultantId, assignedToConsultantId: consultantId, candidateId: "michael-chen", title: "Prepare for Discovery call", description: "Review the assessment evidence and financial goals.", status: "open", priority: "high", dueAt: localDue(0, 14), source: "consultant", createdAt, updatedAt: createdAt },
    { taskId: "task-seed-upcoming-sarah", consultantId, createdByConsultantId: consultantId, assignedToConsultantId: consultantId, candidateId: "sarah-williams", title: "Check referral acknowledgement", status: "open", priority: "normal", dueAt: localDue(3, 11), source: "referral", sourceReferenceId: "referral:sarah-williams", recommendedReason: "Confirm the brand received the introduction.", createdAt, updatedAt: createdAt },
    { taskId: "task-seed-completed-jared", consultantId, createdByConsultantId: consultantId, assignedToConsultantId: consultantId, candidateId: "jared-wirsig", title: "Send presentation recap", status: "completed", priority: "normal", dueAt: localDue(-3, 16), completedAt: localDue(-3, 15), source: "brand-presentation", sourceReferenceId: "presentation:jared-wirsig", createdAt, updatedAt: localDue(-3, 15) },
  ];
}

export class DemoTaskRepository implements TaskRepository {
  async getAll(consultantId: string): Promise<ConsultantTask[]> {
    const overlay = demoCandidateOverlayStore.getTasks(consultantId);
    const byId = new Map(overlay.map((task) => [task.taskId, task]));
    return seedTasks(consultantId).map((task) => byId.get(task.taskId) ?? task).concat(overlay.filter((task) => !task.taskId.startsWith("task-seed-")));
  }
  async getById(taskId: string): Promise<ConsultantTask | null> {
    const overlay = demoCandidateOverlayStore.getTask(taskId);
    if (overlay) return overlay;
    return seedTasks("consultant-demo").find((task) => task.taskId === taskId) ?? null;
  }
  async save(task: ConsultantTask): Promise<void> { demoCandidateOverlayStore.saveTask(task); }
  async isRecommendationDismissed(id: string): Promise<boolean> { return demoCandidateOverlayStore.isTaskRecommendationDismissed(id); }
  async dismissRecommendation(id: string): Promise<void> { demoCandidateOverlayStore.dismissTaskRecommendation(id); }
}
