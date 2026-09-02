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

export interface ContactTag { id: string; name: string }
export interface ContactListSummary { id: string; name: string; memberCount: number }

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
  tags: ContactTag[];
  lists: ContactListSummary[];
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
  tagIds?: string[];
  listId?: string;
  emailStatus?: MarketingPermissionStatus;
  smsStatus?: MarketingPermissionStatus;
  candidateStatus?: "candidate" | "not-candidate";
  assignedMembershipId?: string;
  cursor?: { updatedAt: string; internalId: string };
  limit: number;
}

export type ContactBulkOperation = "add-tag" | "remove-tag" | "add-list" | "remove-list" | "lifecycle";
export interface ContactOrganizationOptions { tags: ContactTag[]; lists: ContactListSummary[] }

export const importableContactFields = ["firstName","lastName","preferredName","primaryEmail","primaryPhone","addressLine1","city","stateProvince","postalCode","country","company","titleOccupation","source"] as const;
export type ImportableContactField = typeof importableContactFields[number];
export type ContactImportMapping = Partial<Record<ImportableContactField,string>>;
export interface ContactImportRow { rowNumber:number; values:Record<string,string> }
export interface ContactImportPreview { rows:ContactImportRow[]; valid:number; invalid:number; warnings:string[] }
export interface ContactImportResult { processed:number; created:number; matched:number; invalid:number; errors:{rowNumber:number;message:string}[] }

export interface ContactListPage {
  contacts: ContactRecord[];
  nextCursor: { updatedAt: string; internalId: string } | null;
}
