export interface ConsultantCoaching {
  opportunity: string;

  recommendation: string;

  expectedOutcome: string;

  priority:
    | "high"
    | "medium"
    | "low";
}