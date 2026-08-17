import type { CandidateIntelligence } from "../models/CandidateIntelligence";
import type { CandidateIntelligenceProfile } from "@/feature/intelligence/models/CandidateIntelligenceProfile";

export interface CandidateIntelligenceAdapterContext {
  candidateId: string;
  intelligenceFlags: string[];
  detectedRisks: string[];
  detectedBuyingSignals: string[];
  nextDiscoveryFocus: string;
}

function status(confidence: number): "emerging" | "validated" {
  return confidence >= 80 ? "validated" : "emerging";
}

export class CandidateIntelligenceAdapter {
  public fromProfile(
    profile: CandidateIntelligenceProfile,
    context: CandidateIntelligenceAdapterContext,
  ): CandidateIntelligence {
    const dimension = (confidence: number, summary: string) => ({
      confidence,
      status: status(confidence),
      summary,
    });

    return {
      candidateId: context.candidateId,
      executiveSummary: profile.executiveSummary,
      readiness: profile.overallReadiness,
      confidence: profile.timing.confidence,
      buyingMotivation: dimension(
        profile.timing.urgency,
        context.detectedBuyingSignals.join(" ") || "Buying motivation requires Discovery validation.",
      ),
      leadership: dimension(
        profile.competencies.leadership,
        `${profile.behavioral.leadershipStyle} leadership profile.`,
      ),
      financialReadiness: dimension(
        profile.financial.financingLikelihood,
        `Investment range ${profile.financial.investmentRange}.`,
      ),
      familyAlignment: dimension(
        context.detectedRisks.some((risk) => risk.toLowerCase().includes("family"))
          ? 55
          : profile.timing.confidence,
        context.detectedRisks.join(" ") || "No family-alignment risk is currently detected.",
      ),
      lifestyleGoals: dimension(
        profile.behavioral.adaptability,
        profile.preferredBusinessModels.join(", "),
      ),
      decisionTimeline: dimension(
        profile.timing.confidence,
        profile.timing.decisionWindow,
      ),
      risks: context.detectedRisks.map((risk, index) => ({
        id: `risk-${index + 1}`,
        title: risk,
        description: risk,
        severity: "medium",
      })),
      strengths: context.intelligenceFlags.map((flag, index) => ({
        id: `strength-${index + 1}`,
        title: flag,
        description: flag,
      })),
      nextDiscoveryFocus: context.nextDiscoveryFocus,
    };
  }
}
