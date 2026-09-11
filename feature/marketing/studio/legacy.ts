import type { CampaignContent } from "../models/Marketing";
import { emptyEmailDocument, mergeFields, parseEmailDocument, type Inline, type EmailBlock } from "./document.ts";

function inlines(text: string): Inline[] {
  return text.split(/(\n|{{\s*(?:first_name|preferred_name|consultant_name)\s*}})/).filter(Boolean).map(part => {
    if (part === "\n") return { type: "hardBreak" };
    const field = /^{{\s*(\w+)\s*}}$/.exec(part)?.[1];
    if (field && mergeFields.includes(field as typeof mergeFields[number])) return { type: "mergeField", attrs: { field: field as typeof mergeFields[number] } };
    return { type: "text", text: part };
  });
}
export function visualCopy(content: CampaignContent) {
  const result = emptyEmailDocument();
  const blocks: EmailBlock[] = [];
  if (content.heading) blocks.push({ type: "heading", attrs: { level: 1, textAlign: "left" }, content: inlines(content.heading) });
  blocks.push({ type: "paragraph", attrs: { textAlign: "left" }, content: inlines(content.body) });
  if (content.ctaUrl) {
    // V1 accepted HTTP; do not silently upgrade or discard it during conversion.
    if (!content.ctaUrl.startsWith("https://")) throw new Error("This legacy CTA needs an HTTPS destination before a visual copy can be created. The original has not changed.");
    blocks.push({ type: "button", attrs: { label: content.ctaLabel || content.ctaUrl, href: content.ctaUrl, alignment: "left" } });
  }
  if (content.footer) blocks.push({ type: "paragraph", attrs: { textAlign: "left" }, content: inlines(content.footer) });
  result.document.content = blocks;
  return parseEmailDocument(result);
}
