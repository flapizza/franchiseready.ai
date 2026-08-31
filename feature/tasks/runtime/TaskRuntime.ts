import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import type { TaskRepository } from "../repositories/TaskRepository";
import type { ConsultantTask } from "../models/ConsultantTask";
import type { TaskFilter, TaskView, TaskWorkspaceState } from "../models/TaskWorkspaceState";
import { FollowUpRecommendationService } from "../services/FollowUpRecommendationService";

const priorityRank = { urgent: 0, high: 1, normal: 2, low: 3 } as const;
const sourceLabel: Record<ConsultantTask["source"], string> = { consultant: "Created by you", "ai-recommendation": "FranGroove recommendation", "email-engagement": "Email engagement", "engagement-playbook": "Engagement Playbook", discovery: "Discovery", "brand-presentation": "Brand Presentation", referral: "Referral Studio", lifecycle: "Lifecycle", system: "System" };

function localDay(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
}
function view(task: ConsultantTask, names: Map<string, string>, now: Date): TaskView {
  const due = new Date(task.dueAt);
  const today = localDay(now) === localDay(due);
  return { ...task, dueLabel: new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(due), sourceLabel: sourceLabel[task.source], candidateName: task.candidateId ? names.get(task.candidateId) : undefined, candidateHref: task.candidateId ? `/crm/candidates/${task.candidateId}` : undefined, overdue: task.status === "open" && due.getTime() < now.getTime(), dueToday: task.status === "open" && today };
}
function sort(left: TaskView, right: TaskView): number {
  const group = (task: TaskView) => task.overdue && priorityRank[task.priority] <= 1 ? 0 : task.dueToday && priorityRank[task.priority] <= 1 ? 1 : task.dueToday ? 2 : task.status === "open" ? 3 : 4;
  return group(left) - group(right) || Date.parse(left.dueAt) - Date.parse(right.dueAt) || priorityRank[left.priority] - priorityRank[right.priority] || left.taskId.localeCompare(right.taskId);
}

export class TaskRuntime {
  constructor(private readonly tasks: TaskRepository, private readonly candidates: CandidateRepository, private readonly now: () => Date = () => new Date()) {}
  async build(consultantId: string, now = this.now()): Promise<TaskWorkspaceState> {
    const candidates = (await this.candidates.getAll()).filter((candidate) => candidate.consultantId === consultantId);
    const names = new Map(candidates.map((candidate) => [candidate.id, `${candidate.firstName} ${candidate.lastName}`]));
    const taskViews = (await this.tasks.getAll(consultantId)).map((task) => view(task, names, now)).sort(sort);
    const count = (filter: TaskFilter) => taskViews.filter((task) => filter === "all" || filter === "completed" ? (filter === "all" ? true : task.status === "completed") : filter === "overdue" ? task.overdue : filter === "today" ? task.dueToday : task.status === "open" && !task.overdue && !task.dueToday).length;
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(9, 0, 0, 0);
    return { tasks: taskViews, recommendations: await new FollowUpRecommendationService(this.tasks, this.now).build(consultantId, candidates), candidates: [...names].map(([candidateId, name]) => ({ candidateId, name })).sort((a, b) => a.name.localeCompare(b.name)), counts: { today: count("today"), upcoming: count("upcoming"), overdue: count("overdue"), completed: count("completed"), all: count("all") }, defaultDueAt: tomorrow.toISOString() };
  }
  async forCandidate(consultantId: string, candidateId: string, now = this.now()) {
    const state = await this.build(consultantId, now);
    return { tasks: state.tasks.filter((task) => task.candidateId === candidateId).slice(0, 4), recommendations: state.recommendations.filter((item) => item.candidateId === candidateId), defaultDueAt: state.defaultDueAt };
  }
}
