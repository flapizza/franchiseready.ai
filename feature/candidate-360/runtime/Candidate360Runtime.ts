import type { Candidate360State } from "../models/Candidate360State";

export class Candidate360Runtime {
  public load(candidateId: string): Candidate360State {
    return {
      id: candidateId,

      fullName: "Sarah Williams",

      currentStage: "Brand Strategy",

      readinessScore: 94,

      buyingConfidence: 97,

      recommendationConfidence: 96,

      executiveSummary:
        "Sarah is a highly qualified executive candidate demonstrating exceptional leadership, strong financial readiness, and a clear commitment to business ownership. Discovery meetings indicate excellent coachability and a high probability of successfully completing the franchise evaluation process.",

      financialReadiness: 95,

      leadershipReadiness: 98,

      lifestyleAlignment: 91,

      coachability: 96,

      nextBestAction:
        "Generate the referral package and introduce Sarah to ERA Group.",
    };
  }
}