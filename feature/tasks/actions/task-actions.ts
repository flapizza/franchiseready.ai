"use server";

import { revalidatePath } from "next/cache";
import { getConferenceDemoUser } from "@/lib/auth/demo-session";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { DemoCandidateActivityRepository } from "@/feature/crm/repositories/DemoCandidateActivityRepository";
import { DemoTaskRepository } from "../repositories/DemoTaskRepository";
import { TaskRuntime } from "../runtime/TaskRuntime";
import { TaskService, TaskValidationError } from "../services/TaskService";
import type { TaskPriority } from "../models/ConsultantTask";

export interface TaskActionState { status: "idle" | "success" | "error"; message?: string; taskId?: string }
const repository = () => new DemoTaskRepository();
const service = () => new TaskService(repository(), new SeedCandidateRepository(), new DemoCandidateActivityRepository());
const refresh = (candidateId?: string) => { revalidatePath("/crm/tasks"); revalidatePath("/crm"); revalidatePath("/crm/candidates"); if (candidateId) revalidatePath(`/crm/candidates/${candidateId}`); };
async function authorized() { return Boolean(await getConferenceDemoUser()); }
function input(formData: FormData) { return { title: String(formData.get("title") ?? ""), description: String(formData.get("description") ?? ""), dueAt: String(formData.get("dueAt") ?? ""), priority: String(formData.get("priority") ?? "normal") as TaskPriority, candidateId: String(formData.get("candidateId") ?? "") || undefined }; }
async function run(operation: () => Promise<{ taskId: string; candidateId?: string }>, message: string): Promise<TaskActionState> {
  if (!(await authorized())) return { status: "error", message: "Your session has expired." };
  try { const task = await operation(); refresh(task.candidateId); return { status: "success", message, taskId: task.taskId }; }
  catch (error) { return { status: "error", message: error instanceof TaskValidationError ? error.message : "The task could not be updated." }; }
}
export async function createTaskAction(_previous: TaskActionState, formData: FormData) { return run(() => service().create(demoConsultant.id, input(formData)), "Task created."); }
export async function updateTaskAction(_previous: TaskActionState, formData: FormData) { return run(() => service().update(demoConsultant.id, String(formData.get("taskId") ?? ""), input(formData)), "Task updated."); }
export async function transitionTaskAction(_previous: TaskActionState, formData: FormData) {
  const taskId = String(formData.get("taskId") ?? ""); const operation = String(formData.get("operation") ?? "");
  const expectedCandidateId = String(formData.get("expectedCandidateId") ?? "");
  if (expectedCandidateId) {
    const task = await repository().getById(taskId);
    if (!task || task.candidateId !== expectedCandidateId) return { status: "error" as const, message: "This task does not belong to that candidate." };
  }
  return run(() => operation === "complete" ? service().complete(demoConsultant.id, taskId) : operation === "cancel" ? service().cancel(demoConsultant.id, taskId) : service().reopen(demoConsultant.id, taskId), operation === "complete" ? "Task completed." : operation === "cancel" ? "Task cancelled." : "Task reopened.");
}
export async function acceptRecommendationAction(_previous: TaskActionState, formData: FormData) {
  const id = String(formData.get("recommendationId") ?? "");
  if (!(await authorized())) return { status: "error" as const, message: "Your session has expired." };
  const state = await new TaskRuntime(repository(), new SeedCandidateRepository()).build(demoConsultant.id);
  const recommendation = state.recommendations.find((item) => item.recommendationId === id);
  if (!recommendation) return { status: "error" as const, message: "Recommendation is no longer available." };
  return run(() => service().accept(demoConsultant.id, recommendation, String(formData.get("dueAt") ?? "") || undefined), "Task created from recommendation.");
}
export async function dismissRecommendationAction(_previous: TaskActionState, formData: FormData): Promise<TaskActionState> {
  if (!(await authorized())) return { status: "error", message: "Your session has expired." };
  const id = String(formData.get("recommendationId") ?? ""); const repo = repository();
  const recommendation = (await new TaskRuntime(repo, new SeedCandidateRepository()).build(demoConsultant.id)).recommendations.find((item) => item.recommendationId === id);
  if (!recommendation) return { status: "error", message: "Recommendation is no longer available." };
  await service().dismiss(demoConsultant.id, recommendation); refresh(recommendation.candidateId); return { status: "success", message: "Recommendation dismissed." };
}
