import type { CandidateIntelligenceProfile } from "@/feature/intelligence/models/CandidateIntelligenceProfile";
import type { PipelineStage } from "@/feature/crm/models/CandidateRecord";
import { getDemoBrandById } from "@/feature/brand-library/data/demoBrands";

import type {
  BuyingMomentum,
  DemoCandidate,
  DemoScenario,
} from "../models/DemoScenario";
import { demoConsultant } from "./demoConsultant";

const DEMO_NOW = "2026-08-17T13:00:00.000Z";

type CandidateSeed = {
  id: string;
  firstName: string;
  lastName: string;
  stage: PipelineStage;
  readiness: number;
  confidence: number;
  health: number;
  momentum: BuyingMomentum;
  investmentRange: string;
  financingReadiness: number;
  decisionWindow: string;
  nextBestAction: string;
  explanation: string;
  flags: string[];
  referralReadiness: number;
  brandIds?: string[];
  discoveryStatus?: DemoCandidate["discovery"]["status"];
};

function readinessLevel(score: number): CandidateIntelligenceProfile["readinessLevel"] {
  if (score >= 92) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 65) return "Developing";
  return "Emerging";
}

function buildIntelligence(seed: CandidateSeed): CandidateIntelligenceProfile {
  const recommendations = (seed.brandIds ?? []).map((brandId, index) => {
    const brand = getDemoBrandById(brandId);
    const fit = Math.max(72, seed.readiness - index * 4 + 3);

    return {
      id: brand.id,
      name: brand.name,
      overallFit: fit,
      behavioralFit: Math.max(70, fit - 2),
      competencyFit: Math.min(99, fit + 1),
      financialFit: seed.financingReadiness,
      timingFit: Math.max(70, seed.confidence - 2),
      confidence: seed.confidence,
      reasons: brand.strengths.slice(0, 3),
      discussionPoints: brand.discoveryQuestions,
    };
  });

  return {
    id: seed.id,
    completedAt: DEMO_NOW,
    overallReadiness: seed.readiness,
    readinessLevel: readinessLevel(seed.readiness),
    timing: {
      decisionWindow: seed.decisionWindow,
      urgency: seed.confidence,
      confidence: seed.confidence,
    },
    financial: {
      liquidCapital: seed.financingReadiness * 2500,
      investableCapital: seed.financingReadiness * 4000,
      investmentRange: seed.investmentRange,
      financingLikelihood: seed.financingReadiness,
    },
    behavioral: {
      leadershipStyle: "Executive Builder",
      decisionStyle: "Analytical",
      relationshipStyle: "Consultative",
      systemsOrientation: Math.max(65, seed.readiness - 2),
      coachability: Math.min(98, seed.readiness + 3),
      adaptability: Math.max(65, seed.readiness - 1),
      riskTolerance: 73,
    },
    competencies: {
      leadership: Math.min(98, seed.readiness + 4),
      sales: Math.max(68, seed.readiness - 1),
      operations: Math.max(66, seed.readiness - 5),
      finance: seed.financingReadiness,
      hiring: Math.max(65, seed.readiness - 8),
      networking: Math.max(68, seed.readiness - 3),
      communication: Math.min(98, seed.readiness + 2),
      strategicThinking: Math.min(97, seed.readiness + 1),
    },
    preferredBusinessModels: ["Executive Advisory", "B2B Services"],
    recommendedCategories: ["Business Consulting", "Commercial Services"],
    recommendations,
    discoveryPriorities: seed.flags,
    executiveSummary: seed.explanation,
  };
}

