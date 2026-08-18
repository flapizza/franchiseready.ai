import "server-only";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";
import { demoEmailEvents, demoEmailMessages } from "../data/demoEmailHistory";
import type { EmailMessage } from "../models/EmailMessage";
import type { EmailEngagementEvent } from "../models/EmailEngagementEvent";

export class DemoEmailRepository {
  getMessages(candidateId: string): EmailMessage[] {
    const overlay = demoCandidateOverlayStore.getEmailMessages(candidateId);
    return [...demoEmailMessages.filter((item) => item.candidateId === candidateId), ...overlay]
      .sort((a, b) => Date.parse(b.sentAt ?? b.createdAt) - Date.parse(a.sentAt ?? a.createdAt));
  }
  getMessage(candidateId: string, messageId: string): EmailMessage | null {
    return this.getMessages(candidateId).find((item) => item.messageId === messageId) ?? null;
  }
  findByIdempotencyKey(key: string): EmailMessage | null { return demoCandidateOverlayStore.getEmailMessageByIdempotencyKey(key); }
  saveMessage(message: EmailMessage): void { demoCandidateOverlayStore.saveEmailMessage(message); }
  getEvents(candidateId: string): EmailEngagementEvent[] { return [...demoEmailEvents.filter((item) => item.candidateId === candidateId), ...demoCandidateOverlayStore.getEmailEvents(candidateId)].sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt)); }
  addEvent(event: EmailEngagementEvent): boolean { return demoCandidateOverlayStore.addEmailEvent(event); }
}
