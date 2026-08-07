import type { AIConfidence } from "../models/AIConfidence";

export class AIConfidenceEngine {
  public evaluate(): AIConfidence {
    return {
      overall: 96,

      previous: 91,

      trend: "up",

      evidence: [
        "Executive leadership validated.",
        "Financial readiness confirmed.",
        "Buying intent increased.",
        "Candidate demonstrates strong coachability.",
      ],

      uncertainty: [
        "Validate preferred ownership role.",
      ],

      nextMilestone:
        "Complete family alignment discussion.",

      predictedConfidence: 98,
    };
  }
}