export interface Reasoning {
  recommendation: string;

  explanation: string;

  confidence: number;

  supportingEvidence: string[];

  opposingEvidence: string[];

  nextAction: string;
}