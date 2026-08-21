import type { EmailMessageView } from "../runtime/EmailCommunicationRuntime";

export type CommunicationsFilter = "all" | "replied" | "opened" | "clicked" | "no-engagement" | "needs-follow-up" | "failed";

export interface CommunicationsMessageView extends EmailMessageView {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateHref: string;
  direction: "inbound" | "outbound";
  totalClicks: number;
  needsFollowUp: boolean;
  followUpReason?: string;
}

export interface CommunicationsWorkspaceState {
  messages: CommunicationsMessageView[];
  selected?: CommunicationsMessageView;
  filter: CommunicationsFilter;
  query: string;
  counts: Record<CommunicationsFilter, number>;
  candidates: Array<{ id: string; name: string; email: string }>;
  sender: { name: string; email: string | null };
}
