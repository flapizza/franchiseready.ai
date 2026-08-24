import "server-only";
import { randomUUID } from "node:crypto";
import type { AuthenticatedWorkspaceContext } from "@/feature/identity/models/WorkspaceIdentity";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ConnectedEmailAccountRepository } from "@/feature/connected-email/repositories/ConnectedEmailAccountRepository";
import { ConnectedEmailCredentialService } from "@/feature/connected-email/services/ConnectedEmailCredentialService";
import { SupabaseCandidateRepository } from "@/feature/crm/repositories/SupabaseCandidateRepository";
import { buildMimeMessage } from "../mime/buildMimeMessage";
import { EmailProviderError } from "../providers/EmailDeliveryProvider";
import { GmailDeliveryProvider } from "../providers/google/GmailDeliveryProvider";
import { ProductionEmailRepository, type CanonicalOutboundMessage } from "../repositories/ProductionEmailRepository";

export class ProductionEmailMessageService {
  constructor(private readonly context: AuthenticatedWorkspaceContext) {}

  async send(input: { accountPublicId: string; candidatePublicId: string; subject: string; body: string; idempotencyKey: string }): Promise<CanonicalOutboundMessage> {
    if (input.idempotencyKey.length < 16) throw new Error("A valid send idempotency key is required.");
    const account = await new ConnectedEmailAccountRepository().getOwn(this.context, input.accountPublicId);
    if (!account) throw new Error("The selected Google account is unavailable.");
    const candidateRepository = new SupabaseCandidateRepository(await createServerSupabaseClient() as never, this.context);
    const candidate = await candidateRepository.getById(input.candidatePublicId);
    if (!candidate || candidate.consultantId !== this.context.membership.id || candidate.status !== "active") {
      throw new Error("Email can only be sent to an active candidate assigned to you.");
    }
    const repository = new ProductionEmailRepository(this.context);
    const nonce = randomUUID().replaceAll("-", "");
    const message = await repository.begin({ accountPublicId: account.publicId, candidatePublicId: candidate.id,
      idempotencyKey: input.idempotencyKey, messagePublicId: `email_${nonce}`,
      internetMessageId: `<${nonce}@frangroove.app>`, subject: input.subject, body: input.body });
    if (message.status !== "pending") return message;
    const attempt = await repository.claim(message.public_id, false);
    if (!attempt) return (await repository.getOwn(message.public_id)) ?? message;
    try {
      const accessToken = await new ConnectedEmailCredentialService().getGoogleAccessToken(this.context, account);
      const { raw } = buildMimeMessage({ from: { name: account.displayName, email: account.emailAddress },
        to: [{ name: `${candidate.firstName} ${candidate.lastName}`, email: candidate.email }], subject: message.subject,
        textBody: message.text_body, internetMessageId: message.internet_message_id });
      const receipt = await new GmailDeliveryProvider().send({ accessToken, raw });
      await repository.complete(message.public_id, attempt.id, { status: "provider-accepted",
        providerMessageId: receipt.providerMessageId, providerThreadId: receipt.providerThreadId });
    } catch (error) {
      const providerError = error instanceof EmailProviderError ? error : undefined;
      await repository.complete(message.public_id, attempt.id, { status: providerError?.ambiguous ? "ambiguous" : "failed-confirmed",
        errorCode: providerError?.category ?? "internal", retryable: providerError?.retryable ?? false });
      if (providerError?.ambiguous) throw new Error("Gmail delivery is unconfirmed. This message will not be retried automatically.");
      throw error;
    }
    return (await repository.getOwn(message.public_id)) ?? { ...message, status: "provider-accepted" };
  }

  async retry(candidatePublicId: string, messagePublicId: string): Promise<CanonicalOutboundMessage> {
    const repository = new ProductionEmailRepository(this.context);
    const message = await repository.getOwn(messagePublicId);
    if (!message || message.status !== "failed-confirmed") throw new Error("Only a confirmed failed Gmail attempt can be retried.");
    const account = (await new ConnectedEmailAccountRepository().listOwn(this.context)).find((item) => item.id === message.connected_email_account_id);
    const candidate = await new SupabaseCandidateRepository(await createServerSupabaseClient() as never, this.context).getById(candidatePublicId);
    if (!account || !candidate || candidate.consultantId !== this.context.membership.id) throw new Error("Retry ownership could not be verified.");
    const attempt = await repository.claim(message.public_id, true);
    if (!attempt) throw new Error("This message is no longer available for retry.");
    try {
      const accessToken = await new ConnectedEmailCredentialService().getGoogleAccessToken(this.context, account);
      const { raw } = buildMimeMessage({ from: { name: account.displayName, email: account.emailAddress },
        to: [{ name: `${candidate.firstName} ${candidate.lastName}`, email: candidate.email }], subject: message.subject,
        textBody: message.text_body, internetMessageId: message.internet_message_id });
      const receipt = await new GmailDeliveryProvider().send({ accessToken, raw });
      await repository.complete(message.public_id, attempt.id, { status: "provider-accepted", providerMessageId: receipt.providerMessageId,
        providerThreadId: receipt.providerThreadId });
    } catch (error) {
      const providerError = error instanceof EmailProviderError ? error : undefined;
      await repository.complete(message.public_id, attempt.id, { status: providerError?.ambiguous ? "ambiguous" : "failed-confirmed",
        errorCode: providerError?.category ?? "internal", retryable: providerError?.retryable ?? false });
      throw providerError?.ambiguous ? new Error("Gmail delivery is unconfirmed. This message will not be retried automatically.") : error;
    }
    return (await repository.getOwn(message.public_id)) ?? { ...message, status: "provider-accepted" };
  }
}
