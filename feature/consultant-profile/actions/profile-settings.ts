"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";

const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);
const optionalUrl = z.string().trim().max(500).refine((value) => !value || z.url().safeParse(value).success, "Enter a valid URL.").transform((value) => value || null);
const optionalEmail = z.string().trim().max(254).refine((value) => !value || z.email().safeParse(value).success, "Enter a valid email.").transform((value) => value || null);
const schema = z.object({
  displayName: optionalText(120), professionalTitle: optionalText(160), professionalEmail: optionalEmail,
  professionalPhone: optionalText(40), linkedInUrl: optionalUrl, schedulingUrl: optionalUrl,
  organizationDisplayName: optionalText(200), websiteUrl: optionalUrl,
});

export async function saveProfileSettings(formData: FormData): Promise<void> {
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved" || resolution.session.kind !== "production") throw new Error("An authenticated production workspace is required.");
  if (!("consultantProfile" in resolution.composition.dependencies)) throw new Error("Production profile composition is unavailable.");
  const input = schema.parse(Object.fromEntries(formData));
  await resolution.composition.dependencies.consultantProfile.saveOwn(input);
  if (["owner", "admin"].includes(resolution.session.membership.role)) {
    await resolution.composition.dependencies.organizationSettings.save({ displayName: input.organizationDisplayName, websiteUrl: input.websiteUrl });
  }
  revalidatePath("/settings/profile");
}
