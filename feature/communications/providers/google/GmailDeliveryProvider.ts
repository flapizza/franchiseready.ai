import { EmailProviderError, type EmailDeliveryProvider, type EmailDeliveryReceipt, type EmailDeliveryRequest } from "../EmailDeliveryProvider";

type GmailResponse = { id?: string; threadId?: string; error?: { message?: string; status?: string } };

export class GmailDeliveryProvider implements EmailDeliveryProvider {
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;
  constructor(fetcher: typeof fetch = fetch, timeoutMs = 15_000) { this.fetcher = fetcher; this.timeoutMs = timeoutMs; }

  async send(request: EmailDeliveryRequest): Promise<EmailDeliveryReceipt> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;
    try {
      response = await this.fetcher("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST", headers: { authorization: `Bearer ${request.accessToken}`, "content-type": "application/json" },
        body: JSON.stringify({ raw: request.raw, ...(request.threadId ? { threadId: request.threadId } : {}) }), signal: controller.signal,
      });
    } catch {
      throw new EmailProviderError("Gmail did not confirm whether the message was accepted.", "ambiguous", false, true);
    } finally { clearTimeout(timeout); }

    const payload = await response.json().catch(() => ({})) as GmailResponse;
    if (response.ok && payload.id) return { providerMessageId: payload.id, providerThreadId: payload.threadId };
    if (response.status === 401) throw new EmailProviderError("Google authorization expired. Reconnect the account.", "credentials", false, false);
    if (response.status === 403) throw new EmailProviderError("Google did not authorize Gmail sending. Reconnect the account.", "scope", false, false);
    if (response.status === 429) throw new EmailProviderError("Gmail quota temporarily prevented delivery.", "quota", true, false);
    if (response.status >= 400 && response.status < 500) throw new EmailProviderError("Gmail rejected the message.", "invalid-message", false, false);
    throw new EmailProviderError("Gmail did not confirm whether the message was accepted.", "ambiguous", false, true);
  }
}
