import { DemoEmailRepository } from "../repositories/DemoEmailRepository";
import { EmailEngagementIntelligenceService } from "../services/EmailEngagementIntelligenceService";

const stamp = (value?: string) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : undefined;

export interface EmailMessageView {
  messageId: string; subject: string; from: string; to: string; sentAt?: string; sentLabel?: string; deliveryStatus: string; failureReason?: string;
  body: string; externallyDelivered: boolean; openCount: number; firstOpen?: string; lastOpen?: string; replyCount: number;
  links: Array<{ linkId: string; label: string; originalUrl: string; clickCount: number; firstClick?: string; lastClick?: string }>;
  engagementLabel: string; engagementReasons: string[]; nextAction?: string; mostRecentEngagement?: string;
}

export class EmailCommunicationRuntime {
  constructor(private readonly repository = new DemoEmailRepository(), private readonly intelligence = new EmailEngagementIntelligenceService()) {}
  load(candidateId: string): EmailMessageView[] {
    const events = this.repository.getEvents(candidateId);
    return this.repository.getMessages(candidateId).map((message) => {
      const own = events.filter((event) => event.messageId === message.messageId);
      const opens = own.filter((event) => event.type === "open");
      const replies = own.filter((event) => event.type === "reply");
      const signal = this.intelligence.derive(own);
      const recent = own.at(-1);
      return { messageId: message.messageId, subject: message.subject, from: `${message.sender.name} <${message.sender.email}>`,
        to: message.recipients.filter((item) => item.kind === "to").map((item) => `${item.name} <${item.email}>`).join(", "), sentAt: message.sentAt, sentLabel: stamp(message.sentAt),
        deliveryStatus: message.deliveryStatus, failureReason: message.deliveryFailureReason, body: message.body, externallyDelivered: message.externallyDelivered,
        openCount: opens.length, firstOpen: stamp(opens[0]?.occurredAt), lastOpen: stamp(opens.at(-1)?.occurredAt), replyCount: replies.length,
        links: message.links.map((link) => { const clicks = own.filter((event) => event.type === "link-click" && event.linkId === link.linkId); return { ...link,
          label: link.displayLabel ?? labelDestination(link.originalUrl), clickCount: clicks.length, firstClick: stamp(clicks[0]?.occurredAt), lastClick: stamp(clicks.at(-1)?.occurredAt) }; }),
        engagementLabel: signal.label, engagementReasons: signal.reasons, nextAction: signal.nextAction,
        mostRecentEngagement: recent ? `${recent.type === "link-click" ? message.links.find((link) => link.linkId === recent.linkId)?.displayLabel ?? "Link clicked" : recent.type === "open" ? "Email opened" : recent.type === "reply" ? "Candidate replied" : recent.type} · ${stamp(recent.occurredAt)}` : undefined };
    });
  }
}

function labelDestination(url: string): string { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "Shared link"; } }
