import { z } from "zod";

const id = z.uuid();
const text = z.string().refine(v => v.trim().length > 0);
const timestamp = z.iso.datetime({ offset: true });
const verification = z.enum(["unverified", "reviewed", "verified", "conflicting"]);
const review = z.enum(["not-reviewed", "reviewed"]);
const confidence = z.enum(["high", "medium", "low"]).nullable();
const approval = z.enum(["approved-for-presentation", "internal-only", "needs-review", "unavailable"]);

export const brandIdentityDTO = z.object({
  id, public_id: z.string().regex(/^brand_[a-z0-9]{16,64}$/), slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/), name: text,
  lifecycle: z.enum(["active", "inactive", "concept", "unknown"]), visibility: z.enum(["shared", "restricted"]),
  created_at: timestamp, updated_at: timestamp,
});
export const publishedProfileDTO = z.object({
  id, brand_id: id, version_number: z.number().int().positive(), based_on_profile_id: id.nullable(), status: z.literal("published"),
  brand_name: text, origin: text, created_by: text, reviewed_by: text, reviewed_at: timestamp,
  effective_at: timestamp, published_at: timestamp, created_at: timestamp, updated_at: timestamp,
});
const factDTO = z.object({
  profile_id: id, fact_key: text, value: z.json().nullable(), knowledge_state: z.enum(["unknown", "known"]),
  review_state: review, verification: z.enum(["unknown", "unverified", "reviewed", "verified", "conflicting"]),
  confidence, approval, notes: z.string().nullable(),
});
const evidenceDTO = z.object({
  id, brand_id: id, supersedes_id: id.nullable(), source_type: z.enum(["primary", "secondary", "consultant-provided", "inferred", "legacy-demo"]),
  title: text, source_date: z.iso.date().nullable(), retrieved_at: timestamp.nullable(), reviewed_at: timestamp.nullable(),
  source_url: z.string().nullable(), document_reference: z.string().nullable(), fdd_item: z.string().nullable(), page_reference: z.string().nullable(),
  verification, confidence, notes: z.string().nullable(), created_by: text, created_at: timestamp,
});
const linkDTO = z.object({ profile_id: id, fact_key: text, evidence_id: id, brand_id: id, position: z.number().int().nonnegative(), is_primary: z.boolean() });
const editorialDTO = z.object({
  id, profile_id: id, section: z.enum(["businessSummary", "franchiseeRole", "strongFit", "potentialFriction", "diligenceGap", "note"]),
  position: z.number().int().nonnegative(), label: text, explanation: text, source_facts: z.array(text).min(1),
  origin: z.enum(["editorial", "ai-assisted"]), origin_reference: text, created_by: text, created_at: timestamp,
  review_state: review, reviewed_by: text.nullable(), reviewed_at: timestamp.nullable(),
  approval: z.enum(["approved-for-presentation", "internal-only", "needs-review"]),
});
export const brandIntelligenceDTO = z.object({
  identity: brandIdentityDTO, profile: publishedProfileDTO,
  facts: z.array(factDTO), evidence: z.array(evidenceDTO), links: z.array(linkDTO), editorial: z.array(editorialDTO),
});
export type BrandIntelligenceDTO = z.infer<typeof brandIntelligenceDTO>;
