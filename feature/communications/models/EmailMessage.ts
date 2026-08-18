export type EmailDirection = "outbound" | "inbound";
export type EmailBodyFormat = "plain-text" | "html";
export type EmailDeliveryStatus = "draft" | "queued" | "sending" | "sent" | "delivered" | "failed";

export interface EmailIdentity { name: string; email: string }
export interface EmailRecipient extends EmailIdentity { kind: "to" | "cc" | "bcc" }
export interface EmailTrackingSettings { trackOpens: boolean; trackLinks: boolean }
export interface EmailLink { linkId: string; messageId: string; originalUrl: string; displayLabel?: string }

export interface EmailMessage {
  messageId: string;
  candidateId: string;
  consultantId: string;
  threadId?: string;
  direction: EmailDirection;
  sender: EmailIdentity;
  recipients: EmailRecipient[];
  subject: string;
  body: string;
  bodyFormat: EmailBodyFormat;
  createdAt: string;
  sentAt?: string;
  providerMessageId?: string;
  deliveryStatus: EmailDeliveryStatus;
  deliveryFailureReason?: string;
  tracking: EmailTrackingSettings;
  links: EmailLink[];
  relatedBrandId?: string;
  relatedReferralId?: string;
  templateId?: string;
  sendIdempotencyKey: string;
  externallyDelivered: boolean;
}
