import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { DemoEmailRepository } from "../repositories/DemoEmailRepository";
import { DemoEmailDeliveryService } from "./DemoEmailDeliveryService";
import type { EmailMessage, EmailLink } from "../models/EmailMessage";
import { demoCandidateOverlayStore } from "@/feature/crm/repositories/DemoCandidateOverlayStore";

const urlPattern = /https?:\/\/[^\s<>()]+/g;
const labelUrl = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "Shared link"; } };

export class EmailMessageService {
  constructor(private readonly repository = new DemoEmailRepository(), private readonly delivery = new DemoEmailDeliveryService(), private readonly candidates = new SeedCandidateRepository()) {}

  async send(input: { candidateId: string; subject: string; body: string; idempotencyKey: string }): Promise<EmailMessage> {
    const existing = this.repository.findByIdempotencyKey(input.idempotencyKey);
    if (existing) return existing;
    const candidate = await this.candidates.getById(input.candidateId);
    if (!candidate || candidate.consultantId !== demoConsultant.id) throw new Error("Candidate not found for this consultant.");
    if (!demoConsultant.email) throw new Error("Configure the consultant sending email before composing a message.");
    if (!input.subject.trim() || !input.body.trim()) throw new Error("Subject and message are required.");
    const messageId = `email-${crypto.randomUUID()}`;
    const links: EmailLink[] = [...input.body.matchAll(urlPattern)].map((match, index) => ({ linkId: `${messageId}:link:${index + 1}`, messageId, originalUrl: match[0], displayLabel: labelUrl(match[0]) }));
    let message: EmailMessage = { messageId, candidateId: candidate.id, consultantId: demoConsultant.id, threadId: `thread-${candidate.id}`, direction: "outbound",
      sender: { name: demoConsultant.displayName, email: demoConsultant.email }, recipients: [{ kind: "to", name: `${candidate.firstName} ${candidate.lastName}`, email: candidate.email }],
      subject: input.subject.trim(), body: input.body.trim(), bodyFormat: "plain-text", createdAt: new Date().toISOString(), deliveryStatus: "sending", tracking: { trackOpens: true, trackLinks: true }, links,
      sendIdempotencyKey: input.idempotencyKey, externallyDelivered: false };
    this.repository.saveMessage(message);
    if (demoCandidateOverlayStore.consumeCandidateEmailDeliveryFailure(candidate.id)) demoCandidateOverlayStore.failNextEmailDelivery(messageId);
    const result = await this.delivery.deliver(message);
    message = { ...message, deliveryStatus: result.status, sentAt: result.sentAt, providerMessageId: result.providerMessageId,
      deliveryFailureReason: result.failureReason, externallyDelivered: result.externallyDelivered };
    this.repository.saveMessage(message);
    return message;
  }

  async retry(candidateId: string, messageId: string): Promise<EmailMessage> {
    const message = this.repository.getMessage(candidateId, messageId);
    if (!message || message.candidateId !== candidateId || message.consultantId !== demoConsultant.id) throw new Error("Email message not found for this candidate.");
    if (message.deliveryStatus !== "failed") return message;
    const result = await this.delivery.deliver({ ...message, deliveryStatus: "sending" });
    const updated = { ...message, deliveryStatus: result.status, sentAt: result.sentAt ?? message.sentAt, providerMessageId: result.providerMessageId,
      deliveryFailureReason: result.failureReason, externallyDelivered: result.externallyDelivered };
    this.repository.saveMessage(updated); return updated;
  }
}
