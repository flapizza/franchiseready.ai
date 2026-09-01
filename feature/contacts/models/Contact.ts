export type ContactLifecycleStatus =
  | "prospect"
  | "engaged"
  | "active-candidate"
  | "nurture"
  | "closed-placed"
  | "historical";

export type MarketingPermissionStatus = "unknown" | "opted-in" | "opted-out" | "suppressed";

export interface ContactCandidateRelationship {
  publicId: string;
  status: string;
  pipelineStageId: string;
}

export interface ContactRecord {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  displayName: string;
  primaryEmail: string;
  primaryPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: "US" | "CA";
  source: string;
  company: string;
  titleOccupation: string;
  lifecycleStatus: ContactLifecycleStatus;
  marketingEmailStatus: MarketingPermissionStatus;
  marketingSmsStatus: MarketingPermissionStatus;
  assignedMembershipId: string;
  assignedConsultantName: string;
  createdAt: string;
  updatedAt: string;
  candidate: ContactCandidateRelationship | null;
}

export interface ContactInput {
  firstName: string;
  lastName: string;
  preferredName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country: "US" | "CA";
  source: string;
  company?: string;
  titleOccupation?: string;
  lifecycleStatus: ContactLifecycleStatus;
  assignedMembershipId?: string;
}

export interface ContactListQuery {
  search?: string;
  lifecycle?: ContactLifecycleStatus;
  cursor?: { updatedAt: string; internalId: string };
  limit: number;
}

export interface ContactListPage {
  contacts: ContactRecord[];
  nextCursor: { updatedAt: string; internalId: string } | null;
}
