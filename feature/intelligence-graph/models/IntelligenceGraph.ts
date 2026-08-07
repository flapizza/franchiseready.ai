import type { CandidateMemory } from "@/feature/intelligence/models/CandidateMemory";
import type { AIConfidence } from "@/feature/intelligence/models/AIConfidence";
import type { AIReasoning } from "@/feature/intelligence/models/AIReasoning";
import type { BrandRecommendation } from "@/feature/brand-strategy/models/BrandRecommendation";
import type { ConsultantCoaching } from "@/feature/consultant-portal/models/ConsultantCoaching";

export interface IntelligenceGraph {
  readiness: number;

  confidence: AIConfidence;

  reasoning: AIReasoning;

  memory: CandidateMemory;

  recommendations: BrandRecommendation[];

  coaching: ConsultantCoaching;
}