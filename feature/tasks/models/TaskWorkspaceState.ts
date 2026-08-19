import type { FollowUpRecommendation, TaskPriority, TaskSource, TaskStatus } from "./ConsultantTask";

export type TaskFilter = "today" | "upcoming" | "overdue" | "completed" | "all";
export interface TaskView {
  taskId: string; title: string; description?: string; status: TaskStatus; priority: TaskPriority; dueAt: string; dueLabel: string;
  completedAt?: string; source: TaskSource; sourceLabel: string; recommendedReason?: string; candidateId?: string; candidateName?: string;
  candidateHref?: string; overdue: boolean; dueToday: boolean;
}
export interface TaskWorkspaceState {
  tasks: TaskView[];
  recommendations: FollowUpRecommendation[];
  candidates: Array<{ candidateId: string; name: string }>;
  counts: Record<TaskFilter, number>;
  defaultDueAt: string;
}
