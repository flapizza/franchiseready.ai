"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { ContactAuthorizationError, ContactDuplicateError } from "../models/ContactErrors";
import type { ContactInput, ContactLifecycleStatus } from "../models/Contact";
import { AssessmentRepositoryError } from "@/feature/assessment-engine/production/SupabaseAssessmentRepository";
import { generateAssessmentInvitationAction, type InvitationActionState } from "@/feature/crm/actions/candidate-workflow";

export interface ContactActionState {
  status: "idle" | "validation-error" | "duplicate" | "unavailable" | "success";
  message?: string;
  contactId?: string;
  candidateId?: string;
}

const lifecycleValues = ["prospect", "engaged", "active-candidate", "nurture", "closed-placed", "historical"] as const;
const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(100),
  lastName: z.string().trim().min(1, "Last name is required.").max(100),
  preferredName: z.string().trim().max(100).optional(),
  primaryEmail: z.union([z.literal(""), z.email("Enter a valid email address.")]),
  primaryPhone: z.string().trim().max(40), addressLine1: z.string().trim().max(200),
  addressLine2: z.string().trim().max(200), city: z.string().trim().max(100),
  stateProvince: z.string().trim().max(100), postalCode: z.string().trim().max(20),
  country: z.enum(["US", "CA"]), source: z.string().trim().min(1, "Source is required.").max(100),
  company: z.string().trim().max(200), titleOccupation: z.string().trim().max(200),
  lifecycleStatus: z.enum(lifecycleValues), assignedMembershipId: z.string().trim().optional(),
});

function input(formData: FormData): ContactInput {
  const parsed = schema.safeParse(Object.fromEntries([...formData.entries()].map(([key, value]) => [key, String(value)])));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Review the contact details.");
  return { ...parsed.data, lifecycleStatus: parsed.data.lifecycleStatus as ContactLifecycleStatus };
}

async function repository() {
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved") throw new ContactAuthorizationError("An active workspace is required.");
  return resolution.composition.dependencies.contacts;
}

function failure(error: unknown): ContactActionState {
  if (error instanceof ContactDuplicateError) return { status: "duplicate", message: error.message };
  if (error instanceof ContactAuthorizationError) return { status: "unavailable", message: error.message };
  return { status: "validation-error", message: error instanceof Error ? error.message : "The contact could not be saved." };
}

export async function createContactAction(_state: ContactActionState, formData: FormData): Promise<ContactActionState> {
  try {
    void _state;
    const contactInput = input(formData);
    if (contactInput.lifecycleStatus === "active-candidate") throw new Error("Use Promote to Candidate after creating the contact.");
    const contact = await (await repository()).create(contactInput);
    revalidatePath("/crm/contacts");
    return { status: "success", message: "Contact created.", contactId: contact.id };
  } catch (error) { return failure(error); }
}

export async function updateContactAction(publicId: string, _state: ContactActionState, formData: FormData): Promise<ContactActionState> {
  try {
    void _state;
    const contact = await (await repository()).update(publicId, input(formData));
    revalidatePath("/crm/contacts"); revalidatePath(`/crm/contacts/${publicId}`);
    return { status: "success", message: "Contact updated.", contactId: contact.id };
  } catch (error) { return failure(error); }
}

export async function promoteContactAction(publicId: string, _state: ContactActionState): Promise<ContactActionState> {
  try {
    void _state;
    const candidateId = await (await repository()).promoteToCandidate(publicId);
    revalidatePath("/crm/contacts"); revalidatePath(`/crm/contacts/${publicId}`); revalidatePath("/crm/candidates");
    return { status: "success", message: "Candidate profile created.", contactId: publicId, candidateId };
  } catch (error) { return failure(error); }
}

export interface InviteCandidateState {
  status: "idle" | "error" | "created";
  message?: string;
  contactId?: string;
  invitation?: InvitationActionState;
}

export async function inviteCandidateAction(_state: InviteCandidateState, formData: FormData): Promise<InviteCandidateState> {
  // A saved contact is always resumed explicitly; never recreate it on retry.
  if (_state.contactId) return _state;
  const parsed = z.object({firstName:z.string().trim().min(1).max(100),lastName:z.string().trim().min(1).max(100),
    email:z.email(),phone:z.string().trim().max(40)}).safeParse({
    firstName:String(formData.get("firstName") ?? ""),lastName:String(formData.get("lastName") ?? ""),
    email:String(formData.get("email") ?? "").trim(),phone:String(formData.get("phone") ?? ""),
  });
  if (!parsed.success) return {status:"error",message:"Enter a first name, last name and valid email address. Phone is optional."};
  let contactId: string | undefined;
  try {
    const resolution = await resolveWorkspaceComposition();
    if (resolution.status !== "resolved" || "runtimes" in resolution.composition) return {status:"error",message:"An authenticated consultant workspace is required."};
    contactId = await resolution.composition.dependencies.assessments.createContactForInvitation(parsed.data);
    revalidatePath("/crm/contacts");
    const invitationForm = new FormData(); invitationForm.set("contactId",contactId);
    const invitation = await generateAssessmentInvitationAction({status:"idle"},invitationForm);
    return {status:"created",contactId,invitation,message:invitation.status === "generated"
      ? "Contact saved. Your assessment link is ready to share."
      : "Contact saved, but the invitation could not be prepared. Open the saved contact to continue; do not add the person again."};
  } catch (error) {
    if (contactId) return {status:"created",contactId,message:"Contact saved, but the invitation could not be prepared. Open the saved contact to continue; do not add the person again."};
    if (error instanceof AssessmentRepositoryError && ["P0001","23505"].includes(error.code ?? "")) return {status:"error",message:"These details may belong to an existing person. Review Contacts or Candidates and select the correct record. No new person was created."};
    return {status:"error",message:"The person could not be added. Please review the details and try again."};
  }
}
