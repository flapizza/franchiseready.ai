import { createHash } from "node:crypto";
import { BrandIntelligenceRuntime } from "../../feature/brand-library/runtime/BrandIntelligenceRuntime.ts";

export const timestamp = "2026-09-08T12:00:00.000Z";
export function fixtureId(value) {
  const hex = createHash("sha256").update(value).digest("hex");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
}
export function canonicalFacts(value, prefix = "") {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  if (Object.hasOwn(value, "value") && Object.hasOwn(value, "verification")) return [[prefix, value]];
  return Object.entries(value).flatMap(([key, child]) => key === "consultantIntelligence" ? [] : canonicalFacts(child, prefix ? `${prefix}.${key}` : key));
}
export function persistenceFixture(canonical, number = 1) {
  const brandId = fixtureId(canonical.id);
  const profileId = fixtureId(`${canonical.id}:v${number}`);
  const evidence = new Map();
  const links = [];
  const facts = canonicalFacts(canonical).map(([key, fact]) => {
    fact.evidence.forEach((source, position) => {
      const id = fixtureId(source.id);
      evidence.set(id, { id, brand_id: brandId, supersedes_id: null, source_type: source.sourceType, title: source.title,
        source_date: source.sourceDate ?? null, retrieved_at: source.retrievedAt ?? null, reviewed_at: source.reviewedAt ?? null,
        source_url: source.sourceUrl ?? null, document_reference: source.documentReference ?? null,
        fdd_item: source.fddReference?.item ?? null, page_reference: source.fddReference?.page ?? null,
        verification: source.verification, confidence: source.confidence ?? null, notes: source.notes ?? null,
        created_by: "local-test-fixture", created_at: timestamp });
      links.push({ profile_id: profileId, fact_key: key, evidence_id: id, brand_id: brandId, position, is_primary: position === 0 });
    });
    return { profile_id: profileId, fact_key: key, value: fact.value, knowledge_state: fact.value === null ? "unknown" : "known",
      review_state: "reviewed", verification: fact.verification, confidence: fact.confidence ?? null, approval: fact.approval, notes: fact.notes ?? null };
  });
  return {
    canonical,
    identity: { id: brandId, public_id: `brand_${brandId.replaceAll("-", "")}`, slug: canonical.id, name: canonical.name,
      lifecycle: canonical.brandStatus, visibility: "shared", created_at: timestamp, updated_at: timestamp },
    profile: { id: profileId, brand_id: brandId, version_number: number, based_on_profile_id: null, status: "published",
      brand_name: canonical.name, origin: "local-test-fixture", created_by: "fixture", reviewed_by: "fixture-reviewer",
      reviewed_at: timestamp, effective_at: timestamp, published_at: timestamp, created_at: timestamp, updated_at: timestamp },
    facts, evidence: [...evidence.values()], links, editorial: [],
  };
}
export async function sixBrandFixtures() {
  return (await new BrandIntelligenceRuntime().getAll()).map(profile => persistenceFixture(profile));
}
// Compare claims/provenance and approved voice, excluding new persistence identity,
// governance audit timestamps and the deliberate production/demo classification.
export function semanticFact(fact) {
  return { value: fact.value, verification: fact.verification, approval: fact.approval, notes: fact.notes,
    evidence: fact.evidence.map(e => ({ sourceType: e.sourceType, title: e.title, sourceDate: e.sourceDate,
      sourceUrl: e.sourceUrl, documentReference: e.documentReference, fddReference: e.fddReference,
      retrievedAt: e.retrievedAt, verification: e.verification, confidence: e.confidence, notes: e.notes })) };
}
export function semanticIntelligence(profile) {
  const intelligence = profile.consultantIntelligence;
  return { businessSummary: semanticFact(intelligence.businessSummary), sourceFacts: intelligence.businessSummary.sourceFacts,
    franchiseeRole: intelligence.franchiseeRole, strongFit: intelligence.strongFit, potentialFriction: intelligence.potentialFriction,
    businessAtAGlance: intelligence.businessAtAGlance.map(item => ({ label: item.label, fact: semanticFact(item.fact) })),
    diligenceGaps: intelligence.diligenceGaps, readiness: intelligence.readiness, completeness: profile.completeness };
}
