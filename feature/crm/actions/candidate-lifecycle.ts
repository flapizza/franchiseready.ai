"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

export interface LifecycleActionState { status: "idle" | "success" | "invalid-transition" | "candidate-not-found" | "no-action"; message?: string }

export async function advanceCandidateLifecycleAction(_previous: LifecycleActionState, formData: FormData): Promise<LifecycleActionState> {
  const candidateId = String(formData.get("candidateId") ?? "");
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return {status:"no-action",message:"Candidate lifecycle updates are not available in this workspace."};
  const repository = resolution.composition.dependencies.candidates;
  const candidate = await repository.getById(candidateId);
  if (!candidate) return { status: "candidate-not-found", message: "Candidate not found." };

  const lifecycleService = resolution.composition.runtimes.createCandidateLifecycle();
  const action = lifecycleService.getRecommendedAction(candidate);
  if (!action) return { status: "no-action", message: "No lifecycle transition is currently available." };
  const result = await lifecycleService.transition({ candidateId, targetStage: action.targetStage, context: { kind: action.kind, reason: action.reason } });
  if (result.status !== "success") return { status: result.status, message: result.status === "invalid-transition" ? result.reason : "Candidate not found." };

  revalidatePath("/crm");
  revalidatePath("/crm/candidates");
  revalidatePath(`/crm/candidates/${candidateId}`);
  if (action.returnPath) redirect(action.returnPath);
  return { status: "success", message: `${action.label} completed.` };
}
