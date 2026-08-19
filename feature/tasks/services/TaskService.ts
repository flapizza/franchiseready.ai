import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import type { CandidateActivityRepository } from "@/feature/crm/repositories/CandidateActivityRepository";
import type { ConsultantTask, FollowUpRecommendation, TaskPriority } from "../models/ConsultantTask";
import type { TaskRepository } from "../repositories/TaskRepository";

export class TaskValidationError extends Error {}

export interface TaskInput {
  title: string;
  description?: string;
  dueAt: string;
  priority: TaskPriority;
  candidateId?: string;
}

const priorities = new Set<TaskPriority>(["low", "normal", "high", "urgent"]);

export class TaskService {
  constructor(private readonly tasks: TaskRepository, private readonly candidates: CandidateRepository, private readonly activities: CandidateActivityRepository) {}

  async create(consultantId: string, input: TaskInput, provenance: Pick<ConsultantTask, "source" | "sourceReferenceId" | "recommendedReason"> = { source: "consultant" }): Promise<ConsultantTask> {
    await this.validate(consultantId, input);
    if (provenance.sourceReferenceId) {
      const existing = (await this.tasks.getAll(consultantId)).find((task) => task.status !== "cancelled" && task.sourceReferenceId === provenance.sourceReferenceId);
      if (existing) return existing;
    }
    const now = new Date().toISOString();
    const task: ConsultantTask = { taskId: `task-${crypto.randomUUID()}`, consultantId, createdByConsultantId: consultantId, assignedToConsultantId: consultantId, candidateId: input.candidateId || undefined, title: input.title.trim(), description: input.description?.trim() || undefined, status: "open", priority: input.priority, dueAt: new Date(input.dueAt).toISOString(), ...provenance, createdAt: now, updatedAt: now };
    await this.tasks.save(task);
    await this.activity(task, "task-created", "Task Created");
    return task;
  }

  async update(consultantId: string, taskId: string, input: TaskInput): Promise<ConsultantTask> {
    const task = await this.owned(consultantId, taskId);
    await this.validate(consultantId, input);
    const updated = { ...task, candidateId: input.candidateId || undefined, title: input.title.trim(), description: input.description?.trim() || undefined, priority: input.priority, dueAt: new Date(input.dueAt).toISOString(), updatedAt: new Date().toISOString() };
    await this.tasks.save(updated);
    return updated;
  }

  async complete(consultantId: string, taskId: string): Promise<ConsultantTask> { return this.transition(consultantId, taskId, "completed"); }
  async cancel(consultantId: string, taskId: string): Promise<ConsultantTask> { return this.transition(consultantId, taskId, "cancelled"); }
  async reopen(consultantId: string, taskId: string): Promise<ConsultantTask> { return this.transition(consultantId, taskId, "open"); }

  async accept(consultantId: string, recommendation: FollowUpRecommendation, dueAt?: string): Promise<ConsultantTask> {
    if (recommendation.consultantId !== consultantId) throw new TaskValidationError("Invalid recommendation owner.");
    return this.create(consultantId, { title: recommendation.title, dueAt: dueAt || recommendation.suggestedDueAt, priority: recommendation.priority, candidateId: recommendation.candidateId }, { source: recommendation.source, sourceReferenceId: recommendation.recommendationId, recommendedReason: recommendation.reason });
  }

  async dismiss(consultantId: string, recommendation: FollowUpRecommendation): Promise<void> {
    if (recommendation.consultantId !== consultantId) throw new TaskValidationError("Invalid recommendation owner.");
    await this.tasks.dismissRecommendation(recommendation.recommendationId);
  }

  private async transition(consultantId: string, taskId: string, status: ConsultantTask["status"]): Promise<ConsultantTask> {
    const task = await this.owned(consultantId, taskId);
    const now = new Date().toISOString();
    const updated = { ...task, status, completedAt: status === "completed" ? now : undefined, updatedAt: now };
    await this.tasks.save(updated);
    if (status === "completed") await this.activity(updated, "task-completed", "Task Completed");
    if (status === "cancelled") await this.activity(updated, "task-cancelled", "Task Cancelled");
    return updated;
  }

  private async owned(consultantId: string, taskId: string): Promise<ConsultantTask> {
    const task = await this.tasks.getById(taskId);
    if (!task || task.consultantId !== consultantId) throw new TaskValidationError("Task not found.");
    return task;
  }

  private async validate(consultantId: string, input: TaskInput): Promise<void> {
    if (!input.title.trim()) throw new TaskValidationError("Task title is required.");
    if (!priorities.has(input.priority)) throw new TaskValidationError("Choose a valid priority.");
    if (!input.dueAt || Number.isNaN(Date.parse(input.dueAt))) throw new TaskValidationError("Choose a valid due date.");
    if (input.candidateId) {
      const candidate = await this.candidates.getById(input.candidateId);
      if (!candidate || candidate.consultantId !== consultantId) throw new TaskValidationError("Candidate not found for this consultant.");
    }
  }

  private async activity(task: ConsultantTask, type: "task-created" | "task-completed" | "task-cancelled", title: string): Promise<void> {
    if (!task.candidateId) return;
    await this.activities.add({ id: `${type}:${task.taskId}:${task.updatedAt}`, candidateId: task.candidateId, consultantId: task.consultantId, type, title, description: task.title, createdAt: task.updatedAt, metadata: { taskId: task.taskId } });
  }
}
