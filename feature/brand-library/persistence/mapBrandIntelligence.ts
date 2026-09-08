import type { BrandEvidence, BrandFact, BrandIntelligenceProfile, BrandEditorialItem } from "../models/BrandIntelligenceProfile.ts";
import { ConsultantBrandIntelligenceRuntime } from "../runtime/ConsultantBrandIntelligenceRuntime.ts";
import { calculateBrandProfileCompleteness } from "../runtime/BrandProfileCompleteness.ts";
import { brandIntelligenceDTO } from "./BrandIntelligenceDTO.ts";
import { brandFactPaths, factDefinition, BrandIntelligenceDataError } from "./BrandFactRegistry.ts";

const fail = (message: string): never => { throw new BrandIntelligenceDataError(message); };
const uniqueEvidence = (facts: BrandFact<unknown>[]) => [...new Map(facts.flatMap(f => f.evidence).map(e => [e.id, e])).values()];

export function mapBrandIntelligence(input: unknown): BrandIntelligenceProfile {
  const parsed = brandIntelligenceDTO.safeParse(input);
  if (!parsed.success) return fail("invalid row shape or publication metadata");
  const { identity, profile, facts, evidence, links, editorial } = parsed.data;
  if (profile.brand_id !== identity.id) return fail("profile belongs to another brand");
  const sources = new Map<string, BrandEvidence>();
  for (const source of evidence) {
    if (sources.has(source.id) || source.brand_id !== identity.id) return fail("duplicate or foreign evidence");
    if (["verified", "reviewed"].includes(source.verification) && source.reviewed_at === null) return fail("missing source review date");
    sources.set(source.id, {
      id: source.id, sourceType: source.source_type, title: source.title, verification: source.verification,
      sourceDate: source.source_date ?? undefined, retrievedAt: source.retrieved_at ?? undefined, reviewedAt: source.reviewed_at ?? undefined,
      sourceUrl: source.source_url ?? undefined, documentReference: source.document_reference ?? undefined,
      fddReference: source.fdd_item !== null || source.page_reference !== null
        ? { item: source.fdd_item ?? undefined, page: source.page_reference ?? undefined } : undefined,
      confidence: source.confidence ?? undefined, notes: source.notes ?? undefined, supersedesId: source.supersedes_id ?? undefined,
      createdAt: source.created_at, createdBy: source.created_by,
    });
  }
  const mapped = new Map<string, BrandFact<unknown>>();
  for (const fact of facts) {
    const definition = factDefinition(fact.fact_key);
    if (mapped.has(fact.fact_key) || fact.profile_id !== profile.id) return fail("duplicate or foreign fact");
    if (fact.knowledge_state === "unknown") {
      if (fact.value !== null || fact.verification !== "unknown" || fact.approval !== "unavailable") return fail("inconsistent unknown fact");
    } else {
      if (fact.value === null || fact.verification === "unknown" || !definition.schema.safeParse(fact.value).success) return fail(`invalid value for ${fact.fact_key}`);
    }
    if (["verified", "reviewed"].includes(fact.verification) && fact.review_state !== "reviewed") return fail("verification without review");
    mapped.set(fact.fact_key, {
      value: fact.value, verification: fact.verification, approval: fact.approval, evidence: [], notes: fact.notes ?? undefined,
      knowledgeState: fact.knowledge_state, reviewState: fact.review_state, confidence: fact.confidence ?? undefined,
    });
  }
  if (mapped.size !== brandFactPaths.length) return fail("missing governed facts; incomplete profile");
  const attached = new Set<string>();
  const primaries = new Set<string>();
  for (const link of [...links].sort((a, b) => a.position - b.position || a.evidence_id.localeCompare(b.evidence_id))) {
    const fact = mapped.get(link.fact_key);
    const source = sources.get(link.evidence_id);
    const key = `${link.fact_key}:${link.evidence_id}`;
    if (link.profile_id !== profile.id || link.brand_id !== identity.id || !fact || !source || attached.has(key)) return fail("invalid or duplicate evidence association");
    if (link.is_primary && primaries.has(link.fact_key)) return fail("multiple primary sources");
    if (link.is_primary) primaries.add(link.fact_key);
    attached.add(key);
    fact.evidence.push({ ...source, position: link.position, isPrimary: link.is_primary });
  }
  const usedSources = new Set([...mapped.values()].flatMap(f => f.evidence.map(e => e.id)));
  if ([...sources.keys()].some(id => !usedSources.has(id))) return fail("unassociated evidence returned");
  for (const fact of mapped.values()) {
    if (fact.verification === "verified" && !fact.evidence.some(e => e.verification === "verified")) return fail("verified fact lacks verified evidence");
  }
  const items: BrandEditorialItem[] = [];
  const itemIds = new Set<string>();
  const itemPositions = new Set<string>();
  for (const item of [...editorial].sort((a, b) => a.section.localeCompare(b.section) || a.position - b.position)) {
    const position = `${item.section}:${item.position}`;
    if (item.profile_id !== profile.id || itemIds.has(item.id) || itemPositions.has(position)
      || item.source_facts.some(key => !mapped.has(key)) || new Set(item.source_facts).size !== item.source_facts.length) return fail("invalid editorial linkage");
    if (item.review_state === "reviewed" && (item.reviewed_by === null || item.reviewed_at === null)) return fail("missing editorial reviewer");
    if (item.approval === "approved-for-presentation" && item.review_state !== "reviewed") return fail("unreviewed editorial approval");
    itemIds.add(item.id); itemPositions.add(position);
    items.push({ id: item.id, section: item.section, position: item.position, label: item.label, explanation: item.explanation,
      sourceFacts: item.source_facts, origin: item.origin, originReference: item.origin_reference,
      createdBy: item.created_by, createdAt: item.created_at, reviewState: item.review_state,
      reviewedBy: item.reviewed_by, reviewedAt: item.reviewed_at, approval: item.approval });
  }
  const tree: Record<string, unknown> = {};
  for (const key of brandFactPaths) {
    const [group, child] = key.split(".");
    if (child) { const bucket = (tree[group] ??= {}) as Record<string, unknown>; bucket[child] = mapped.get(key)!; }
    else tree[group] = mapped.get(key)!;
  }
  // Only registry-approved paths and individually validated values reach this cast.
  const canonical = tree as Pick<BrandIntelligenceProfile, "category" | "industry" | "description" | "website" | "franchisor" | "economics" | "characteristics" | "fit" | "support" | "system" | "differentiators" | "considerations" | "discoveryQuestions">;
  const base = {
    ...canonical, id: identity.public_id, slug: identity.slug, name: profile.brand_name, demoClassification: "not-demo" as const,
    brandStatus: identity.lifecycle, profileStatus: "reviewed" as const,
    completeness: calculateBrandProfileCompleteness(brandFactPaths.flatMap(key => {
      const label = factDefinition(key).completenessLabel;
      return label ? [{ label, fact: mapped.get(key)! }] : [];
    })),
    evidence: [...sources.values()], editorialItems: items,
    version: { id: profile.id, number: profile.version_number, status: "published" as const,
      effectiveAt: profile.effective_at, approvedBy: profile.reviewed_by, publishedAt: profile.published_at,
      reviewedAt: profile.reviewed_at, createdAt: profile.created_at, updatedAt: profile.updated_at,
      createdBy: profile.created_by, origin: profile.origin, basedOnProfileId: profile.based_on_profile_id ?? undefined },
  };
  const consultantIntelligence = new ConsultantBrandIntelligenceRuntime().derive(base);
  // Only explicitly approved editorial items replace derived presentation copy.
  // Internal notes/gaps and unapproved items remain available as governed items.
  const approved = items.filter(item => item.approval === "approved-for-presentation");
  for (const section of ["franchiseeRole", "strongFit", "potentialFriction"] as const) {
    const selected = approved.filter(item => item.section === section);
    if (selected.length) consultantIntelligence[section] = selected.map(({ label, explanation, sourceFacts }) => ({ label, explanation, sourceFacts }));
  }
  const summaries = approved.filter(item => item.section === "businessSummary");
  if (summaries.length > 1) return fail("ambiguous editorial business summary");
  if (summaries.length === 1) {
    const item = summaries[0];
    const basis = item.sourceFacts.map(key => mapped.get(key)!);
    consultantIntelligence.businessSummary = {
      value: item.explanation, verification: basis.every(f => f.verification === "verified") ? "verified" : "unverified",
      approval: item.approval, evidence: uniqueEvidence(basis), derivation: "editorial", sourceFacts: item.sourceFacts,
      reviewState: item.reviewState, knowledgeState: "known",
    };
  }
  consultantIntelligence.evidence = uniqueEvidence([consultantIntelligence.businessSummary,
    ...approved.flatMap(item => item.sourceFacts.map(key => mapped.get(key)!))]);
  consultantIntelligence.version = base.version;
  return { ...base, consultantIntelligence };
}
