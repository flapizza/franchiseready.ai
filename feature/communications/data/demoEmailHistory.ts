import type { EmailMessage } from "../models/EmailMessage";
import type { EmailEngagementEvent } from "../models/EmailEngagementEvent";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";

const message = (candidateId: string, subject: string, body: string, sentAt: string, links: Array<[string, string, string]> = []): EmailMessage => ({
  messageId: `email-seed-${candidateId}`, candidateId, consultantId: demoConsultant.id, threadId: `thread-${candidateId}`,
  direction: "outbound", sender: { name: demoConsultant.displayName, email: demoConsultant.email! },
  recipients: [{ kind: "to", name: candidateId.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "), email: `${candidateId.replace("-", ".")}@example.com` }],
  subject, body, bodyFormat: "plain-text", createdAt: sentAt, sentAt, deliveryStatus: "delivered", tracking: { trackOpens: true, trackLinks: true },
  links: links.map(([linkId, originalUrl, displayLabel]) => ({ linkId, messageId: `email-seed-${candidateId}`, originalUrl, displayLabel })),
  sendIdempotencyKey: `seed-${candidateId}`, externallyDelivered: false, providerMessageId: `demo:seed:${candidateId}`,
});

export const demoEmailMessages: EmailMessage[] = [
  message("sarah-williams", "ERA Group information and next steps", "Here are the ERA Group materials and a link to schedule our next call.", "2026-08-17T14:00:00.000Z", [["era", "https://www.eragroup.com", "ERA Group website"], ["schedule", "https://cal.example.com/jim", "Schedule Next Call"]]),
  message("mike-lavalle", "Discovery follow-up", "A quick follow-up from our Discovery conversation.", "2026-08-16T15:00:00.000Z"),
  message("elena-rodriguez", "Financing information", "Here is the financing information we discussed.", "2026-08-15T16:00:00.000Z", [["financing", "https://example.com/financing", "Financing Information"]]),
];

export const demoEmailEvents: EmailEngagementEvent[] = [
  { eventId: "seed-sarah-open-1", messageId: "email-seed-sarah-williams", candidateId: "sarah-williams", type: "open", occurredAt: "2026-08-17T14:12:00.000Z" },
  { eventId: "seed-sarah-open-2", messageId: "email-seed-sarah-williams", candidateId: "sarah-williams", type: "open", occurredAt: "2026-08-17T16:20:00.000Z" },
  { eventId: "seed-sarah-open-3", messageId: "email-seed-sarah-williams", candidateId: "sarah-williams", type: "open", occurredAt: "2026-08-18T13:10:00.000Z" },
  { eventId: "seed-sarah-click", messageId: "email-seed-sarah-williams", candidateId: "sarah-williams", type: "link-click", linkId: "era", url: "https://www.eragroup.com", occurredAt: "2026-08-18T13:12:00.000Z" },
  { eventId: "seed-elena-open", messageId: "email-seed-elena-rodriguez", candidateId: "elena-rodriguez", type: "open", occurredAt: "2026-08-15T17:00:00.000Z" },
  { eventId: "seed-elena-click", messageId: "email-seed-elena-rodriguez", candidateId: "elena-rodriguez", type: "link-click", linkId: "financing", url: "https://example.com/financing", occurredAt: "2026-08-15T17:02:00.000Z" },
  { eventId: "seed-elena-reply", messageId: "email-seed-elena-rodriguez", candidateId: "elena-rodriguez", type: "reply", occurredAt: "2026-08-15T18:00:00.000Z" },
];
