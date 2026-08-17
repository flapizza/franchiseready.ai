import type { ReferralPackage } from "../models/ReferralPackage";

import type { CandidateIntelligenceState } from "@/feature/intelligence/models/CandidateIntelligenceState";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { getDemoBrandById } from "@/feature/brand-library/data/demoBrands";

export class ReferralPackageEngine {
  public generate(
    intelligence: CandidateIntelligenceState,
  ): ReferralPackage {
    const eraGroup = getDemoBrandById("era-group");

    return {
      consultant: {
        companyName: "Smith Franchise Advisors",
        consultantName: demoConsultant.displayName,
        website: "www.smithfranchise.com",
        email: "jim@example.com",
      },

      candidate: {
        fullName: "John Smith",
        readiness: intelligence.readiness,
        confidence: intelligence.confidence,
      },

      brand: {
        name: eraGroup.name,
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
