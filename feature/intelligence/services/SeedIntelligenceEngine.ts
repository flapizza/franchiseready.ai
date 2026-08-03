import type { CandidateIntelligenceProfile } from "../models/CandidateIntelligenceProfile";
import { demoProfile } from "../data/demoProfile";

export interface IntelligenceEngine {
  buildProfile(
    assessmentId: string,
  ): Promise<CandidateIntelligenceProfile>;
}

export class SeedIntelligenceEngine
  implements IntelligenceEngine
{
  async buildProfile(
    assessmentId: string,
  ): Promise<CandidateIntelligenceProfile> {
    return {
      ...demoProfile,
      id: assessmentId,
    };
  }
}