"use server";

import { revalidatePath } from "next/cache";
import { CandidateIntakeService } from "../services/CandidateIntakeService";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { createAssessmentToken, hashAssessmentToken } from "@/feature/assessment-engine/production/token";
import { getPublicEnvironment } from "@/lib/env";

export interface CandidateFormState {
  status: "idle" | "validation-error" | "unavailable" | "created" | "exact-match" | "possible-match";
  message?: string;
  candidateId?: string;
  candidateName?: string;
  candidateIds?: string[];
}

export async function createCandidateAction(_previous: CandidateFormState, formData: FormData): Promise<CandidateFormState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!firstName || !lastName || !/^\S+@\S+\.\S+$/.test(email)) return { status: "validation-error", message: "Enter a first name, last name, and valid email address." };

  const resolution = await resolveWorkspaceComposition();
  if (resolution.status!=="resolved") return { status: "validation-error", message: "An active workspace is required." };
  const composition=resolution.composition;const repository=composition.dependencies.candidates;
  const service = new CandidateIntakeService(repository, composition.dependencies.candidateResolution, "runtimes" in composition ? composition.dependencies.candidateIntakeActivities : undefined);
  try {
    const result = await service.create({
    consultantId: "runtimes" in composition ? composition.runtimes.consultant.id : composition.session.membership.id, firstName, lastName, email,
    phone: String(formData.get("phone") ?? ""), city: String(formData.get("city") ?? ""), state: String(formData.get("state") ?? ""),
    preferredTerritory: String(formData.get("preferredTerritory") ?? ""), leadSource: String(formData.get("leadSource") ?? ""), notes: String(formData.get("notes") ?? ""),
  });
    if (result.status === "possible-match") return { status: "possible-match", message: "Possible duplicate candidates require review before creation.", candidateIds: result.candidateIds };
    const candidate = result.candidate;
    revalidatePath("/crm/candidates");
    return { status: result.status, candidateId: candidate.id, candidateName: `${candidate.firstName} ${candidate.lastName}`, message: result.status === "created" ? "Candidate created." : "An existing candidate matches this identity. No duplicate was created." };
  } catch {
    return "runtimes" in composition
      ? { status: "validation-error", message: "Candidate could not be created." }
      : { status: "unavailable", message: "Production candidate identity resolution is not implemented. No demo matching was used." };
  }
}

export interface InvitationActionState { status: "idle" | "sent" | "error"; message?: string; url?: string; candidateId?: string }

export async function sendAssessmentInvitationAction(_previous: InvitationActionState, formData: FormData): Promise<InvitationActionState> {
  const candidateId = String(formData.get("candidateId") ?? "");
  try {
    const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved")return {status:"error",message:"An active workspace is required."};const composition=resolution.composition;
    if (!("runtimes" in composition)) {
      const token=createAssessmentToken();
      await composition.dependencies.assessments.createInvitation(candidateId,hashAssessmentToken(token),new Date(Date.now()+14*86400000).toISOString());
      revalidatePath(`/crm/candidates/${candidateId}`);
      return {status:"sent",message:"Assessment invitation created",url:`${getPublicEnvironment().APP_URL}/assessment/invitation/${token}`,candidateId};
    }
    const invitation = await composition.runtimes.createAssessmentInvitations().send(candidateId);
    revalidatePath("/crm/candidates");
    revalidatePath(`/crm/candidates/${candidateId}`);
    return { status: "sent", message: "Assessment Invitation Sent", url: invitation.assessmentUrl, candidateId };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Could not send the invitation." };
  }
}
