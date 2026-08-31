"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveProductionWorkspaceSession } from "@/feature/platform/composition/ProductionWorkspaceSessionResolver";
import { ProductionWorkspaceBootstrapService } from "../services/ProductionWorkspaceBootstrapService";

export interface BootstrapActionState { status: "idle" | "error"; message: string; }

const schema = z.object({
  organizationName: z.string().trim().min(1, "Enter your organization name.").max(200, "Organization name must be 200 characters or fewer."),
  consultantDisplayName: z.string().trim().min(1, "Enter your display name.").max(120, "Display name must be 120 characters or fewer."),
});

export async function bootstrapWorkspace(_state: BootstrapActionState, formData: FormData): Promise<BootstrapActionState> {
  const parsed = schema.safeParse({ organizationName: formData.get("organizationName"), consultantDisplayName: formData.get("consultantDisplayName") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the workspace details." };
  const resolution = await resolveProductionWorkspaceSession();
  if (resolution.status === "unauthenticated") return { status: "error", message: "Your session has expired. Sign in again." };
  if (resolution.status !== "needs-workspace-bootstrap") return { status: "error", message: "This account is not eligible to create a first workspace." };
  try {
    await new ProductionWorkspaceBootstrapService(await createServerSupabaseClient()).bootstrap(parsed.data);
  } catch {
    return { status: "error", message: "The workspace could not be created. Refresh and try again." };
  }
  redirect("/crm");
}
