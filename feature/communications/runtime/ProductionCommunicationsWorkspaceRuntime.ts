import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import { SupabaseCandidateRepository } from "@/feature/crm/repositories/SupabaseCandidateRepository";
import { ConnectedEmailAccountRepository } from "@/feature/connected-email/repositories/ConnectedEmailAccountRepository";
import { ProductionEmailRepository } from "../repositories/ProductionEmailRepository";
import type { CommunicationsFilter, CommunicationsMessageView, CommunicationsWorkspaceState } from "../models/CommunicationsWorkspaceState";

const filters: CommunicationsFilter[] = ["all", "replied", "opened", "clicked", "no-engagement", "needs-follow-up", "failed"];
export class ProductionCommunicationsWorkspaceRuntime {
  constructor(private readonly context: AuthenticatedWorkspaceContext) {}
  async build(input: { filter?: string; query?: string; messageId?: string }): Promise<CommunicationsWorkspaceState> {
    const candidates = (await new SupabaseCandidateRepository(await createServerSupabaseClient() as never, this.context).getAll())
      .filter((item) => item.consultantId === this.context.membership.id);
    const repository = new ProductionEmailRepository(this.context);
    const raw = (await Promise.all(candidates.map(async (candidate) => (await repository.listByCandidate(candidate.id)).map((row): CommunicationsMessageView => ({
      messageId: row.public_id, candidateId: candidate.id, candidateName: `${candidate.firstName} ${candidate.lastName}`,
      candidateEmail: candidate.email, candidateHref: `/crm/candidates/${candidate.id}`, direction: "outbound", subject: row.subject,
      from: `${row.sender_name ?? row.sender_email} <${row.sender_email}>`, to: row.email_recipients.filter((item) => item.kind === "to").map((item) => item.email_address).join(", "),
      sentAt: row.sent_at ?? undefined, sentLabel: row.sent_at ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(row.sent_at)) : undefined,
      deliveryStatus: row.status === "provider-accepted" ? "sent" : row.status === "failed-confirmed" ? "failed" : row.status,
      failureReason: row.status === "failed-confirmed" ? "Gmail confirmed that this attempt failed." : undefined, body: row.text_body,
      externallyDelivered: row.status === "provider-accepted", openCount: 0, replyCount: 0, links: [], totalClicks: 0,
      engagementLabel: "Not tracked", engagementReasons: [], needsFollowUp: row.status === "failed-confirmed",
      followUpReason: row.status === "failed-confirmed" ? "Delivery failed. Correct the authorization or message issue before retrying." : undefined,
    }))))).flat().sort((a, b) => Date.parse(b.sentAt ?? "") - Date.parse(a.sentAt ?? ""));
    const filter = filters.includes(input.filter as CommunicationsFilter) ? input.filter as CommunicationsFilter : "all";
    const query = input.query?.trim().toLowerCase() ?? "";
    const matches = (message: CommunicationsMessageView, selected: CommunicationsFilter) => selected === "all" ||
      (selected === "failed" && message.deliveryStatus === "failed") || (selected === "needs-follow-up" && message.needsFollowUp) ||
      (selected === "no-engagement" && message.deliveryStatus !== "failed");
    const messages = raw.filter((item) => matches(item, filter) && (!query || `${item.candidateName} ${item.subject} ${item.from} ${item.to}`.toLowerCase().includes(query)));
    const accounts = await new ConnectedEmailAccountRepository().listOwn(this.context);
    const account = accounts.find((item) => item.provider === "google" && item.status === "connected");
    return { messages, selected: messages.find((item) => item.messageId === input.messageId) ?? messages[0], filter, query,
      counts: Object.fromEntries(filters.map((item) => [item, raw.filter((message) => matches(message, item)).length])) as Record<CommunicationsFilter, number>,
      candidates: candidates.map((item) => ({ id: item.id, name: `${item.firstName} ${item.lastName}`, email: item.email })),
      sender: { name: account?.displayName ?? "FranGroove", email: account?.emailAddress ?? null, accountId: account?.publicId, externalDelivery: true } };
  }
}
