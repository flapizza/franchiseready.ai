export type MembershipOnboardingStatus = "not-started" | "in-progress" | "completed";
export interface MembershipOnboardingState { membershipId: string; organizationId: string; status: MembershipOnboardingStatus; currentStep: string | null; completedSteps: string[]; onboardingVersion: number; }
