import type { CandidateIntelligence } from "../models/CandidateIntelligence";
import type { ConsultantBrief } from "../models/ConsultantBrief";
import type { DiscoveryGuide } from "../models/DiscoveryGuide";

export class ConsultantBriefService {
  public build(
    candidateName: string,
    intelligence: CandidateIntelligence,
    discoveryGuide: DiscoveryGuide,
  ): ConsultantBrief {
    return {
      executiveSummary: this.buildExecutiveSummary(
        candidateName,
        intelligence,
      ),

      strengths: discoveryGuide.strengths,

      concerns: discoveryGuide.concerns,

      recommendedApproach:
        this.buildRecommendedApproach(intelligence),

      openingQuestions:
        discoveryGuide.recommendedQuestions,

      discoveryObjectives:
        this.buildObjectives(intelligence),

      nextBestActions:
        discoveryGuide.followUpRecommendations,
    };
  }

  private buildExecutiveSummary(
    candidateName: string,
    intelligence: CandidateIntelligence,
  ): string {
    const readiness =
      intelligence.overallReadiness;

    if (readiness >= 90) {
      return `${candidateName} appears highly prepared for franchise ownership with strong leadership, financial readiness, and coachability. Focus on confirming brand alignment and long-term objectives.`;
    }

    if (readiness >= 75) {
      return `${candidateName} demonstrates solid franchise potential. Use discovery to validate operational expectations, funding strategy, and decision timeline.`;
    }

    return `${candidateName} would benefit from additional qualification before advancing through the franchise process.`;
  }

  private buildRecommendedApproach(
    intelligence: CandidateIntelligence,
  ): string {
    if (
      intelligence.behavioral.coachability >= 90
    ) {
      return "Lead with education and collaborative discovery. This candidate is likely to respond well to coaching.";
    }

    if (
      intelligence.sales.relationshipBuilding >= 90
    ) {
      return "Use a conversational approach focused on relationships and long-term goals.";
    }

    return "Begin with exploratory discovery to better understand motivations, expectations, and readiness.";
  }

  private buildObjectives(
    intelligence: CandidateIntelligence,
  ): string[] {
    const objectives: string[] = [];

    if (
      intelligence.financial.financingLikelihood <
      75
    ) {
      objectives.push(
        "Confirm financing strategy.",
      );
    }

    if (
      intelligence.operations.execution <
      75
    ) {
      objectives.push(
        "Discuss operational responsibilities.",
      );
    }

    objectives.push(
      "Confirm business ownership goals.",
    );

    objectives.push(
      "Validate buying timeline.",
    );

    objectives.push(
      "Identify best franchise categories.",
    );

    return objectives;
  }
}