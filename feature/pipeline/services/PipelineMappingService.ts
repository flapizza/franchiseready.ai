import type { CanonicalLifecycleStage } from "@/feature/crm/models/CandidateRecord";

export const CANONICAL_LIFECYCLE_LABELS: Record<CanonicalLifecycleStage, string> = {
  lead: "Lead", qualification: "Qualification", assessment: "Assessment", discovery: "Discovery",
  "brand-strategy": "Brand Strategy", validation: "Validation", referral: "Referral",
  "franchisor-process": "Franchisor Process", decision: "Decision", awarded: "Awarded", closed: "Closed", other: "Other / Evidence-led",
};

export function suggestLifecycleMapping(name: string): CanonicalLifecycleStage | null {
  const value = name.trim().toLowerCase();
  if (/fund|financ/.test(value)) return "qualification";
  if (/brand presentation|concept review|opportunit/.test(value)) return "brand-strategy";
  if (/fdd|meet the team|discovery with brand|franchisor/.test(value)) return "franchisor-process";
  if (/decision day|decision/.test(value)) return "decision";
  if (/assess/.test(value)) return "assessment";
  if (/refer|introduc/.test(value)) return "referral";
  if (/discover/.test(value)) return "discovery";
  return null;
}
