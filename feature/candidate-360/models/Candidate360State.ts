export interface Candidate360State {
  id: string;

  fullName: string;

  currentStage: string;

  hasIntelligence: boolean;

  assessmentStatus: "not-completed" | "pending" | "completed";

  assessmentUrl?: string;

  readinessScore: number | null;

  buyingConfidence: number | null;

  recommendationConfidence: number | null;

  executiveSummary: string;

  financialReadiness: number | null;

  leadershipReadiness: number | null;

  lifestyleAlignment: number | null;

  coachability: number | null;

  nextBestAction: string;

  knownInformation: Array<{ label: string; value: string; icon: "email" | "phone" | "location" | "territory" | "source" }>;

  assessment: {
    label: string;
    detail: string;
    invitationSent: boolean;
    actionLabel: string;
    actionHref?: string;
  };

  activities: CandidateActivityState[];

  lifecycleAction: { label: string } | null;

  brandStrategyHref?: string;

  referralAction?: { label: string; href: string };

  referrals?: { total: number; introduced: number; items: Array<{ brandName: string; statusLabel: string }> };
}

export type CandidateActivityIcon = "candidate" | "assessment" | "discovery" | "brand" | "referral" | "stage" | "activity";
export type CandidateActivityTone = "slate" | "blue" | "teal" | "emerald" | "amber";

export interface CandidateActivityState {
  id: string;
  title: string;
  description?: string;
  dateLabel: string;
  timestamp: string;
  icon: CandidateActivityIcon;
  tone: CandidateActivityTone;
}
