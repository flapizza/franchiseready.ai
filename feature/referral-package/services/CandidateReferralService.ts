import type { ReferralBrandHandoffState, ReferralStrategyHandoffState } from "@/feature/brand-strategy/models/CandidateBrandStrategyState";
import { CandidateBrandStrategyRuntime } from "@/feature/brand-strategy/runtime/CandidateBrandStrategyRuntime";
import { SeedBrandRepository } from "@/feature/brand-library/repositories/SeedBrandRepository";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import { DemoCandidateActivityRepository } from "@/feature/crm/repositories/DemoCandidateActivityRepository";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { SeedDemoScenarioRepository } from "@/feature/demo/repositories/SeedDemoScenarioRepository";
import type { CandidateBrandReferral, CandidateBrandReferralSource } from "../models/CandidateBrandReferral";
import type { CandidateReferralPackage } from "../models/CandidateReferralPackage";
import { DemoReferralDeliveryService } from "./DemoReferralDeliveryService";
import { getConferenceReferralById, getConferenceReferralHistory } from "@/feature/demo/data/conferenceReferralHistory";

export type ReferralServiceResult = { status: "success"; referral: CandidateBrandReferral } | { status: "blocked" | "not-found" | "not-approved"; message: string };
export type BulkReferralResult = { status: "success"; referrals: CandidateBrandReferral[] } | { status: "blocked" | "not-found"; message: string };

export class CandidateReferralService {
  private readonly candidates = new SeedCandidateRepository();
  private readonly brands = new SeedBrandRepository();
  private readonly scenarios = new SeedDemoScenarioRepository();
  private readonly activities = new DemoCandidateActivityRepository();
  private readonly strategy = new CandidateBrandStrategyRuntime(this.candidates, this.brands, this.scenarios);
  private readonly delivery = new DemoReferralDeliveryService(this.activities);

  getByCandidate(candidateId: string) {
    const overlay = demoCandidateOverlayStore.getCandidateReferrals(candidateId);
    return overlay.length ? overlay : getConferenceReferralHistory(candidateId);
  }

  getById(referralId: string) {
    return demoCandidateOverlayStore.getCandidateReferral(referralId) ?? getConferenceReferralById(referralId);
  }

  getOwned(candidateId: string, referralId: string) {
    const referral = this.getById(referralId);
    if (!referral || referral.candidateId !== candidateId || referral.referralPackage.candidateId !== candidateId || referral.referralPackage.referralId !== referralId) return null;
    return referral;
  }

  async prepareRecommended(candidateId: string, brandIds: string[]): Promise<BulkReferralResult> {
    const context = await this.context(candidateId);
    if ("message" in context) return context;
    const requested = [...new Set(brandIds)];
    const handoffs = requested.map((brandId) => context.handoff.recommendedBrands.find((item) => item.brandId === brandId));
    if (handoffs.some((item) => !item)) return { status: "blocked", message: "Only canonical Brand Strategy recommendations can be prepared through this action." };
    const referrals: CandidateBrandReferral[] = [];
    for (const handoff of handoffs as ReferralBrandHandoffState[]) referrals.push(await this.prepareOne(context, handoff, "recommended"));
    return { status: "success", referrals };
  }

