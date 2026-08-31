import type { EmailMessage } from "../models/EmailMessage";
import type { EmailEngagementEvent } from "../models/EmailEngagementEvent";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { conferenceDemoIso } from "@/feature/demo/time/conferenceDemoClock";

const message = (candidateId: string, subject: string, body: string, sentAt: string, links: Array<[string, string, string]> = [], delivery: Pick<EmailMessage, "deliveryStatus" | "deliveryFailureReason"> = { deliveryStatus: "delivered" }): EmailMessage => ({
  messageId: `email-seed-${candidateId}`, candidateId, consultantId: demoConsultant.id, threadId: `thread-${candidateId}`,
  direction: "outbound", sender: { name: demoConsultant.displayName, email: demoConsultant.email! },
  recipients: [{ kind: "to", name: candidateId.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "), email: `${candidateId.replace("-", ".")}@example.com` }],
  subject, body, bodyFormat: "plain-text", createdAt: sentAt, sentAt, ...delivery, tracking: { trackOpens: true, trackLinks: true },
  links: links.map(([linkId, originalUrl, displayLabel]) => ({ linkId, messageId: `email-seed-${candidateId}`, originalUrl, displayLabel })),
  sendIdempotencyKey: `seed-${candidateId}`, externallyDelivered: false, providerMessageId: `demo:seed:${candidateId}`,
});

export const demoEmailMessages: EmailMessage[] = [
  message("sarah-williams", "ERA Group information and next steps", "Here are the ERA Group materials and a link to schedule our next call.", conferenceDemoIso(-1, 10), [["era", "https://www.eragroup.com", "ERA Group website"], ["schedule", "https://cal.example.com/jim", "Schedule Next Call"]]),
  message("mike-lavalle", "Discovery follow-up", "A quick follow-up from our Discovery conversation.", conferenceDemoIso(-2, 11)),
  message("elena-rodriguez", "Financing information", "Here is the financing information we discussed.", conferenceDemoIso(-3, 12), [["financing", "https://example.com/financing", "Financing Information"]]),
  message("robert-king", "Introduction follow-up", "I wanted to make sure you received the introduction details.", conferenceDemoIso(-4, 11, 30), [], { deliveryStatus: "failed", deliveryFailureReason: "Demo provider rejected the recipient address." }),
];

export const demoEmailEvents: EmailEngagementEvent[] = [
  { eventId: "seed-sarah-open-1", messageId: "email-seed-sarah-williams", candidateId: "sarah-williams", type: "open", occurredAt: conferenceDemoIso(-1, 10, 12) },
  { eventId: "seed-sarah-open-2", messageId: "email-seed-sarah-williams", candidateId: "sarah-williams", type: "open", occurredAt: conferenceDemoIso(-1, 12, 20) },
  { eventId: "seed-sarah-open-3", messageId: "email-seed-sarah-williams", candidateId: "sarah-williams", type: "open", occurredAt: conferenceDemoIso(0, 8, 10) },
  { eventId: "seed-sarah-click", messageId: "email-seed-sarah-williams", candidateId: "sarah-williams", type: "link-click", linkId: "era", url: "https://www.eragroup.com", occurredAt: conferenceDemoIso(0, 8, 12) },
  { eventId: "seed-elena-open", messageId: "email-seed-elena-rodriguez", candidateId: "elena-rodriguez", type: "open", occurredAt: conferenceDemoIso(-3, 13) },
  { eventId: "seed-elena-click", messageId: "email-seed-elena-rodriguez", candidateId: "elena-rodriguez", type: "link-click", linkId: "financing", url: "https://example.com/financing", occurredAt: conferenceDemoIso(-3, 13, 2) },
  { eventId: "seed-elena-reply", messageId: "email-seed-elena-rodriguez", candidateId: "elena-rodriguez", type: "reply", occurredAt: conferenceDemoIso(-3, 14) },
];
