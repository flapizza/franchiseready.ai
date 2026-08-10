import type {
  CandidateKnowledgeGraph,
} from "../models/CandidateKnowledgeGraph";

export class CandidateKnowledgeGraphRuntime {
  public build(): CandidateKnowledgeGraph {
    return {
      candidateId: "candidate-demo",

      generatedAt: new Date().toISOString(),

      identity: {
        fullName: "John Smith",

        currentCareer: "Regional Vice President",

        yearsLeadership: 22,
      },

      leadership: {
        confidence: 94,

        evidence: [
          "Managed 300+ employees",
          "Multi-state leadership experience",
        ],
      },

      financial: {
        liquidCapital: 250000,

        investmentCapacity: 450000,

        confidence: 92,
      },

      buying: {
        confidence: 90,

        urgency: 82,

        motivation: [
          "Leave corporate America",
          "Build long-term wealth",
        ],
      },

      lifestyle: {
        preferredModels: [
          "Executive Consulting",
          "B2B Services",
        ],

        recurringRevenue: true,
      },

      family: {
        aligned: null,

        notes: [
          "Needs Discovery validation",
        ],
      },

      risks: [
        {
          id: "1",

          title: "Family Alignment",

          severity: "medium",
        },
      ],

      recommendations: [
        {
          brand: "ERA Group",

          confidence: 97,

          reasons: [
            "Executive leadership",
            "Consultative sales",
            "Financial readiness",
          ],
        },
      ],

      timeline: [
        {
          id: "1",

          timestamp: "10:02",

          title: "Assessment Completed",

          description:
            "Initial Candidate DNA generated.",
        },
      ],
    };
  }
}