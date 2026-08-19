import type { BrandProfile } from "@/feature/brand-library/models/BrandProfile";
import type { BrandRepository } from "@/feature/brand-library/repositories/BrandRepository";
import { SeedBrandRepository } from "@/feature/brand-library/repositories/SeedBrandRepository";
import type { CandidateRecord } from "@/feature/crm/models/CandidateRecord";
import type { CandidateRepository } from "@/feature/crm/repositories/CandidateRepository";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import type { DemoScenarioRepository } from "@/feature/demo/repositories/DemoScenarioRepository";
import { SeedDemoScenarioRepository } from "@/feature/demo/repositories/SeedDemoScenarioRepository";
import type { Evidence } from "@/feature/evidence/models/Evidence";
import { ReferralReadinessEvaluator } from "@/feature/decision-engine/evaluators/ReferralReadinessEvaluator";
import type { CandidateBrandRecommendationState, CandidateBrandStrategyState } from "../models/CandidateBrandStrategyState";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import { getConferenceReferralHistory } from "@/feature/demo/data/conferenceReferralHistory";
import type { StrategyWorkflowStatus } from "../models/StrategyBuilderRecord";
import type { CandidateBrandPresentationState, PresentationTalkingPoint } from "../models/CandidateBrandPresentationBrief";
import { PresentationQuestionBuilder } from "./PresentationQuestionBuilder";
import { BrandIntelligenceRuntime, presentationValue } from "@/feature/brand-library/runtime/BrandIntelligenceRuntime";
import { DemoConsultantPipelineRepository } from "@/feature/pipeline/repositories/DemoConsultantPipelineRepository";
import { PipelineConfigurationService } from "@/feature/pipeline/services/PipelineConfigurationService";

