import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import type { EmailDeliveryService } from "./EmailDeliveryService";
import type { EmailMessage } from "../models/EmailMessage";

export class DemoEmailDeliveryService implements EmailDeliveryService {
  async deliver(message: EmailMessage) {
    const attemptedAt = new Date().toISOString();
    if (demoCandidateOverlayStore.consumeEmailDeliveryFailure(message.messageId)) {
      return { messageId: message.messageId, status: "failed" as const, provider: "demo", attemptedAt, failedAt: attemptedAt,
        failureReason: "Demo provider simulated a transport failure.", externallyDelivered: false };
    }
    return { messageId: message.messageId, status: "delivered" as const, provider: "demo", attemptedAt, sentAt: attemptedAt,
      deliveredAt: attemptedAt, providerMessageId: `demo:${message.messageId}`, externallyDelivered: false };
  }
}
