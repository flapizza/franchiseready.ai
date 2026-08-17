import type { BrandProfile } from "../models/BrandProfile";

export const demoBrands: BrandProfile[] = [
  {
    id: "era-group",

    name: "ERA Group",

    shortDescription:
      "Global business consulting franchise specializing in cost optimization and operational improvement.",

    category: "B2B Consulting",

    website: "https://www.eragroup.com",
    referralContact: { name: "Franchise Development Team", email: "franchise@eragroup.com", title: "Franchise Development" },

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

    operatingModel: {
      teamModel: "small-team",
      salesIntensity: 88,
      operationalIntensity: 72,
      scheduleFlexibility: 86,
      primaryCustomer: "C-suite and senior business leaders",
    },

    culture: ["Executive peer network", "Analytical", "Consultative", "Autonomous"],
    successTraits: ["Executive credibility", "Complex problem solving", "Relationship-led business development"],
    poorFitTraits: ["Avoids networking", "Prefers transactional consumer sales", "Requires immediate sales cycles"],

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
  {
    id: "schooley-mitchell",
    name: "Schooley Mitchell",
    shortDescription:
      "Independent cost-reduction consulting franchise serving business clients.",
    category: "B2B Consulting",
    website: "https://www.schooleymitchell.com",
    referralContact: { name: "Franchise Development Team", email: "franchise@schooleymitchell.com", title: "Franchise Development" },
    investment: {
      minimum: 70000,
      maximum: 140000,
      liquidCapitalMinimum: 60000,
    },
    idealCandidate: {
      leadership: 88,
      sales: 92,
      operations: 84,
      financial: 82,
      relationshipBuilding: 94,
      coachability: 90,
    },
    businessModel: {
      recurringRevenue: true,
      ownerOperator: true,
      executiveModel: true,
      homeBased: true,
      b2b: true,
      b2c: false,
    },
    operatingModel: {
      teamModel: "solo",
      salesIntensity: 94,
      operationalIntensity: 58,
      scheduleFlexibility: 92,
      primaryCustomer: "Small and mid-sized business owners",
    },
    culture: ["Independent", "Relationship-driven", "Analytical", "Community-focused"],
    successTraits: ["Persistent prospecting", "Trust building", "Comfort with a focused owner-operator model"],
    poorFitTraits: ["Dislikes consistent outreach", "Seeks a large employee organization", "Prefers consumer retail"],
    strengths: [
      "Relationship development",
      "Consultative sales",
      "Analytical problem solving",
    ],
    considerations: ["Consistent networking", "Pipeline development"],
    discoveryQuestions: [
      "How do you build trust with business decision-makers?",
      "What is your approach to long-cycle relationship selling?",
    ],
    aiNotes: ["Strong fit for consultative B2B relationship builders."],
    tags: ["consulting", "b2b", "home-based", "recurring-revenue"],
  },
  {
    id: "actioncoach",
    name: "ActionCOACH",
    shortDescription:
      "Business coaching franchise serving owners and leadership teams.",
    category: "Business Coaching",
    website: "https://www.actioncoach.com",
    referralContact: { name: "Franchise Development Team", email: "franchise@actioncoach.com", title: "Franchise Development" },
    investment: {
      minimum: 90000,
      maximum: 220000,
      liquidCapitalMinimum: 75000,
    },
    idealCandidate: {
      leadership: 94,
      sales: 88,
      operations: 82,
      financial: 84,
      relationshipBuilding: 93,
      coachability: 96,
    },
    businessModel: {
      recurringRevenue: true,
      ownerOperator: true,
      executiveModel: true,
      homeBased: true,
      b2b: true,
      b2c: false,
    },
    operatingModel: {
      teamModel: "small-team",
      salesIntensity: 86,
      operationalIntensity: 68,
      scheduleFlexibility: 78,
      primaryCustomer: "Business owners and leadership teams",
    },
    culture: ["Coaching-led", "Accountability-oriented", "Collaborative", "Visible local leadership"],
    successTraits: ["Develops other leaders", "Confident facilitation", "Comfort holding owners accountable"],
    poorFitTraits: ["Avoids public leadership", "Prefers analytical work without coaching", "Low interest in local visibility"],
    strengths: [
      "Leadership coaching",
      "Business development",
      "Executive communication",
    ],
    considerations: ["Comfort coaching owners", "Local market visibility"],
    discoveryQuestions: [
      "What attracts you to developing other business leaders?",
      "How have you held senior leaders accountable for results?",
    ],
    aiNotes: ["Strong fit for experienced leaders with a coaching mindset."],
    tags: ["coaching", "b2b", "leadership", "home-based"],
  },
];

export function getDemoBrandById(id: string): BrandProfile {
  const brand = demoBrands.find((item) => item.id === id);

  if (!brand) {
    throw new Error(`Unknown demo brand: ${id}`);
  }

  return brand;
}
