export type EmailEngagementEventType = "open" | "link-click" | "reply" | "bounced" | "complained" | "unsubscribed";

export interface EmailEngagementEvent {
  eventId: string;
  messageId: string;
  candidateId: string;
  type: EmailEngagementEventType;
  occurredAt: string;
  providerEventId?: string;
  linkId?: string;
  url?: string;
  metadata?: Record<string, string | number | boolean>;
}
