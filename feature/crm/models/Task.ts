export type TaskType =
  | "assessment-review"
  | "discovery-call"
  | "follow-up"
  | "brand-research"
  | "brand-presentation"
  | "validation-call"
  | "fdd-delivery"
  | "funding"
  | "meet-the-team"
  | "territory-review"
  | "award"
  | "training"
  | "general";

export type TaskPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type TaskStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface Task {
  id: string;

  candidateId: string;

  consultantId: string;

  type: TaskType;

  title: string;

  description?: string;

  priority: TaskPriority;

  status: TaskStatus;

  dueDate?: string;

  completedAt?: string;

  createdAt: string;

  updatedAt: string;
}