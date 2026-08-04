import type { CandidateRecord } from "../models/CandidateRecord";
import type { CandidateAction } from "../models/CandidateAction";

export class CandidateActionService {
  build(candidate: CandidateRecord): CandidateAction[] {
    const actions: CandidateAction[] = [];

    const readiness = candidate.intelligence.overallReadiness;
    const health = candidate.healthScore;
    const coachability =
      candidate.intelligence.behavioral.coachability;

    if (readiness >= 85) {
      actions.push({
        id: "schedule-discovery",

        title: "Schedule Discovery Meeting",

        description:
          "Advance the candidate into a structured discovery meeting.",

        reason:
          "Overall readiness indicates a highly qualified franchise candidate.",

        priority: "critical",

        impact: "High",

        confidence: 96,

        status: "pending",

        estimatedMinutes: 30,

        recommendedOutcome:
          "Discovery meeting scheduled and candidate advances to validation.",

        tags: [
          "Discovery",
          "Qualification",
        ],
      });
    }

    if (coachability >= 80) {
      actions.push({
        id: "discuss-growth",

        title: "Discuss Long-Term Ownership Goals",

        description:
          "Explore the candidate's long-term vision for business ownership.",

        reason:
          "High coachability indicates the candidate is likely to respond well to strategic coaching.",

        priority: "high",

        impact: "High",

        confidence: 92,

        status: "pending",

        estimatedMinutes: 15,

        recommendedOutcome:
          "Validated ownership expectations.",

        tags: [
          "Discovery",
          "Leadership",
        ],
      });
    }

    if (health >= 90) {
      actions.push({
        id: "brand-presentation",

        title: "Present Recommended Brands",

        description:
          "Introduce the highest-ranked franchise opportunities.",

        reason:
          "Candidate health score indicates readiness to begin evaluating brands.",

        priority: "high",

        impact: "High",

        confidence: 90,

        status: "pending",

        estimatedMinutes: 25,

        recommendedOutcome:
          "Candidate selects one or more brands for deeper exploration.",

        tags: [
          "Brand Match",
          "Sales",
        ],
      });
    }

    actions.push({
      id: "financial-review",

      title: "Confirm Financial Qualification",

      description:
        "Review available capital and expected investment range.",

      reason:
        "Financial readiness should always be validated before introducing brands.",

      priority: "medium",

      impact: "Medium",

      confidence: 88,

      status: "pending",

      estimatedMinutes: 20,

      recommendedOutcome:
        "Financial qualification confirmed.",

      tags: [
        "Financial",
      ],
    });

    return actions.sort((a, b) => {
      const order = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };

      return order[a.priority] - order[b.priority];
    });
  }
}