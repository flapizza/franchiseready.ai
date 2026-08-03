import type { Response } from "@/feature/assessment-engine/types/domain";

import type { CandidateIntelligence } from "../models/CandidateIntelligence";
import type { FinancialProfile } from "../services/FinancialAnalysisService";

import { BehaviorAnalysisService } from "../services/BehaviorAnalysisService";
import { FinancialAnalysisService } from "../services/FinancialAnalysisService";

export interface IntelligenceBuildInput {
  responses: Response[];

  financialProfile: FinancialProfile;
}

export class IntelligenceEngine {
  private readonly behaviorService =
    new BehaviorAnalysisService();

  private readonly financialService =
    new FinancialAnalysisService();

  public build(
    input: IntelligenceBuildInput,
  ): CandidateIntelligence {
    const behavioral =
      this.behaviorService.analyze(
        input.responses,
      );

    const financial =
      this.financialService.analyze(
        input.financialProfile,
      );

    return {
      overallReadiness: this.calculateOverallReadiness(
        behavioral,
        financial,
      ),

      behavioral,

      financial,

      leadership: {
        accountability: 75,
        delegation: 75,
        hiringReadiness: 75,
        decisionMaking: 75,
        influence: 75,
      },

      operations: {
        organization: 75,
        processOrientation: 75,
        consistency: 75,
        execution: 75,
      },

      sales: {
        networking: 75,
        relationshipBuilding: 75,
        consultativeSelling: 75,
        businessDevelopment: 75,
      },

      lifestyle: {
        workLifeBalance: 75,
        scheduleFlexibility: 75,
        travelPreference: 75,
        teamPreference: 75,
      },

      timing: {
        urgency: 75,
        familyAlignment: 75,
        fundingReadiness: financial.financingLikelihood,
        emotionalCommitment: 75,
        buyingConfidence: 75,
      },

      risk: {
        riskTolerance: 75,
        resilience: behavioral.resilience,
        uncertaintyComfort: 75,
      },

      motivation: {
        wealthCreation: 75,
        independence: 75,
        purpose: 75,
        lifestyle: 75,
        legacy: 75,
      },
    };
  }

  private calculateOverallReadiness(
    behavioral: CandidateIntelligence["behavioral"],
    financial: CandidateIntelligence["financial"],
  ): number {
    return Math.round(
      (
        behavioral.coachability +
        behavioral.communication +
        financial.financingLikelihood +
        financial.investmentCapacity
      ) / 4,
    );
  }
}