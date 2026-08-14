import type { Evidence } from "./Evidence";

export interface EvidenceGraph {
  candidateId: string;

  evidence: Evidence[];

  confidence: number;
}