function buildCandidate(seed: CandidateSeed, index: number): DemoCandidate {
  const fullName = `${seed.firstName} ${seed.lastName}`;

  return {
    id: seed.id,
    firstName: seed.firstName,
    lastName: seed.lastName,
    initials: `${seed.firstName[0]}${seed.lastName[0]}`,
    email: `${seed.firstName}.${seed.lastName}@example.com`.toLowerCase(),
    phone: `(555) 010-${String(1200 + index).padStart(4, "0")}`,
    city: index % 2 === 0 ? "Greensboro" : "Charlotte",
    state: "NC",
    country: "USA",
    consultantId: demoConsultant.id,
    status: seed.stage === "awarded" ? "won" : "active",
    pipelineStage: seed.stage,
    healthScore: seed.health,
    confidence: seed.confidence,
    buyingMomentum: seed.momentum,
    nextBestAction: seed.nextBestAction,
    aiExplanation: seed.explanation,
    intelligenceFlags: seed.flags,
    discovery: {
      status: seed.discoveryStatus ?? "not-started",
      focus: seed.flags[0] ?? "Validate ownership goals.",
      notes: `${fullName} is progressing through the conference demo lifecycle.`,
      completedObjectives: seed.discoveryStatus === "completed"
        ? ["Validate ownership motivation", "Confirm investment range"]
        : [],
      detectedRisks: seed.flags.filter((flag) =>
        flag.toLowerCase().includes("confirm") || flag.toLowerCase().includes("risk"),
      ),
      detectedBuyingSignals: seed.momentum === "accelerating"
        ? ["Asked about next steps", "Confirmed ownership timeline"]
        : ["Expressed interest in business ownership"],
    },
    referralReadiness: seed.referralReadiness,
    recommendedBrands: (seed.brandIds ?? []).map((brandId, brandIndex) => ({
      brandId,
      fit: Math.max(72, seed.readiness - brandIndex * 4 + 3),
    })),
    recentActivity: [
      {
        id: `${seed.id}-activity-1`,
        occurredAt: DEMO_NOW,
        title: seed.nextBestAction,
        detail: seed.explanation,
      },
    ],
    createdAt: "2026-07-20T13:00:00.000Z",
    updatedAt: DEMO_NOW,
    lastActivityAt: DEMO_NOW,
    assessmentIds:
      seed.stage === "assessment-started"
        ? []
        : [`assessment-${seed.id}-1`],
    intelligence: buildIntelligence(seed),
  };
}

