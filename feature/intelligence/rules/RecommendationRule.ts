import type { DiscoveryContext } from "@/feature/discovery/models/DiscoveryContext";

import type {
  ExecutiveEvidence,
  ExecutiveRisk,
} from "../models/ExecutiveRecommendation";

export interface RecommendationRuleResult {
  evidence?: ExecutiveEvidence[];

  risks?: ExecutiveRisk[];

  confidenceAdjustment?: number;
}

export interface RecommendationRule {
  evaluate(
    context: DiscoveryContext,
  ): RecommendationRuleResult;
}