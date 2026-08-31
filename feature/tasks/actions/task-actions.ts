"use server";

import { revalidatePath } from "next/cache";
import { TaskValidationError } from "../services/TaskService";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import type { DemoWorkspaceComposition } from "@/feature/platform/composition/DemoWorkspaceComposition";
import type { TaskPriority } from "../models/ConsultantTask";

export interface TaskActionState { status: "idle" | "success" | "error"; message?: string; taskId?: string }
const refresh = (candidateId?: string) => { revalidatePath("/crm/tasks"); revalidatePath("/crm"); revalidatePath("/crm/candidates"); if (candidateId) revalidatePath(`/crm/candidates/${candidateId}`); };
async function demo():Promise<DemoWorkspaceComposition|null>{const value=await resolveWorkspaceComposition();return value.status==="resolved"&&"runtimes" in value.composition?value.composition:null;}
function input(formData: FormData) { return { title: String(formData.get("title") ?? ""), description: String(formData.get("description") ?? ""), dueAt: String(formData.get("dueAt") ?? ""), priority: String(formData.get("priority") ?? "normal") as TaskPriority, candidateId: String(formData.get("candidateId") ?? "") || undefined }; }
async function run(operation: (composition:DemoWorkspaceComposition) => Promise<{ taskId: string; candidateId?: string }>, message: string): Promise<TaskActionState> {
  const composition=await demo();if(!composition) return { status: "error", message: "Tasks are not available in this workspace." };
  try { const task = await operation(composition); refresh(task.candidateId); return { status: "success", message, taskId: task.taskId }; }
  catch (error) { return { status: "error", message: error instanceof TaskValidationError ? error.message : "The task could not be updated." }; }
}
export async function createTaskAction(_previous: TaskActionState, formData: FormData) { return run((c) => c.runtimes.createTaskService().create(c.runtimes.consultant.id, input(formData)), "Task created."); }
export async function updateTaskAction(_previous: TaskActionState, formData: FormData) { return run((c) => c.runtimes.createTaskService().update(c.runtimes.consultant.id, String(formData.get("taskId") ?? ""), input(formData)), "Task updated."); }
export async function transitionTaskAction(_previous: TaskActionState, formData: FormData) {
  const taskId = String(formData.get("taskId") ?? ""); const operation = String(formData.get("operation") ?? "");
  const expectedCandidateId = String(formData.get("expectedCandidateId") ?? "");
  if (expectedCandidateId) {
    const composition=await demo();if(!composition)return {status:"error" as const,message:"Tasks are not available in this workspace."};const task = await composition.dependencies.tasks.getById(taskId);
    if (!task || task.candidateId !== expectedCandidateId) return { status: "error" as const, message: "This task does not belong to that candidate." };
  }
  return run((c) => operation === "complete" ? c.runtimes.createTaskService().complete(c.runtimes.consultant.id, taskId) : operation === "cancel" ? c.runtimes.createTaskService().cancel(c.runtimes.consultant.id, taskId) : c.runtimes.createTaskService().reopen(c.runtimes.consultant.id, taskId), operation === "complete" ? "Task completed." : operation === "cancel" ? "Task cancelled." : "Task reopened.");
}
export async function acceptRecommendationAction(_previous: TaskActionState, formData: FormData) {
  const id = String(formData.get("recommendationId") ?? "");
  const composition=await demo();if(!composition)return {status:"error" as const,message:"Tasks are not available in this workspace."};
  const state = await composition.runtimes.createTasks().build(composition.runtimes.consultant.id);
  const recommendation = state.recommendations.find((item) => item.recommendationId === id);
  if (!recommendation) return { status: "error" as const, message: "Recommendation is no longer available." };
  return run((c) => c.runtimes.createTaskService().accept(c.runtimes.consultant.id, recommendation, String(formData.get("dueAt") ?? "") || undefined), "Task created from recommendation.");
}
export async function dismissRecommendationAction(_previous: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const composition=await demo();if(!composition)return {status:"error",message:"Tasks are not available in this workspace."};
  const id = String(formData.get("recommendationId") ?? "");
  const recommendation = (await composition.runtimes.createTasks().build(composition.runtimes.consultant.id)).recommendations.find((item) => item.recommendationId === id);
  if (!recommendation) return { status: "error", message: "Recommendation is no longer available." };
  await composition.runtimes.createTaskService().dismiss(composition.runtimes.consultant.id, recommendation); refresh(recommendation.candidateId); return { status: "success", message: "Recommendation dismissed." };
}
