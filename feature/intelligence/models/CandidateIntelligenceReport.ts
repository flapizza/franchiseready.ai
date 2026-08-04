import type { CandidateDNA } from "./CandidateDNA";
import type { CompatibilityReport } from "./CompatibilityReport";
import type { ConsultantBrief } from "./ConsultantBrief";
import type { DiscoveryGuide } from "./DiscoveryGuide";
import type { HealthScore } from "./HealthScore";
import type { NextBestAction } from "./NextBestAction";

export type IntelligenceObservation = {
  id: string;
  title: string;
  description: string;
  confidence: number;
};

export type IntelligenceRisk = {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
};

export type IntelligenceStrength = {
  id: string;
  title: string;
  description: string;
};

export type CandidateIntelligenceReport = {
  generatedAt: string;

  overallReadiness: number;

  confidence: number;

  health: HealthScore;

  candidateDNA: CandidateDNA;

  executiveSummary: string;

  strengths: IntelligenceStrength[];

  risks: IntelligenceRisk[];

  observations: IntelligenceObservation[];

  discoveryGuide: DiscoveryGuide;

  consultantBrief: ConsultantBrief;

  nextBestAction: NextBestAction;

  compatibility: CompatibilityReport[];
};