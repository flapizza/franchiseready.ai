import type { EmailEngagementEvent } from "../models/EmailEngagementEvent";

export type EmailEngagementLevel = "none" | "low" | "moderate" | "high";
export interface EmailEngagementSignal { level: EmailEngagementLevel; label: string; reasons: string[]; nextAction?: string }

export class EmailEngagementIntelligenceService {
  derive(events: EmailEngagementEvent[]): EmailEngagementSignal {
    const opens = events.filter((event) => event.type === "open").length;
    const clicks = events.filter((event) => event.type === "link-click").length;
    const replies = events.filter((event) => event.type === "reply").length;
    const reasons = [opens ? `opened ${opens} time${opens === 1 ? "" : "s"}` : "", clicks ? `clicked ${clicks} link${clicks === 1 ? "" : "s"}` : "", replies ? "replied" : ""].filter(Boolean);
    if (replies || clicks > 1 || (clicks && opens > 1)) return { level: "high", label: "High engagement", reasons, nextAction: "Follow up while recent interest is active." };
    if (clicks || opens > 1) return { level: "moderate", label: "Moderate engagement", reasons, nextAction: "Consider a timely personal follow-up." };
    if (opens) return { level: "low", label: "Light engagement", reasons, nextAction: "Monitor for a stronger signal before inferring interest." };
    return { level: "none", label: "No engagement yet", reasons: [] };
  }
}
