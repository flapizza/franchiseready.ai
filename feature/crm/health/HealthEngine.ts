import type { CandidateRecord } from "../models/CandidateRecord";

import type { HealthScore } from "./HealthScore";

export class HealthEngine {
  calculate(
    candidate: CandidateRecord,
  ): HealthScore {
    const intelligence = candidate.intelligence;
    if (!intelligence) throw new Error("Health scoring requires completed Candidate Intelligence.");
    const factors = [
      {
        name: "Readiness",
        weight: 30,
        value: intelligence.overallReadiness,
        explanation: "Overall assessment readiness",
      },
      {
        name: "Coachability",
        weight: 20,
        value: intelligence.behavioral.coachability,
        explanation: "Willingness to receive coaching",
      },
      {
        name: "Financial Readiness",
        weight: 25,
        value:
          intelligence.financial.financingLikelihood,
        explanation: "Ability to fund a franchise",
      },
      {
        name: "Timeline",
        weight: 25,
        value: intelligence.timing.urgency,
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
