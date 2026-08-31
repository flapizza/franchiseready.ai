"use server";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProductionMembershipInvitationService } from "../services/ProductionMembershipInvitationService";

export interface InvitationActionState { status: "idle" | "error" | "created"; message: string; acceptancePath?: string; }
const createSchema = z.object({ email: z.email("Enter a valid recipient email.").max(254), role: z.enum(["consultant", "admin"]) });

export async function createInvitation(_state: InvitationActionState, formData: FormData): Promise<InvitationActionState> {
  const parsed = createSchema.safeParse({ email: formData.get("email"), role: formData.get("role") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the invitation." };
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved" || resolution.session.kind !== "production") return { status: "error", message: "An active production workspace is required." };
  if (!["owner", "admin"].includes(resolution.session.membership.role)) return { status: "error", message: "Organization leadership is required." };
  if (parsed.data.role === "admin" && resolution.session.membership.role !== "owner") return { status: "error", message: "Only an owner may invite an administrator." };
  const token = randomBytes(32).toString("base64url");
  try {
    await new ProductionMembershipInvitationService(await createServerSupabaseClient()).create({ organizationId: resolution.session.organization.id, email: parsed.data.email, role: parsed.data.role, token });
    return { status: "created", message: "Invitation created. Email delivery is not configured; share this link securely.", acceptancePath: `/invite/${token}` };
  } catch { return { status: "error", message: "The invitation could not be created. The recipient may already be a member." }; }
}

export async function acceptInvitation(_state: InvitationActionState, formData: FormData): Promise<InvitationActionState> {
  const token = String(formData.get("token") ?? "");
  try { await new ProductionMembershipInvitationService(await createServerSupabaseClient()).accept(token); }
  catch { return { status: "error", message: "This invitation could not be accepted for the signed-in account." }; }
  redirect("/crm");
}
