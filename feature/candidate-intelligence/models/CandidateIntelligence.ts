export interface CandidateIntelligence {
  candidateId: string;

  executiveSummary: string;

  readiness: number;

  confidence: number;

  buyingMotivation: IntelligenceDimension;

  leadership: IntelligenceDimension;

  financialReadiness: IntelligenceDimension;

  familyAlignment: IntelligenceDimension;

  lifestyleGoals: IntelligenceDimension;

  decisionTimeline: IntelligenceDimension;

  risks: IntelligenceRisk[];

  strengths: IntelligenceStrength[];

  nextDiscoveryFocus: string;
}

export interface IntelligenceDimension {
  confidence: number;

  status:
    | "unknown"
    | "emerging"
    | "validated";

  summary: string;
}

export interface IntelligenceRisk {
  id: string;

  title: string;

  description: string;

  severity:
    | "low"
    | "medium"
    | "high";
}

export interface IntelligenceStrength {
  id: string;

  title: string;

  description: string;
}