import type { BrandProfile } from "@/feature/brand-library/models/BrandProfile";
import type { BrandRepository } from "@/feature/brand-library/repositories/BrandRepository";
import { SeedBrandRepository } from "@/feature/brand-library/repositories/SeedBrandRepository";
import type { CandidateRecord, PipelineStage } from "@/feature/crm/models/CandidateRecord";
import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import type { DemoScenarioRepository } from "@/feature/demo/repositories/DemoScenarioRepository";
import { SeedDemoScenarioRepository } from "@/feature/demo/repositories/SeedDemoScenarioRepository";
import type { Evidence } from "@/feature/evidence/models/Evidence";
import { ReferralReadinessEvaluator } from "@/feature/decision-engine/evaluators/ReferralReadinessEvaluator";
import type { CandidateBrandRecommendationState, CandidateBrandStrategyState } from "../models/CandidateBrandStrategyState";

const STRATEGY_STAGES: readonly PipelineStage[] = ["brand-matching", "referral", "awarded"];

function stageLabel(stage: PipelineStage) {
  if (stage === "brand-matching") return "Brand Strategy";
  return stage.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}

function alignment(candidateValue: number, brandTarget: number) {
  return Math.max(0, 100 - Math.abs(candidateValue - brandTarget));
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export class CandidateBrandStrategyRuntime {
  private readonly referralEvaluator = new ReferralReadinessEvaluator();

  public constructor(
    private readonly candidates: CandidateRepository = new SeedCandidateRepository(),
    private readonly brands: BrandRepository = new SeedBrandRepository(),
    private readonly scenarios: DemoScenarioRepository = new SeedDemoScenarioRepository(),
  ) {}

  async load(candidateId: string): Promise<CandidateBrandStrategyState | null> {
    const [candidate, brands, scenarioCandidate] = await Promise.all([
      this.candidates.getById(candidateId), this.brands.getAll(), this.scenarios.getCandidateById(candidateId),
    ]);
    if (!candidate) return null;

    const base = {
      id: candidate.id, fullName: `${candidate.firstName} ${candidate.lastName}`,
      stageLabel: stageLabel(candidate.pipelineStage), readiness: candidate.intelligence?.overallReadiness ?? null,
      intelligenceSummary: candidate.intelligence?.executiveSummary ?? "Candidate Intelligence is not available.",
    };
    if (!candidate.intelligence || !STRATEGY_STAGES.includes(candidate.pipelineStage)) {
      return {
        available: false,
        unavailableReason: !candidate.intelligence
          ? "Candidate Intelligence must be available before Brand Strategy can be generated."
          : `Brand Strategy becomes available after Discovery and Validation. Current stage: ${stageLabel(candidate.pipelineStage)}.`,
        candidate: base, overallStrategy: "", leadRecommendation: null, recommendations: [], presentationOrder: [], openConcerns: [],
        referralReadiness: null, referralDecision: null, lifecycleAction: null, referralHandoff: null, referralStrategyHandoff: null,
      };
    }

    const strategyCandidate = { ...candidate, intelligence: candidate.intelligence };
    const recommendations = brands
      .map((brand) => this.recommend(strategyCandidate, brand))
      .sort((left, right) => right.score - left.score)
      .map((recommendation, index) => ({
        ...recommendation, rank: index + 1,
        recommendationLabel: !recommendation.qualified
          ? "Not Financially Qualified" as const
          : index === 0 ? "Top Recommendation" as const : index === 1 ? "Strong Alternative" as const : "Alternative" as const,
      }));
    const top = recommendations[0];
    if (!top) throw new Error("Brand Strategy requires at least one canonical brand.");

    const referral = this.referralEvaluator.evaluate({
      readiness: candidate.intelligence.overallReadiness, confidence: candidate.intelligence.timing.confidence,
      executiveSummary: candidate.intelligence.executiveSummary,
      buyingSignals: scenarioCandidate?.discovery.detectedBuyingSignals ?? [],
      risks: scenarioCandidate?.discovery.detectedRisks ?? candidate.intelligence.discoveryPriorities,
    });
    const openConcerns = [...new Set([
      ...(scenarioCandidate?.discovery.detectedRisks ?? []),
      ...candidate.intelligence.discoveryPriorities.filter((item) => /confirm|validate|risk|alignment/i.test(item)),
    ])];
    const comparisonExplanation = this.explainLead(top, recommendations[1]);
    const gatePassed = referral.status === "ready";
    const overallStrategy = `${top.brandName} leads the presentation because its validated candidate-intelligence alignment and brand-profile fit are strongest. Present qualified alternatives as deliberate tradeoffs, not equivalent recommendations.`;
    const brandsById = new Map(brands.map((brand) => [brand.id, brand]));
    const recommendedBrands = recommendations.map((item) => ({
      brandId: item.brandId, brandName: item.brandName, category: item.category, rank: item.rank,
      recommendationConfidence: item.confidence, recommendationScore: item.score,
      candidateBrandRationale: item.rationale, supportingEvidence: item.evidence,
      knownConcerns: [...new Set([...openConcerns, ...item.concerns])], financialCompatibility: item.investment,
      referralContact: brandsById.get(item.brandId)?.referralContact ?? null, presentationContext: item.presentationGuidance,
    }));
    const referralContext = { candidateId: candidate.id, candidateName: base.fullName, candidateEmail: candidate.email,
      referralReadiness: referral.status, candidateReadiness: candidate.intelligence.overallReadiness,
      referralGatePassed: gatePassed, strategyContext: overallStrategy };

    return {
      available: true, candidate: base,
      overallStrategy,
      leadRecommendation: {
        statement: `${top.brandName} is the recommended lead presentation.`,
        comparisonHeading: `Why ${top.brandName} leads`,
        comparisonExplanation,
      },
      recommendations,
      presentationOrder: recommendations.filter((item) => item.qualified).map((item) => item.brandName),
      openConcerns,
      referralReadiness: {
        ...referral,
        label: referral.status === "ready" ? "Ready for Referral" : referral.status === "needs-validation" ? "Validation Required" : "Not Ready for Referral",
        explanation: referral.status === "ready" ? "Candidate readiness meets the canonical referral threshold." : "Resolve the remaining candidate evidence before a franchisor introduction.",
      },
      referralDecision: {
        passed: gatePassed,
        gateLabel: gatePassed ? "Passed" : "Not Yet Ready",
        heading: gatePassed ? "Ready for Introduction" : "Not Yet Ready for Introduction",
        explanation: gatePassed
          ? `${base.fullName} has satisfied the canonical readiness conditions for introduction. ${top.brandName} is the recommended lead opportunity.`
          : `The canonical referral requirements have not yet been satisfied for ${base.fullName}.`,
        unresolvedReasons: referral.remainingRequirements,
        nextAction: gatePassed ? "Open Referral Studio to review brands for referral." : top.nextAction,
      },
      lifecycleAction: gatePassed && candidate.pipelineStage === "brand-matching" ? { label: "Open Referral Studio" } : null,
      referralHandoff: {
        ...referralContext, ...recommendedBrands[0],
      },
      referralStrategyHandoff: { ...referralContext, recommendedBrands },
    };
  }

  private recommend(candidate: CandidateRecord & { intelligence: NonNullable<CandidateRecord["intelligence"]> }, brand: BrandProfile): Omit<CandidateBrandRecommendationState, "rank" | "recommendationLabel"> {
    const intelligence = candidate.intelligence;
    const relationship = Math.round((intelligence.competencies.networking + intelligence.competencies.communication) / 2);
    const dimensions = [
      this.dimension("leadership", "Leadership", intelligence.competencies.leadership, brand.idealCandidate.leadership, "Leadership evidence compared with the brand's ideal ownership profile."),
      this.dimension("sales", "Business Development", intelligence.competencies.sales, brand.operatingModel.salesIntensity, "Sales readiness compared with the operating model's business-development demand."),
      this.dimension("operations", "Operational Fit", intelligence.competencies.operations, brand.operatingModel.operationalIntensity, "Operating capability compared with day-to-day execution intensity."),
      this.dimension("relationships", "Relationship Building", relationship, brand.idealCandidate.relationshipBuilding, "Communication and networking evidence compared with relationship-building expectations."),
      this.dimension("coachability", "Coachability", intelligence.behavioral.coachability, brand.idealCandidate.coachability, "Candidate coachability compared with the brand's system-adoption profile."),
      this.dimension("lifestyle", "Lifestyle Flexibility", intelligence.behavioral.adaptability, brand.operatingModel.scheduleFlexibility, "Adaptability compared with the flexibility available in the operating model."),
    ];
    const profileAlignment = Math.round(dimensions.reduce((total, item) => total + item.alignment, 0) / dimensions.length);
    const existing = intelligence.recommendations.find((item) => item.id === brand.id);
    const qualified = intelligence.financial.investableCapital >= brand.investment.minimum && intelligence.financial.liquidCapital >= (brand.investment.liquidCapitalMinimum ?? 0);
    const evidenceBackedScore = existing ? Math.round(existing.overallFit * 0.6 + profileAlignment * 0.4) : Math.min(84, profileAlignment);
    const score = qualified ? evidenceBackedScore : Math.min(49, evidenceBackedScore);
    const strongest = [...dimensions].sort((left, right) => right.alignment - left.alignment).slice(0, 3);
    const weakest = [...dimensions].sort((left, right) => left.alignment - right.alignment)[0];
    const evidence: Evidence[] = strongest.map((item) => ({
      id: `${candidate.id}-${brand.id}-${item.id}`, category: item.id === "leadership" ? "leadership" : item.id === "operations" ? "operations" : "culture",
      title: `${item.label} validated`, description: item.explanation, confidence: item.alignment,
      source: "assessment", timestamp: intelligence.completedAt,
    }));
    evidence.push({
      id: `${candidate.id}-${brand.id}-financial`, category: "financial", title: qualified ? "Financial requirements satisfied" : "Financial qualification gap",
      description: qualified ? `Candidate capital meets ${brand.name}'s minimum requirements.` : `Candidate capital does not meet ${brand.name}'s stated minimum requirements.`,
      confidence: intelligence.financial.financingLikelihood, source: "assessment", timestamp: intelligence.completedAt,
    });
    const concerns = [
      ...(!qualified ? ["Investment requirements are not currently satisfied."] : []),
      ...(weakest.alignment < 88 ? [`${weakest.label} requires discussion before presentation.`] : []),
      ...brand.considerations.slice(0, 2),
    ];

    return {
      brandId: brand.id, brandName: brand.name, category: brand.category, score,
      confidence: existing?.confidence ?? Math.min(84, profileAlignment), qualified,
      rationale: `${brand.name} aligns most clearly around ${strongest.map((item) => item.label.toLowerCase()).join(", ")}. ${qualified ? "Financial requirements are satisfied." : "Financial qualification prevents advancement."}`,
      fitDimensions: dimensions, evidence, concerns,
      presentationGuidance: {
        leadWith: brand.strengths.slice(0, 2),
        emphasize: [brand.businessModel.b2b ? "B2B customer model" : "Consumer customer model", brand.businessModel.recurringRevenue ? "Recurring-revenue potential" : "Transaction-based revenue", brand.operatingModel.primaryCustomer],
        address: concerns.slice(0, 3),
        suggestedTransition: `Connect ${brand.name}'s ${brand.successTraits[0].toLowerCase()} requirement to the candidate's strongest validated evidence, then ask: ${brand.discoveryQuestions[0]}`,
      },
      investment: {
        candidateInvestableCapital: intelligence.financial.investableCapital,
        candidateLiquidCapital: intelligence.financial.liquidCapital,
        requiredInvestment: `${money(brand.investment.minimum)}–${money(brand.investment.maximum)}`,
        liquidCapitalMinimum: brand.investment.liquidCapitalMinimum ?? null,
        compatible: qualified,
        explanation: qualified ? "Candidate meets both total investment and liquid-capital minimums." : "Treat this brand as unqualified until the capital gap is resolved.",
      },
      nextAction: qualified ? `Present ${brand.name} in the recommended sequence and capture candidate response.` : "Resolve financial qualification before presenting this brand.",
    };
  }

  private dimension(id: string, label: string, candidateValue: number, brandTarget: number, explanation: string) {
    return { id, label, candidateValue, brandTarget, alignment: alignment(candidateValue, brandTarget), explanation };
  }

  private explainLead(top: CandidateBrandRecommendationState, alternative?: CandidateBrandRecommendationState): string {
    if (!alternative) return `${top.brandName} is the only canonical qualified recommendation in the current comparison set.`;
    const strongerDimensions = top.fitDimensions
      .map((dimension) => ({ ...dimension, advantage: dimension.alignment - (alternative.fitDimensions.find((item) => item.id === dimension.id)?.alignment ?? 0) }))
      .filter((dimension) => dimension.advantage > 0)
      .sort((left, right) => right.advantage - left.advantage)
      .slice(0, 2)
      .map((dimension) => dimension.label.toLowerCase());
    if (top.score === alternative.score) {
      return `${top.brandName} and ${alternative.brandName} are tied at ${top.score}. ${top.brandName} appears first through stable canonical presentation order; the tie is preserved for consultant judgment.`;
    }
    const differentiators = strongerDimensions.length > 0
      ? `stronger ${strongerDimensions.join(" and ")} alignment`
      : "the stronger overall evidence-backed ownership profile";
    const qualification = top.qualified && !alternative.qualified ? ` ${alternative.brandName} is currently blocked by financial qualification.` : "";
    return `${top.brandName} ranks ahead of ${alternative.brandName} because it shows ${differentiators}, producing a ${top.score} fit compared with ${alternative.score}.${qualification}`;
  }
}
