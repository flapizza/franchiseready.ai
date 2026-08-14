import type { ReferralPackage } from "../models/ReferralPackage";

import type { CandidateIntelligenceState } from "@/feature/intelligence/models/CandidateIntelligenceState";

export class ReferralPackageEngine {
  public generate(
    intelligence: CandidateIntelligenceState,
  ): ReferralPackage {
    return {
      consultant: {
        companyName: "Smith Franchise Advisors",
        consultantName: "Jim Wood",
        website: "www.smithfranchise.com",
        email: "jim@example.com",
      },

      candidate: {
        fullName: "John Smith",
        readiness: intelligence.readiness,
        confidence: intelligence.confidence,
      },

      brand: {
        name: "ERA Group",
        overallFit: 95,
      },

      executiveSummary:
        intelligence.executiveSummary,

      strengths: [
        "Executive leadership",
        "Financial readiness",
        "Buying intent",
      ],

      remainingRisks: [
        "Family alignment",
      ],

      consultantRecommendation:
        "I recommend advancing this candidate into the brand's discovery process.",

      generatedAt:
        new Date().toLocaleString(),
    };
  }
}