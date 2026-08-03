export type ConsultantNoteType =
  | "discovery"
  | "validation"
  | "follow-up"
  | "funding"
  | "brand-discussion"
  | "meeting"
  | "general";

export type ConsultantNoteVisibility =
  | "private"
  | "team";

export interface ConsultantNote {
  id: string;

  candidateId: string;

  consultantId: string;

  type: ConsultantNoteType;

  title: string;

  content: string;

  aiSummary?: string;

  tags: string[];

  visibility: ConsultantNoteVisibility;

  createdAt: string;

  updatedAt: string;
}