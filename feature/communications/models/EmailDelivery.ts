import type { EmailDeliveryStatus } from "./EmailMessage";

export interface EmailDelivery {
  messageId: string;
  status: EmailDeliveryStatus;
  provider: string;
  attemptedAt: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  failureReason?: string;
  providerMessageId?: string;
  externallyDelivered: boolean;
}
