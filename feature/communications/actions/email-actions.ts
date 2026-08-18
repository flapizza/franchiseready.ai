"use server";
import { revalidatePath } from "next/cache";
import { EmailMessageService } from "../services/EmailMessageService";

export interface EmailActionState { status: "idle" | "success" | "error"; message?: string; messageId?: string }
const refresh = (candidateId: string) => { revalidatePath(`/crm/candidates/${candidateId}`); revalidatePath("/crm"); };

export async function sendCandidateEmail(_state: EmailActionState, formData: FormData): Promise<EmailActionState> {
  const candidateId = String(formData.get("candidateId") ?? "");
  try { const email = await new EmailMessageService().send({ candidateId, subject: String(formData.get("subject") ?? ""), body: String(formData.get("body") ?? ""), idempotencyKey: String(formData.get("idempotencyKey") ?? "") }); refresh(candidateId);
    return { status: email.deliveryStatus === "failed" ? "error" : "success", message: email.deliveryStatus === "failed" ? "Delivery failed. Your message was preserved for retry." : "Demo delivery recorded. No external email was sent.", messageId: email.messageId };
  } catch (error) { return { status: "error", message: error instanceof Error ? error.message : "Email could not be sent." }; }
}
export async function retryCandidateEmail(_state: EmailActionState, formData: FormData): Promise<EmailActionState> {
  const candidateId = String(formData.get("candidateId") ?? ""); const messageId = String(formData.get("messageId") ?? "");
  try { const email = await new EmailMessageService().retry(candidateId, messageId); refresh(candidateId); return { status: email.deliveryStatus === "failed" ? "error" : "success", message: email.deliveryStatus === "failed" ? "Delivery failed again." : "Demo delivery completed without creating another message.", messageId }; }
  catch (error) { return { status: "error", message: error instanceof Error ? error.message : "Email could not be retried." }; }
}
