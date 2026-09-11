import { brandingSchema } from "../media/model.ts";
import { z } from "zod";
import { contentSchema, invalidTokens } from "../models/validation.ts";
import { parseEmailDocument } from "./document.ts";

const envelope = z.object({ brandingSnapshot: brandingSchema.nullable().optional(), refreshBranding: z.boolean().optional(), id: z.string().max(100), name: z.string().trim().min(1).max(120), description: z.string().max(1000), subject: z.string().max(180), previewText: z.string().max(220), senderName: z.string().max(120), replyTo: z.string().max(320), audienceType: z.enum(["segment", "list"]).nullable(), audienceId: z.string().max(100), content: z.unknown(), status: z.enum(["draft", "ready"]), expectedUpdatedAt: z.string().optional() });
export function parseCampaignSave(value: unknown) {
  const x = envelope.parse(value);
  const v2 = x.content && typeof x.content === "object" && "version" in x.content && x.content.version === 2;
  const content = v2 ? parseEmailDocument(x.content) : contentSchema.parse(x.content);
  if (v2 && x.status !== "draft") throw new Error("Visual campaigns are draft and preview only. V2 delivery is not enabled.");
  const tokenSource = content.version === 1 ? content : { version: 1 as const, heading: "", body: JSON.stringify(content), ctaLabel: "", ctaUrl: "", footer: "" };
  if (invalidTokens(tokenSource, x.subject, x.previewText).length) throw new Error("Remove unsupported personalization tokens.");
  return { ...x, content };
}
