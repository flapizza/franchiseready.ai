import type { ConsultantTask } from "../models/ConsultantTask";
import type { TaskRepository } from "./TaskRepository";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import { conferenceDemoIso } from "@/feature/demo/time/conferenceDemoClock";

function seedTasks(consultantId: string): ConsultantTask[] {
  const createdAt = conferenceDemoIso(-10, 9);
  return [
    { taskId: "task-seed-overdue-mike", consultantId, createdByConsultantId: consultantId, assignedToConsultantId: consultantId, candidateId: "mike-lavalle", title: "Follow up on Discovery concerns", description: "Clarify ownership motivation and decision timing before validation.", status: "open", priority: "urgent", dueAt: conferenceDemoIso(-1, 10), source: "discovery", sourceReferenceId: "discovery:mike-lavalle", recommendedReason: "Discovery identified unresolved ownership-motivation and timeline questions.", createdAt, updatedAt: createdAt },
    { taskId: "task-seed-today-michael", consultantId, createdByConsultantId: consultantId, assignedToConsultantId: consultantId, candidateId: "michael-chen", title: "Prepare for Discovery call", description: "Review the assessment evidence and financial goals.", status: "open", priority: "high", dueAt: conferenceDemoIso(0, 15), source: "consultant", createdAt, updatedAt: createdAt },
    { taskId: "task-seed-upcoming-sarah", consultantId, createdByConsultantId: consultantId, assignedToConsultantId: consultantId, candidateId: "sarah-williams", title: "Review prepared referral package", status: "open", priority: "normal", dueAt: conferenceDemoIso(3, 11), source: "referral", sourceReferenceId: "referral:sarah-williams", recommendedReason: "Review and approve the prepared ERA Group introduction.", createdAt, updatedAt: createdAt },
    { taskId: "task-seed-completed-jared", consultantId, createdByConsultantId: consultantId, assignedToConsultantId: consultantId, candidateId: "jared-wirsig", title: "Send presentation recap", status: "completed", priority: "normal", dueAt: conferenceDemoIso(-3, 16), completedAt: conferenceDemoIso(-3, 15), source: "brand-presentation", sourceReferenceId: "presentation:jared-wirsig", createdAt, updatedAt: conferenceDemoIso(-3, 15) },
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
