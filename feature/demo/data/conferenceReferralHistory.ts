import type { CandidateBrandReferral } from "@/feature/referral-package/models/CandidateBrandReferral";
import { demoConsultant } from "./demoConsultant";

const preparedAt = "2026-07-28T14:00:00.000Z";
const approvedAt = "2026-07-29T15:00:00.000Z";
const introducedAt = "2026-07-30T16:00:00.000Z";
const referralId = "referral:robert-king:era-group";
const sarahReferralId = "referral:sarah-williams:era-group";

export const conferenceReferralHistory: readonly CandidateBrandReferral[] = [{
  referralId, candidateId: "robert-king", brandId: "era-group", brandName: "ERA Group", source: "recommended",
  recommendationRank: 1, recommendationScore: 97, recommendationConfidence: 98, packageId: "package-robert-era",
  status: "introduced", createdAt: preparedAt, updatedAt: introducedAt, approvedAt, introducedAt, deliveryStatus: "recorded",
  decision: { consultantDirected: false, aiReadinessStatus: "ready", readinessPercentage: 100, lifecycleStage: "referral", unresolvedConsiderations: [], decidedAt: preparedAt },
  referralPackage: {
    id: "package-robert-era", referralId, candidateId: "robert-king", status: "introduced", source: "recommended",
    candidate: { name: "Robert King", email: "robert.king@example.com", phone: "(555) 010-1209", location: "Charlotte, NC", territory: null, lifecycleStage: "awarded", readiness: 96 },
    brand: { id: "era-group", name: "ERA Group", category: "Business Consulting", contact: null },
    consultant: { id: demoConsultant.id, name: demoConsultant.displayName, title: demoConsultant.title, email: demoConsultant.email ?? null, phone: demoConsultant.phone ?? null, companyName: demoConsultant.companyName ?? null },
    recommendation: { score: 97, confidence: 98, rationale: "Validated leadership, financial capacity, and systems alignment supported the introduction.", strategyContext: "ERA Group led the completed multi-brand strategy review." },
    financial: { liquidCapital: 242500, investableCapital: 388000, netWorth: null, candidatePreferredInvestmentRange: "$300k–$650k", brandInvestmentRange: null, qualified: true },
    executiveSummary: "Robert completed the evaluation lifecycle and accepted a franchise award.", motivations: ["Executive Advisory", "B2B Services"],
    strengths: ["Executive leadership", "Financial qualification", "Systems orientation"], discoveryFindings: ["Confirmed ownership timeline", "Validated operating role"], concerns: [], conversationFocus: ["Completed introduction history"], evidence: [],
    editable: { subject: "Introduction: Robert King — ERA Group", introductionMessage: "Historical introduction recorded for the canonical conference scenario.", consultantNotes: "" },
    handoff: null, preparedAt, approvedAt, introducedAt,
  },
}, {
  referralId: sarahReferralId, candidateId: "sarah-williams", brandId: "era-group", brandName: "ERA Group", source: "recommended",
  recommendationRank: 1, recommendationScore: 97, recommendationConfidence: 97, packageId: "package-sarah-era",
  status: "ready-for-review", createdAt: "2026-08-15T14:00:00.000Z", updatedAt: "2026-08-15T14:00:00.000Z", approvedAt: null, introducedAt: null, deliveryStatus: "not-recorded",
  decision: { consultantDirected: false, aiReadinessStatus: "ready", readinessPercentage: 97, lifecycleStage: "referral", unresolvedConsiderations: [], decidedAt: "2026-08-15T14:00:00.000Z" },
  referralPackage: {
    id: "package-sarah-era", referralId: sarahReferralId, candidateId: "sarah-williams", status: "ready-for-review", source: "recommended",
    candidate: { name: "Sarah Williams", email: "sarah.williams@example.com", phone: "(555) 010-1206", location: "Greensboro, NC", territory: null, lifecycleStage: "referral", readiness: 94 },
    brand: { id: "era-group", name: "ERA Group", category: "B2B Consulting", contact: null },
    consultant: { id: demoConsultant.id, name: demoConsultant.displayName, title: demoConsultant.title, email: demoConsultant.email ?? null, phone: demoConsultant.phone ?? null, companyName: demoConsultant.companyName ?? null },
    recommendation: { score: 97, confidence: 97, rationale: "Validated executive leadership, financial capacity, and consultative B2B alignment support the ERA Group introduction.", strategyContext: "ERA Group is Sarah's consultant-selected referral opportunity." },
    financial: { liquidCapital: 237500, investableCapital: 380000, netWorth: null, candidatePreferredInvestmentRange: "$250k–$500k", brandInvestmentRange: "$85,000–$175,000", qualified: true },
    executiveSummary: "Sarah has completed validation and is ready for an ERA Group franchisor introduction.", motivations: ["Executive Advisory", "B2B Services"],
    strengths: ["Executive leadership", "Financial qualification", "Consultative business development"], discoveryFindings: ["Referral ready"], concerns: [], conversationFocus: ["Executive ownership model", "Recurring-revenue potential"], evidence: [],
    editable: { subject: "Introduction: Sarah Williams — ERA Group", introductionMessage: "Prepared consultant introduction for Sarah Williams and ERA Group.", consultantNotes: "" },
    handoff: null, preparedAt: "2026-08-15T14:00:00.000Z", approvedAt: null, introducedAt: null,
  },
}] as const;

export function getConferenceReferralHistory(candidateId: string): CandidateBrandReferral[] {
  return structuredClone(conferenceReferralHistory.filter((item) => item.candidateId === candidateId));
}

export function getConferenceReferralById(referralId: string): CandidateBrandReferral | null {
  const referral = conferenceReferralHistory.find((item) => item.referralId === referralId);
  return referral ? structuredClone(referral) : null;
}