  async prepareOtherBrand(candidateId: string, input: { brandName: string; contactName: string; contactEmail: string }): Promise<ReferralServiceResult> {
    const context = await this.context(candidateId);
    if ("message" in context) return context;
    const brandName = input.brandName.trim();
    if (!brandName) return { status: "not-found", message: "Brand name is required." };
    const canonical = (await this.brands.getAll()).find((brand) => brand.name.toLowerCase() === brandName.toLowerCase());
    const referralId = `referral:${candidateId}:other:${canonical?.id ?? brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const existing = demoCandidateOverlayStore.getCandidateReferral(referralId);
    if (existing) return { status: "success", referral: existing };
    const externalBrand = { brandId: canonical?.id ?? null, brandName: canonical?.name ?? brandName,
      category: canonical?.category ?? "Consultant-selected franchise", contact: canonical?.referralContact ?? (input.contactName || input.contactEmail ? { name: input.contactName || "Referral Contact", email: input.contactEmail, title: "Referral Contact" } : null) };
    const referral = await this.createReferral(context, referralId, externalBrand, "other-brand", null);
    return { status: "success", referral };
  }

  async update(candidateId: string, referralId: string, editable: CandidateReferralPackage["editable"]): Promise<ReferralServiceResult> {
    const current = this.getOwned(candidateId, referralId);
    if (!current) return { status: "not-found", message: "Prepare the referral package first." };
    const updated = { ...current, updatedAt: new Date().toISOString(), referralPackage: { ...current.referralPackage, editable } };
    demoCandidateOverlayStore.saveCandidateReferral(updated);
    return { status: "success", referral: updated };
  }

  async approve(candidateId: string, referralId: string): Promise<ReferralServiceResult> {
    const current = this.getOwned(candidateId, referralId);
    if (!current) return { status: "not-found", message: "Prepare the referral package first." };
    const context = await this.context(current.candidateId);
    if ("message" in context) return context;
    if (current.status === "introduced") return { status: "success", referral: current };
    const approvedAt = new Date().toISOString();
    const updated: CandidateBrandReferral = { ...current, status: "approved", approvedAt, updatedAt: approvedAt,
      referralPackage: { ...current.referralPackage, status: "approved", approvedAt } };
    demoCandidateOverlayStore.saveCandidateReferral(updated);
    await this.record(updated, "Referral Package Approved", approvedAt);
    return { status: "success", referral: updated };
  }

  async introduce(candidateId: string, referralId: string): Promise<ReferralServiceResult> {
    const current = this.getOwned(candidateId, referralId);
    if (!current) return { status: "not-found", message: "Prepare the referral package first." };
    if (current.status !== "approved") return { status: "not-approved", message: "Consultant approval is required before recording an introduction." };
    const context = await this.context(current.candidateId);
    if ("message" in context) return context;
    const delivery = await this.delivery.recordIntroduction(current.referralPackage);
    const updated: CandidateBrandReferral = { ...current, status: "introduced", introducedAt: delivery.recordedAt,
      deliveryStatus: "recorded", updatedAt: delivery.recordedAt,
      referralPackage: { ...current.referralPackage, status: "introduced", introducedAt: delivery.recordedAt,
        candidate: { ...current.referralPackage.candidate } } };
    demoCandidateOverlayStore.saveCandidateReferral(updated);
    return { status: "success", referral: updated };
  }

  private async context(candidateId: string): Promise<{ candidate: NonNullable<Awaited<ReturnType<SeedCandidateRepository["getById"]>>> & { intelligence: NonNullable<NonNullable<Awaited<ReturnType<SeedCandidateRepository["getById"]>>>["intelligence"]> }; handoff: ReferralStrategyHandoffState; discoveryFindings: string[] } | { status: "blocked" | "not-found"; message: string }> {
    const [candidate, strategy, scenario] = await Promise.all([this.candidates.getById(candidateId), this.strategy.load(candidateId), this.scenarios.getCandidateById(candidateId)]);
    if (!candidate || !strategy) return { status: "not-found", message: "Candidate not found." };
    if (!candidate.intelligence || !strategy.referralStrategyHandoff) return { status: "blocked", message: strategy.unavailableReason ?? "Candidate Intelligence and Brand Strategy context are required to prepare a referral package." };
    if (candidate.pipelineStage === "awarded") return { status: "blocked", message: "Completed referral history is read-only." };
    return { candidate: { ...candidate, intelligence: candidate.intelligence }, handoff: strategy.referralStrategyHandoff, discoveryFindings: scenario?.discovery.detectedBuyingSignals ?? [] };
  }

  private async prepareOne(context: Exclude<Awaited<ReturnType<CandidateReferralService["context"]>>, { message: string }>, handoff: ReferralBrandHandoffState, source: CandidateBrandReferralSource) {
    const referralId = `referral:${context.candidate.id}:${handoff.brandId}`;
    const existing = demoCandidateOverlayStore.getCandidateReferral(referralId);
    return existing ?? this.createReferral(context, referralId, { brandId: handoff.brandId, brandName: handoff.brandName, category: handoff.category, contact: handoff.referralContact }, source, handoff);
  }

  private async createReferral(context: Exclude<Awaited<ReturnType<CandidateReferralService["context"]>>, { message: string }>, referralId: string,
    brand: { brandId: string | null; brandName: string; category: string; contact: { name: string; email: string; title: string } | null }, source: CandidateBrandReferralSource, handoff: ReferralBrandHandoffState | null) {
    const { candidate } = context;
    const now = new Date().toISOString();
    const strengths = handoff ? handoff.supportingEvidence.filter((item) => item.category !== "financial").map((item) => item.title) : [
      `Leadership readiness: ${candidate.intelligence.competencies.leadership}%`, `Coachability: ${candidate.intelligence.behavioral.coachability}%`, `Communication readiness: ${candidate.intelligence.competencies.communication}%`];
    const contactName = brand.contact?.name ?? `${brand.brandName} Franchise Development`;
    const positioning = handoff ? handoff.candidateBrandRationale : `${candidate.firstName}'s validated candidate intelligence warrants a consultant-led conversation. This is a consultant-selected referral; FranGroove has not evaluated brand fit.`;
    const intro = `Hi ${contactName},\n\nI'd like to introduce ${context.handoff.candidateName} for a conversation with ${brand.brandName}. ${positioning}\n\nCandidate strengths:\n${strengths.slice(0, 3).map((item) => `- ${item}`).join("\n")}\n\nFinancial profile: ${candidate.intelligence.financial.liquidCapital.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} liquid capital.\n\nI have included the candidate referral summary for context.\n\nBest,\n${demoConsultant.displayName}`;
    const pkg: CandidateReferralPackage = { id: crypto.randomUUID(), referralId, candidateId: candidate.id, status: "ready-for-review", source,
      candidate: { name: context.handoff.candidateName, email: context.handoff.candidateEmail, phone: candidate.phone || null,
        location: [candidate.city, candidate.state].filter(Boolean).join(", ") || null, territory: candidate.preferredTerritory ?? null,
        lifecycleStage: candidate.pipelineStage, readiness: context.handoff.candidateReadiness },
      brand: { id: brand.brandId ?? referralId, name: brand.brandName, category: brand.category, contact: brand.contact },
      consultant: { id: candidate.consultantId, name: demoConsultant.displayName, title: demoConsultant.title, email: demoConsultant.email ?? null, phone: demoConsultant.phone ?? null, companyName: demoConsultant.companyName ?? null },
      recommendation: handoff ? { score: handoff.recommendationScore, confidence: handoff.recommendationConfidence, rationale: handoff.candidateBrandRationale, strategyContext: context.handoff.strategyContext } : null,
      financial: { liquidCapital: candidate.intelligence.financial.liquidCapital, investableCapital: candidate.intelligence.financial.investableCapital, netWorth: null,
        candidatePreferredInvestmentRange: candidate.intelligence.financial.investmentRange, brandInvestmentRange: handoff?.financialCompatibility.requiredInvestment ?? null,
        qualified: handoff?.financialCompatibility.compatible ?? null }, executiveSummary: candidate.intelligence.executiveSummary,
      motivations: candidate.intelligence.preferredBusinessModels, strengths, discoveryFindings: context.discoveryFindings,
      concerns: handoff?.knownConcerns ?? candidate.intelligence.discoveryPriorities,
      conversationFocus: handoff ? [...handoff.presentationContext.emphasize, handoff.presentationContext.suggestedTransition] : candidate.intelligence.discoveryPriorities,
      evidence: handoff?.supportingEvidence ?? [], editable: { subject: `Introduction: ${context.handoff.candidateName} — ${brand.brandName}`, introductionMessage: intro, consultantNotes: "" },
      handoff, preparedAt: now, approvedAt: null, introducedAt: null };
    const referral: CandidateBrandReferral = { referralId, candidateId: candidate.id, brandId: brand.brandId, brandName: brand.brandName, source,
      recommendationRank: handoff?.rank ?? null, recommendationScore: handoff?.recommendationScore ?? null, recommendationConfidence: handoff?.recommendationConfidence ?? null,
      packageId: pkg.id, status: "ready-for-review", referralPackage: pkg, createdAt: now, updatedAt: now, approvedAt: null, introducedAt: null, deliveryStatus: "not-recorded",
      decision: { consultantDirected: !context.handoff.referralGatePassed, aiReadinessStatus: context.handoff.referralReadiness,
        readinessPercentage: context.handoff.referralReadinessPercentage, lifecycleStage: candidate.pipelineStage,
        unresolvedConsiderations: context.handoff.unresolvedReadinessConsiderations, decidedAt: now } };
    demoCandidateOverlayStore.saveCandidateReferral(referral);
    await this.record(referral, "Referral Package Prepared", now);
    return referral;
  }

  private async record(referral: CandidateBrandReferral, event: "Referral Package Prepared" | "Referral Package Approved", createdAt: string) {
    await this.activities.add({ id: crypto.randomUUID(), candidateId: referral.candidateId, consultantId: referral.referralPackage.consultant.id,
      type: "referral-generated", title: `${event} — ${referral.brandName}`, description: `${event} for ${referral.brandName}.`, createdAt,
      metadata: { referralId: referral.referralId, referralPackageId: referral.packageId, brandId: referral.brandId ?? "external",
        consultantDirected: referral.decision.consultantDirected, aiReadinessStatus: referral.decision.aiReadinessStatus,
        readinessPercentage: referral.decision.readinessPercentage, lifecycleStage: referral.decision.lifecycleStage } });
  }
}
