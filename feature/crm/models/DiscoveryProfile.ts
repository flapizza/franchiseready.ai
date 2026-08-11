export interface DiscoveryProfile {
  candidateId: string;

  readiness: number;

  confidence: number;

  buyingSignals: string[];

  concerns: string[];

  executiveSummary: string;

  discoveryCompleted: boolean;

  lastDiscoveryDate: string;
}