import type { CandidateRecord } from "../models/CandidateRecord";

import type { HealthScore } from "./HealthScore";

export class HealthEngine {
  calculate(
    candidate: CandidateRecord,
  ): HealthScore {
    const factors = [
      {
        name: "Readiness",
        weight: 30,
        value: candidate.intelligence.overallReadiness,
        explanation: "Overall assessment readiness",
      },
      {
        name: "Coachability",
        weight: 20,
        value: candidate.intelligence.behavioral.coachability,
        explanation: "Willingness to receive coaching",
      },
      {
        name: "Financial Readiness",
        weight: 25,
        value:
          candidate.intelligence.financial.financingLikelihood,
        explanation: "Ability to fund a franchise",
      },
      {
        name: "Timeline",
        weight: 25,
        value: candidate.intelligence.timing.urgency,
        explanation: "Expected buying timeframe",
      },
    ];

    const weightedScore =
      factors.reduce(
        (total, factor) =>
          total + factor.value * factor.weight,
        0,
      ) / 100;

    return {
      overall: Math.round(weightedScore),

      trend: "stable",

      strengths: [
        "High coachability",
        "Financially qualified",
        "Strong leadership",
      ],

      risks: [
        "Hiring experience should be validated",
      ],

      factors,
    };
  }
}