function alignment(candidateValue: number, brandTarget: number) {
  return Math.max(0, 100 - Math.abs(candidateValue - brandTarget));
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export class CandidateBrandStrategyRuntime {
  private readonly referralEvaluator = new ReferralReadinessEvaluator();
  private readonly presentationQuestions = new PresentationQuestionBuilder();
  private readonly brandIntelligence = new BrandIntelligenceRuntime();

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
    const pipelineService = new PipelineConfigurationService(new DemoConsultantPipelineRepository(), this.candidates);
    const visibleStage = pipelineService.resolveStage(await pipelineService.get(candidate.consultantId), candidate);

    const base = {
      id: candidate.id, fullName: `${candidate.firstName} ${candidate.lastName}`,
      stageLabel: visibleStage.displayName, readiness: candidate.intelligence?.overallReadiness ?? null,
      intelligenceSummary: candidate.intelligence?.executiveSummary ?? "Candidate Intelligence is not available.",
    };
    if (!candidate.intelligence) {
      return {
        available: false,
        unavailableReason: "Candidate Intelligence must be available before Brand Strategy can be generated.",
        candidate: base, overallStrategy: "", leadRecommendation: null, recommendations: [], presentationOrder: [],
        workflow: { status: "strategy-building", label: "Strategy Building", presented: 0, selected: 0, reactionsCaptured: 0, strongInterest: 0, referralSelections: 0, historical: false }, openConcerns: [],
        referralReadiness: null, referralDecision: null, lifecycleAction: null, referralHandoff: null, referralStrategyHandoff: null,
      };
    }

    const strategyCandidate = { ...candidate, intelligence: candidate.intelligence };
    const rankedRecommendations = brands
      .map((brand) => this.recommend(strategyCandidate, brand))
      .sort((left, right) => right.score - left.score)
      .map((recommendation, index) => ({
        ...recommendation, rank: index + 1,
        recommendationLabel: !recommendation.qualified
          ? "Not Financially Qualified" as const
          : index === 0 ? "Top Recommendation" as const : index === 1 ? "Strong Alternative" as const : "Alternative" as const,
      }));
    const persisted = demoCandidateOverlayStore.getStrategy(candidate.id);
    const historicalReferrals = getConferenceReferralHistory(candidate.id);
    const decisions = new Map(persisted?.decisions.map((item) => [item.brandId, item]) ?? []);
    const discoveryEvidence: Evidence[] = [
      ...(scenarioCandidate?.discovery.detectedBuyingSignals ?? []).map((description, index) => ({ id: `${candidate.id}-discovery-signal-${index}`, category: "motivation" as const, title: "Discovery buying signal", description, confidence: strategyCandidate.intelligence.timing.confidence, source: "meeting" as const, timestamp: candidate.updatedAt })),
      ...(scenarioCandidate?.discovery.detectedRisks ?? []).map((description, index) => ({ id: `${candidate.id}-discovery-risk-${index}`, category: "culture" as const, title: "Discovery consideration", description, confidence: 82, source: "meeting" as const, timestamp: candidate.updatedAt })),
    ];
    const recommendations = rankedRecommendations.map((item) => {
      const decision = decisions.get(item.brandId);
      const historical = historicalReferrals.find((referral) => referral.brandId === item.brandId);
      return { ...item, evidence: [...item.evidence, ...discoveryEvidence], selectedForPresentation: decision?.selectedForPresentation ?? Boolean(historical),
        presentationOrder: decision?.presentationOrder ?? (historical ? item.rank : null),
        candidateReaction: decision?.candidateReaction ?? (historical ? "strong-interest" as const : null),
        consultantNotes: decision?.consultantNotes ?? "",
        shortlistDisposition: decision?.shortlistDisposition ?? (historical ? "refer" as const : null),
        presentedAt: decision?.presentedAt ?? (historical ? historical.introducedAt : null) };
    });
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
    const referralSelections = recommendations.filter((item) => item.shortlistDisposition === "refer");
    const handoffRecommendations = persisted || historicalReferrals.length ? referralSelections : recommendations;
    const recommendedBrands = handoffRecommendations.map((item) => ({
      brandId: item.brandId, brandName: item.brandName, category: item.category, rank: item.rank,
      recommendationConfidence: item.confidence, recommendationScore: item.score,
      candidateBrandRationale: item.rationale, supportingEvidence: item.evidence,
      knownConcerns: [...new Set([...openConcerns, ...item.concerns])], financialCompatibility: item.investment,
      referralContact: brandsById.get(item.brandId)?.referralContact ?? null, presentationContext: item.presentationGuidance,
    }));
    const referralContext = { candidateId: candidate.id, candidateName: base.fullName, candidateEmail: candidate.email,
      referralReadiness: referral.status, candidateReadiness: candidate.intelligence.overallReadiness,
      referralGatePassed: gatePassed, referralReadinessPercentage: referral.percentage,
      unresolvedReadinessConsiderations: referral.remainingRequirements, strategyContext: overallStrategy };

    const selected = recommendations.filter((item) => item.selectedForPresentation).sort((a, b) => (a.presentationOrder ?? 999) - (b.presentationOrder ?? 999));
    const reactionsCaptured = selected.filter((item) => item.candidateReaction).length;
    const presented = selected.filter((item) => item.presentedAt).length;
    const historical = candidate.pipelineStage === "awarded";
    const workflowStatus: StrategyWorkflowStatus = historical ? "historical" : referralSelections.length ? "referral-selection-ready" : selected.length > 0 && presented === selected.length ? "final-shortlist-ready" : presented ? "candidate-discussion" : selected.length ? "presentation-set-ready" : "strategy-building";
    const labels: Record<StrategyWorkflowStatus, string> = { "strategy-building": "Build Presentation Set", "presentation-set-ready": "Ready to Present", "candidate-discussion": "Presentation In Progress", "final-shortlist-ready": "Review Candidate Reactions", "referral-selection-ready": "Ready for Referral", historical: "Historical" };
    return {
      available: true, candidate: base,
      overallStrategy,
      leadRecommendation: {
        statement: `${top.brandName} is the recommended lead presentation.`,
        comparisonHeading: `Why ${top.brandName} leads`,
        comparisonExplanation,
      },
      recommendations,
      presentationOrder: selected.map((item) => item.brandName),
      workflow: { status: workflowStatus, label: labels[workflowStatus], presented, selected: selected.length, reactionsCaptured,
        strongInterest: selected.filter((item) => item.candidateReaction === "strong-interest").length, referralSelections: referralSelections.length, historical },
      openConcerns,
      referralReadiness: {
        ...referral,
        label: referral.status === "ready" ? "Ready for Referral" : referral.status === "needs-validation" ? "Validation Required" : "Not Ready for Referral",
        explanation: referral.status === "ready" ? "Candidate readiness meets the canonical referral threshold." : "Resolve the remaining candidate evidence before a franchisor introduction.",
      },
      referralDecision: {
        passed: gatePassed,
        gateLabel: gatePassed ? "Recommended" : "Needs Attention",
        heading: gatePassed ? "Referral Readiness: Recommended" : "Referral Readiness: Needs Attention",
        explanation: gatePassed
          ? `${base.fullName} has satisfied the canonical readiness conditions for introduction. ${top.brandName} is the recommended lead opportunity.`
          : `FranGroove recommends completing the remaining discovery items before introduction. The consultant retains final authority for ${base.fullName}.`,
        unresolvedReasons: referral.remainingRequirements,
        nextAction: gatePassed ? "Open Referral Studio to review brands for referral." : "Review the advisory considerations or prepare a referral anyway.",
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
      selectedForPresentation: false,
      presentationOrder: null,
      candidateReaction: null,
      consultantNotes: "",
      shortlistDisposition: null,
      presentedAt: null,
    };
  }

  async loadPresentation(candidateId: string, requestedBrandId?: string): Promise<CandidateBrandPresentationState | null> {
    const [strategy, brands, governedProfiles] = await Promise.all([this.load(candidateId), this.brands.getAll(), this.brandIntelligence.getAll()]);
    if (!strategy) return null;
    const selected = strategy.recommendations.filter((item) => item.selectedForPresentation).sort((a, b) => (a.presentationOrder ?? 999) - (b.presentationOrder ?? 999));
    if (!strategy.available || selected.length === 0) return { available: false, reason: "Add at least one brand to the Presentation Set first.", candidateId, candidateName: strategy.candidate.fullName, historical: strategy.workflow.historical, completed: false, briefs: [], activeIndex: 0 };
    const byId = new Map(brands.map((brand) => [brand.id, brand]));
    const governedById = new Map(governedProfiles.map((profile) => [profile.brandId, profile]));
    const briefs = selected.map((item, index) => {
      const brand = byId.get(item.brandId);
      const governed = governedById.get(item.brandId);
      if (!brand || !governed) throw new Error(`Canonical brand profile missing for ${item.brandId}.`);
      const facts = [
        { label: "Industry", value: presentationValue(governed.category) ?? "Not Yet Available" },
        { label: "Business Model", value: presentationValue(governed.businessModel) ?? "Not Yet Available" },
        { label: "Customer Type", value: presentationValue(governed.customerType) ?? "Not Yet Available" },
        { label: "Owner Role", value: presentationValue(governed.ownerRole) ?? "Not Yet Available" },
        { label: "Staffing Model", value: presentationValue(governed.staffingModel) ?? "Not Yet Available" },
        { label: "Revenue Model", value: presentationValue(governed.revenueModel) ?? "Not Yet Available" },
        { label: "Investment Range", value: `${money(presentationValue(governed.financial.totalInvestmentMin) ?? brand.investment.minimum)}–${money(presentationValue(governed.financial.totalInvestmentMax) ?? brand.investment.maximum)}` },
        { label: "Training & Support", value: presentationValue(governed.trainingSupport.initialTraining) ?? "Not Yet Profiled" },
      ];
      const evidence = item.evidence.slice(0, 5).map((entry): PresentationTalkingPoint => ({ text: `${entry.title}: ${entry.description}`, source: entry.source === "meeting" ? "Discovery" : entry.category === "financial" ? "Financial Profile" : "Assessment" }));
      return { candidateId, candidateName: strategy.candidate.fullName, brandId: item.brandId, brandName: item.brandName,
        presentationOrder: index + 1, presentationCount: selected.length, aiRank: item.rank, aiMatch: item.score, recommendationConfidence: item.confidence,
        overview: presentationValue(governed.overview) ?? "Not Yet Profiled", facts, differentiators: presentationValue(governed.differentiators) ?? [], matchRationale: item.rationale, fitFactors: evidence,
        emphasize: [...item.fitDimensions.slice().sort((a, b) => b.alignment - a.alignment).slice(0, 2).map((fit) => ({ text: `Connect ${fit.label.toLowerCase()} (${fit.candidateValue}%) to this ownership model.`, source: "Assessment" as const })),
          ...[...item.presentationGuidance.emphasize, ...item.presentationGuidance.leadWith].slice(0, 3).map((text) => ({ text, source: "Brand Intelligence" as const }))],
        concerns: item.concerns.slice(0, 4).map((text) => ({ text, source: /investment|financial/i.test(text) ? "Financial Profile" as const : "Brand Intelligence" as const })),
        questions: this.presentationQuestions.build(presentationValue(governed.canonicalQuestions) ?? [], strategy.openConcerns),
        candidateReaction: item.candidateReaction, consultantNotes: item.consultantNotes, shortlistDisposition: item.shortlistDisposition, presentedAt: item.presentedAt };
    });
    const activeIndex = Math.max(0, requestedBrandId ? briefs.findIndex((item) => item.brandId === requestedBrandId) : briefs.findIndex((item) => !item.presentedAt));
    return { available: true, candidateId, candidateName: strategy.candidate.fullName, historical: strategy.workflow.historical,
      completed: strategy.workflow.historical || briefs.every((item) => Boolean(item.presentedAt)), briefs, activeIndex: activeIndex < 0 ? 0 : activeIndex };
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