const candidateSeeds: CandidateSeed[] = [
  {
    id: "candidate-demo", firstName: "John", lastName: "Smith",
    stage: "discovery", readiness: 87, confidence: 92, health: 92,
    momentum: "accelerating", investmentRange: "$200k–$500k",
    financingReadiness: 92, decisionWindow: "60–90 Days",
    nextBestAction: "Complete Discovery",
    explanation: "John combines executive leadership, strong financial readiness, and high coachability; family alignment remains the final Discovery focus.",
    flags: ["Confirm family alignment", "Validate desired ownership role"],
    referralReadiness: 74, brandIds: ["era-group", "schooley-mitchell", "actioncoach"],
    discoveryStatus: "active",
  },
  {
    id: "mike-lavalle", firstName: "Mike", lastName: "Lavalle",
    stage: "discovery", readiness: 73, confidence: 68, health: 64,
    momentum: "slowing", investmentRange: "$150k–$300k",
    financingReadiness: 82, decisionWindow: "90–120 Days",
    nextBestAction: "Schedule Discovery Follow-up",
    explanation: "Mike remains financially qualified, but recent engagement has slowed and his ownership timeline needs validation.",
    flags: ["Reconfirm ownership motivation", "Decision timeline risk"],
    referralReadiness: 48, brandIds: ["schooley-mitchell"], discoveryStatus: "scheduled",
  },
  {
    id: "jared-wirsig", firstName: "Jared", lastName: "Wirsig",
    stage: "brand-matching", readiness: 91, confidence: 93, health: 90,
    momentum: "accelerating", investmentRange: "$250k–$600k",
    financingReadiness: 94, decisionWindow: "30–60 Days",
    nextBestAction: "Present Brand Strategy",
    explanation: "Jared completed Discovery with strong leadership, financial, and systems-alignment evidence.",
    flags: ["Compare executive business models"], referralReadiness: 88,
    brandIds: ["era-group", "actioncoach"], discoveryStatus: "completed",
  },
  {
    id: "christine-williams", firstName: "Christine", lastName: "Williams",
    stage: "validation", readiness: 82, confidence: 79, health: 78,
    momentum: "steady", investmentRange: "$150k–$350k",
    financingReadiness: 86, decisionWindow: "60–90 Days",
    nextBestAction: "Validate Family Alignment",
    explanation: "Christine is operationally ready, with family alignment as the primary unresolved validation item.",
    flags: ["Confirm family alignment"], referralReadiness: 67,
    brandIds: ["actioncoach"], discoveryStatus: "completed",
  },
  {
    id: "sarah-williams", firstName: "Sarah", lastName: "Williams",
    stage: "referral", readiness: 94, confidence: 97, health: 95,
    momentum: "accelerating", investmentRange: "$250k–$500k",
    financingReadiness: 95, decisionWindow: "30 Days",
    nextBestAction: "Generate Referral Package",
    explanation: "Sarah has completed validation and is ready for an ERA Group franchisor introduction.",
    flags: ["Referral ready"], referralReadiness: 97,
    brandIds: ["era-group"], discoveryStatus: "completed",
  },
  {
    id: "michael-chen", firstName: "Michael", lastName: "Chen",
    stage: "assessment-completed", readiness: 69, confidence: 72, health: 76,
    momentum: "steady", investmentRange: "$100k–$250k",
    financingReadiness: 78, decisionWindow: "6–12 Months",
    nextBestAction: "Schedule Discovery",
    explanation: "Michael completed the assessment and is ready for his first consultant-led Discovery conversation.",
    flags: ["Explore ownership motivation"], referralReadiness: 32,
  },
  {
    id: "priya-patel", firstName: "Priya", lastName: "Patel",
    stage: "assessment-started", readiness: 58, confidence: 54, health: 70,
    momentum: "steady", investmentRange: "$100k–$200k",
    financingReadiness: 74, decisionWindow: "12+ Months",
    nextBestAction: "Complete Assessment",
    explanation: "Priya has begun the readiness assessment; more evidence is required before consultant recommendations.",
    flags: ["Assessment incomplete"], referralReadiness: 15,
  },
  {
    id: "david-thompson", firstName: "David", lastName: "Thompson",
    stage: "lead", readiness: 85, confidence: 84, health: 87,
    momentum: "steady", investmentRange: "$200k–$400k",
    financingReadiness: 89, decisionWindow: "60 Days",
    nextBestAction: "Send Assessment Invitation",
    explanation: "David has a basic candidate record and is ready to begin the assessment journey.",
    flags: ["Assessment not yet invited"], referralReadiness: 0,
  },
  {
    id: "elena-rodriguez", firstName: "Elena", lastName: "Rodriguez",
    stage: "brand-matching", readiness: 88, confidence: 89, health: 91,
    momentum: "accelerating", investmentRange: "$175k–$400k",
    financingReadiness: 90, decisionWindow: "45–60 Days",
    nextBestAction: "Review Top Brand Matches",
    explanation: "Elena has strong commercial leadership evidence and is ready to compare her top franchise models.",
    flags: ["Compare lifestyle alignment"], referralReadiness: 82,
    brandIds: ["actioncoach", "era-group"], discoveryStatus: "completed",
  },
  {
    id: "robert-king", firstName: "Robert", lastName: "King",
    stage: "awarded", readiness: 96, confidence: 98, health: 98,
    momentum: "accelerating", investmentRange: "$300k–$650k",
    financingReadiness: 97, decisionWindow: "Awarded",
    nextBestAction: "Prepare Onboarding",
    explanation: "Robert completed the evaluation lifecycle and accepted a franchise award.",
    flags: ["Award completed"], referralReadiness: 100,
    brandIds: ["era-group"], discoveryStatus: "completed",
  },
];

export const conferenceScenario: DemoScenario = {
  consultant: demoConsultant,
  candidates: [],
  meetings: [
    { id: "meeting-mike", candidateId: "mike-lavalle", time: "2:00 PM", focus: "Validate ownership motivation and decision timeline." },
    { id: "meeting-christine", candidateId: "christine-williams", time: "3:30 PM", focus: "Discuss family alignment and financial expectations." },
  ],
};

conferenceScenario.candidates = candidateSeeds.map(buildCandidate);
