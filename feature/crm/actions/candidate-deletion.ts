"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

export type CandidateDeletionState = { status: "idle" | "error"; message?: string };

export async function deleteCandidateAction(
  _previous: CandidateDeletionState,
  formData: FormData,
): Promise<CandidateDeletionState> {
  const candidateId = String(formData.get("candidateId") ?? "").trim();
  if (!candidateId || formData.get("confirmed") !== "yes") {
    return { status: "error", message: "Confirm candidate deletion before continuing." };
  }

  try {
    const resolution = await resolveWorkspaceComposition();
    if (resolution.status!=="resolved") return { status: "error", message: "An active workspace is required." };
    await resolution.composition.dependencies.candidates.deleteById(candidateId);
  } catch {
    return { status: "error", message: "Candidate could not be deleted. Related records may need to be retained." };
  }

  revalidatePath("/crm/candidates");
  revalidatePath(`/crm/candidates/${candidateId}`);
  redirect("/crm/candidates");
}
