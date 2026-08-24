import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import type { LooseRpcClient } from "@/feature/connected-email/repositories/supabase-query";

export type CanonicalOutboundStatus = "pending" | "submitting" | "provider-accepted" | "failed-confirmed" | "ambiguous";
export type CanonicalOutboundMessage = {
  id: string; public_id: string; connected_email_account_id: string; candidate_id: string; provider: "google";
  internet_message_id: string; sender_name: string | null; sender_email: string; subject: string; text_body: string;
  status: CanonicalOutboundStatus; provider_message_id: string | null; provider_thread_id: string | null;
  send_idempotency_key: string; created_at: string; sent_at: string | null;
};
type Attempt = { id: string; attempt_number: number };
type Recipient = { display_name: string | null; email_address: string; kind: "to" | "cc" | "bcc" };

export class ProductionEmailRepository {
  constructor(private readonly context: AuthenticatedWorkspaceContext) {}
  private async client(): Promise<LooseRpcClient> { return await createServerSupabaseClient() as unknown as LooseRpcClient; }

  async begin(input: { accountPublicId: string; candidatePublicId: string; idempotencyKey: string; messagePublicId: string;
    internetMessageId: string; subject: string; body: string }): Promise<CanonicalOutboundMessage> {
    const client = await this.client();
    const { data, error } = await client.rpc("begin_outbound_email_send", { target_account_public_id: input.accountPublicId,
      target_candidate_public_id: input.candidatePublicId, idempotency_key: input.idempotencyKey,
      proposed_message_public_id: input.messagePublicId, proposed_internet_message_id: input.internetMessageId,
      proposed_subject: input.subject, proposed_body: input.body });
    if (error || !data) throw new Error("Outbound email intent could not be saved.");
    return data as CanonicalOutboundMessage;
  }

  async claim(messagePublicId: string, isRetry: boolean): Promise<Attempt | null> {
    const { data, error } = await (await this.client()).rpc("claim_outbound_email_attempt",
      { target_message_public_id: messagePublicId, is_retry: isRetry });
    if (error) throw new Error("Outbound email attempt could not be claimed.");
    return data as Attempt | null;
  }

  async complete(messagePublicId: string, attemptId: string, result: { status: Exclude<CanonicalOutboundStatus, "pending" | "submitting">;
    providerMessageId?: string; providerThreadId?: string; errorCode?: string; retryable?: boolean }): Promise<void> {
    const { error } = await (await this.client()).rpc("complete_outbound_email_attempt", { target_message_public_id: messagePublicId,
      target_attempt_id: attemptId, result_status: result.status, result_provider_message_id: result.providerMessageId ?? null,
      result_provider_thread_id: result.providerThreadId ?? null, result_error_code: result.errorCode ?? null,
      result_retryable: result.retryable ?? false });
    if (error) throw new Error("Outbound email result could not be saved.");
  }

  async getOwn(messagePublicId: string): Promise<CanonicalOutboundMessage | null> {
    const { data, error } = await (await this.client()).from("email_messages").select("*").eq("public_id", messagePublicId)
      .eq("organization_id", this.context.organization.id).eq("owner_membership_id", this.context.membership.id).maybeSingle();
    if (error) throw new Error("Outbound email could not be loaded.");
    return data as CanonicalOutboundMessage | null;
  }

  async listByCandidate(candidatePublicId: string): Promise<Array<CanonicalOutboundMessage & { email_recipients: Recipient[] }>> {
    const client = await this.client();
    const { data: candidate, error: candidateError } = await client.from("candidates").select("id").eq("public_id", candidatePublicId)
      .eq("organization_id", this.context.organization.id).maybeSingle();
    if (candidateError || !candidate) return [];
    const { data, error } = await client.from("email_messages").select("*,email_recipients(display_name,email_address,kind)")
      .eq("candidate_id", (candidate as { id: string }).id).eq("owner_membership_id", this.context.membership.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Candidate email history could not be loaded.");
    return data as Array<CanonicalOutboundMessage & { email_recipients: Recipient[] }>;
  }
}
