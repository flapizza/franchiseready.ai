import { demoConsultant } from "@/feature/demo/data/demoConsultant";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { DemoEmailRepository } from "../repositories/DemoEmailRepository";
import { EmailCommunicationRuntime } from "./EmailCommunicationRuntime";
import type { CommunicationsFilter, CommunicationsMessageView, CommunicationsWorkspaceState } from "../models/CommunicationsWorkspaceState";

const filters: CommunicationsFilter[] = ["all", "replied", "opened", "clicked", "no-engagement", "needs-follow-up", "failed"];

function followUp(message: CommunicationsMessageView): string | undefined {
  if (message.deliveryStatus === "failed") return "Delivery failed. Correct the delivery issue and retry the preserved message.";
  if (message.replyCount) return "The candidate replied and is waiting for a consultant response.";
  if (message.totalClicks > 0 && message.openCount > 1) return "Repeated opens and a tracked-link click show timely, specific interest.";
  return undefined;
}

function matches(message: CommunicationsMessageView, filter: CommunicationsFilter): boolean {
  if (filter === "replied") return message.replyCount > 0;
  if (filter === "opened") return message.openCount > 0;
  if (filter === "clicked") return message.totalClicks > 0;
  if (filter === "no-engagement") return message.deliveryStatus !== "failed" && message.openCount === 0 && message.totalClicks === 0 && message.replyCount === 0;
  if (filter === "needs-follow-up") return message.needsFollowUp;
  if (filter === "failed") return message.deliveryStatus === "failed";
  return true;
}

export class CommunicationsWorkspaceRuntime {
  constructor(
    private readonly candidates = new SeedCandidateRepository(),
    private readonly emails = new DemoEmailRepository(),
    private readonly communication = new EmailCommunicationRuntime(emails),
  ) {}

  async build(input: { filter?: string; query?: string; messageId?: string }): Promise<CommunicationsWorkspaceState> {
    const candidates = (await this.candidates.getAll()).filter((candidate) => candidate.consultantId === demoConsultant.id);
    const names = new Map(candidates.map((candidate) => [candidate.id, `${candidate.firstName} ${candidate.lastName}`]));
    const raw: CommunicationsMessageView[] = candidates.flatMap((candidate) => this.communication.load(candidate.id).map((message) => {
      const source = this.emails.getMessage(candidate.id, message.messageId);
      const view: CommunicationsMessageView = {
        ...message,
        candidateId: candidate.id,
        candidateName: names.get(candidate.id)!,
        candidateEmail: candidate.email,
        candidateHref: `/crm/candidates/${candidate.id}`,
        direction: source?.direction ?? "outbound",
        totalClicks: message.links.reduce((total, link) => total + link.clickCount, 0),
        needsFollowUp: false,
      };
      const reason = this.emails.isFollowUpDismissed(message.messageId) ? undefined : followUp(view);
      return { ...view, needsFollowUp: Boolean(reason), followUpReason: reason };
    })).sort((a, b) => Date.parse(b.sentAt ?? "") - Date.parse(a.sentAt ?? ""));
    const filter = filters.includes(input.filter as CommunicationsFilter) ? input.filter as CommunicationsFilter : "all";
    const query = input.query?.trim() ?? "";
    const normalized = query.toLowerCase();
    const messages = raw.filter((message) => matches(message, filter) && (!normalized || [message.candidateName, message.subject, message.from, message.to].some((value) => value.toLowerCase().includes(normalized))));
    const selected = messages.find((message) => message.messageId === input.messageId) ?? messages[0];
    return {
      messages, selected, filter, query,
      counts: Object.fromEntries(filters.map((item) => [item, raw.filter((message) => matches(message, item)).length])) as Record<CommunicationsFilter, number>,
      candidates: candidates.map((candidate) => ({ id: candidate.id, name: names.get(candidate.id)!, email: candidate.email })).sort((a, b) => a.name.localeCompare(b.name)),
      sender: { name: demoConsultant.displayName, email: demoConsultant.email ?? null },
    };
  }
}
