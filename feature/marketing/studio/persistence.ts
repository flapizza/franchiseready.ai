import type { Campaign, CampaignContent } from "../models/Marketing";
import { z } from "zod";
import { contentSchema } from "../models/validation.ts";
import { parseEmailDocument, type EmailDocument } from "./document.ts";

export type UnsupportedContent = { version: -1; original: unknown };
export type StoredContent = CampaignContent | EmailDocument | UnsupportedContent;
export function readContent(value: unknown): StoredContent {
  try {
    if (value && typeof value === "object" && "version" in value && value.version === 2) return parseEmailDocument(value);
    // V1 empty drafts are valid database records even though the send validator requires body text.
    return contentSchema.extend({ body: z.string().max(20000) }).strict().parse(value);
  } catch { return { version: -1, original: value }; }
}
export function assertCampaignWritable(existing: Campaign | undefined, expectedUpdatedAt?: string) {
  if (!existing) throw new Error("Campaign not found.");
  if (existing.status === "sent" || existing.status === "sending") throw new Error("Sent and sending campaign content is read-only. Create a new draft copy.");
  if (!expectedUpdatedAt || existing.updatedAt !== expectedUpdatedAt) throw new Error("This campaign changed in another tab. Reload before saving; your unsaved content is still here.");
}
export function assertV1Delivery(content: StoredContent): asserts content is CampaignContent {
  if (content.version !== 1) throw new Error("Visual campaigns are draft and preview only. V2 delivery is not enabled.");
}
