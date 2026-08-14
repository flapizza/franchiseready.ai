export type DecisionEvidenceSource =
  | "assessment"
  | "discovery"
  | "meeting"
  | "intelligence";

export interface DecisionEvidence {
  id: string;

  title: string;

  explanation: string;

  source: DecisionEvidenceSource;

  strength: number;
}