import { z } from "zod";

export const fontStacks = {
  arial: "Arial, Helvetica, sans-serif",
  verdana: "Verdana, Geneva, sans-serif",
  tahoma: "Tahoma, Geneva, sans-serif",
  trebuchet: '"Trebuchet MS", Arial, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  times: '"Times New Roman", Times, serif',
} as const;
export const fontNames = { arial: "Arial", verdana: "Verdana", tahoma: "Tahoma", trebuchet: "Trebuchet", georgia: "Georgia", times: "Times" } as const;
export const fontIds = ["arial", "verdana", "tahoma", "trebuchet", "georgia", "times"] as const;
export const fontSizes = [14, 16, 18, 20, 24, 28, 32, 36] as const;
export const colors = ["#172033", "#475569", "#2563EB", "#047857", "#9F1239", "#7C3AED"] as const;
export const mergeFields = ["first_name", "preferred_name", "consultant_name"] as const;
export const MAX_DOCUMENT_BYTES = 262144;
const font = z.enum(fontIds);
const size = z.union(fontSizes.map(value => z.literal(value)));
const color = z.enum(colors);
const alignment = z.enum(["left", "center", "right"]);
// Deliberately narrower than a generic URL parser; the SQL contract shares this pattern.
export const httpsUrl = z.string().max(2048).regex(/^https:\/\/[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?(?::[0-9]{1,5})?(?:[/?#][^\s<>"'\\]*)?$/);
const textStyle = z.object({ font: font.nullable(), size: size.nullable(), color: color.nullable() }).strict();
const mark = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }).strict(),
  z.object({ type: z.literal("italic") }).strict(),
  z.object({ type: z.literal("underline") }).strict(),
  z.object({ type: z.literal("emailStyle"), attrs: textStyle }).strict(),
  z.object({ type: z.literal("link"), attrs: z.object({ href: httpsUrl }).strict() }).strict(),
]);
const inline = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string().min(1).max(20000), marks: z.array(mark).max(5).optional() }).strict(),
  z.object({ type: z.literal("hardBreak") }).strict(),
  z.object({ type: z.literal("mergeField"), attrs: z.object({ field: z.enum(mergeFields) }).strict(), marks: z.array(mark).max(5).optional() }).strict(),
]);
const paragraph = z.object({ type: z.literal("paragraph"), attrs: z.object({ textAlign: alignment }).strict(), content: z.array(inline).max(1000).optional() }).strict();
const heading = z.object({ type: z.literal("heading"), attrs: z.object({ level: z.union([z.literal(1), z.literal(2), z.literal(3)]), textAlign: alignment }).strict(), content: z.array(inline).max(1000).optional() }).strict();
const listItem = z.object({ type: z.literal("listItem"), content: z.array(paragraph).min(1).max(10) }).strict();
const bulletList = z.object({ type: z.literal("bulletList"), content: z.array(listItem).min(1).max(50) }).strict();
const orderedList = z.object({ type: z.literal("orderedList"), attrs: z.object({ start: z.number().int().min(1).max(100) }).strict(), content: z.array(listItem).min(1).max(50) }).strict();
const image = z.object({ type: z.literal("emailImage"), attrs: z.object({ assetId: z.string().regex(/^asset_[a-f0-9]{32}$/).nullable(), alt: z.string().max(300), alignment, width: z.number().int().min(80).max(600), href: httpsUrl.nullable() }).strict() }).strict();
const signature = z.object({ type: z.literal("signature"), attrs: z.object({ name: z.string().max(120), title: z.string().max(160), company: z.string().max(200), email: z.union([z.literal(""), z.email()]), phone: z.string().max(40) }).strict() }).strict();
const textBlock = z.union([paragraph, heading, bulletList, orderedList]);
const columns = z.object({ type: z.literal("imageText"), content: z.tuple([image, z.object({ type: z.literal("emailColumn"), content: z.array(textBlock).min(1).max(10) }).strict()]) }).strict();
export const emailDocumentSchema = z.object({
  version: z.literal(2), type: z.literal("email"),
  theme: z.object({ fontFamily: font, fontSize: size, textColor: color, accentColor: color }).strict(),
  document: z.object({ type: z.literal("doc"), content: z.array(z.union([
    textBlock, image, columns, signature,
    z.object({ type: z.literal("button"), attrs: z.object({ label: z.string().min(1).max(80), href: httpsUrl, alignment }).strict() }).strict(),
    z.object({ type: z.literal("divider") }).strict(),
    z.object({ type: z.literal("spacer"), attrs: z.object({ height: z.union([z.literal(8), z.literal(16), z.literal(24), z.literal(32), z.literal(48)]) }).strict() }).strict(),
  ])).min(1).max(100) }).strict(),
}).strict();
export type EmailDocument = z.infer<typeof emailDocumentSchema>;
export type EmailBlock = EmailDocument["document"]["content"][number];
export type Inline = z.infer<typeof inline>;
export function parseEmailDocument(value: unknown): EmailDocument {
  // Bound traversal before recursive validation/serialization (including cyclic input).
  let nodes = 0;
  const visit = (x: unknown, depth: number) => {
    if (depth > 20 || ++nodes > 12000) throw new Error("Email document exceeds structural limits.");
    if (x && typeof x === "object") for (const child of Object.values(x)) visit(child, depth + 1);
  };
  visit(value, 0);
  if (new TextEncoder().encode(JSON.stringify(value)).length > MAX_DOCUMENT_BYTES) throw new Error("Email document exceeds 256 KiB.");
  return emailDocumentSchema.parse(value);
}
export const emptyEmailDocument = (): EmailDocument => ({ version: 2, type: "email", theme: { fontFamily: "arial", fontSize: 16, textColor: "#172033", accentColor: "#2563EB" }, document: { type: "doc", content: [{ type: "paragraph", attrs: { textAlign: "left" } }] } });
export function serializeEmailDocument(value: unknown) { return JSON.stringify(parseEmailDocument(value)); }
export function deserializeEmailDocument(value: string) { if (value.length > MAX_DOCUMENT_BYTES) throw new Error("Email document is too large."); return parseEmailDocument(JSON.parse(value)); }
