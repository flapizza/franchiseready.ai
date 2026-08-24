export type ConferenceIntake = {
  firstName: string; preferredName?: string; lastName: string; email: string; mobilePhone: string;
  streetAddress: string; addressLine2?: string; city: string; stateProvince: string; postalCode: string; country: string;
  occupationTitle: string; currentEmployer?: string; linkedInProfile?: string;
  ownedBusinessBefore: "yes" | "no"; ownershipExperience?: string;
  exploredFranchiseBefore: "yes" | "no"; preferredContactMethod: "phone" | "text" | "email";
  bestContactTime: "morning" | "afternoon" | "evening";
};

export type ConferenceQuestion = {
  id: string; section: number; prompt: string; kind: "single" | "multi" | "context";
  options?: string[]; exclusive?: string[]; primaryOf?: string; evidence: string;
};

export type ConferenceAnswers = Record<string, string[]>;
export type ConferenceAssessmentStatus = "created" | "in-progress" | "submitted" | "analyzed" | "abandoned" | "expired";
export type EvidenceCategory = "capability" | "preference" | "motivation" | "constraint";
export type AssessmentEvidence = { id: string; questionId: string; category: EvidenceCategory; dimension: string; statement: string; strength: number; confidence: number };
export type AssessmentTension = { title: string; explanation: string; evidenceRefs: string[]; priority: "high" | "normal" };
export type DiscoveryPriority = { title: string; whyItMatters: string; suggestedQuestion: string; evidenceRefs: string[]; priority: "high" | "normal"; confidence: number };
export type OpportunityCharacteristic = { characteristic: string; disposition: "Attractive" | "Acceptable" | "Validate" | "Potential Constraint"; reason: string };
export type OwnershipProfile = { primary: string; supporting: string[]; confidence: number; motivations: string[]; operatingPreferences: string[]; strengths: string[]; characteristics: string[]; consultantQuestions: string[] };
export type ConferenceAnalysis = {
  version: "franchise-ownership-v1"; evidence: AssessmentEvidence[];
  dimensions: Record<string, number>; tensions: AssessmentTension[]; discoveryPriorities: DiscoveryPriority[];
  opportunityCharacteristics: OpportunityCharacteristic[]; ownershipProfile: OwnershipProfile;
  executiveSummary: string; financial: { netWorth: string; liquidCapital: string; investmentRange: string; disclaimer: string };
};
export type ConferenceAssessmentRecord = {
  id: string; candidateId: string; status: ConferenceAssessmentStatus; intake: ConferenceIntake; answers: ConferenceAnswers;
  startedAt: string; completedAt: string; durationSeconds: number; analysis: ConferenceAnalysis;
};
