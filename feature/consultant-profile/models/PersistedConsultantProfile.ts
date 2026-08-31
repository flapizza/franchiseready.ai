export interface PersistedConsultantProfile {
  membershipId: string;
  organizationId: string;
  displayName: string | null;
  professionalTitle: string | null;
  professionalEmail: string | null;
  professionalPhone: string | null;
  linkedInUrl: string | null;
  schedulingUrl: string | null;
}

export type ConsultantProfileInput = Omit<PersistedConsultantProfile, "membershipId" | "organizationId">;
