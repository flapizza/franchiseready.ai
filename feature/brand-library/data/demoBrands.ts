import type { BrandProfile } from "../models/BrandProfile";

export const demoBrands: BrandProfile[] = [
  {
    id: "era",

    name: "ERA Group",

    shortDescription:
      "Global business consulting franchise specializing in cost optimization and operational improvement.",

    category: "B2B Consulting",

    website: "https://www.eragroup.com",

    investment: {
      minimum: 85000,
      maximum: 175000,
      liquidCapitalMinimum: 75000,
    },

    idealCandidate: {
      leadership: 95,
      sales: 90,
      operations: 98,
      financial: 85,
      relationshipBuilding: 92,
      coachability: 95,
    },

    businessModel: {
      recurringRevenue: true,
      ownerOperator: false,
      executiveModel: true,
      homeBased: true,
      b2b: true,
      b2c: false,
    },

    strengths: [
      "Executive leadership",
      "Relationship selling",
      "Business development",
      "Consultative mindset",
    ],

    considerations: [
      "Comfort with networking",
      "Long sales cycle",
    ],

    discoveryQuestions: [
      "How comfortable are you developing executive relationships?",
      "Tell me about a time you sold an intangible service.",
    ],

    aiNotes: [
      "High fit for executives leaving corporate leadership.",
    ],

    tags: [
      "executive",
      "consulting",
      "b2b",
      "home-based",
    ],
  },
];